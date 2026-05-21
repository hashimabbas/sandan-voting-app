<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Unit;
use App\Models\PaymentSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\URL;

class OwnerPaymentController extends Controller
{
    /**
     * Initiate a payment via Thawani.
     */
    public function initiateThawaniPayment(Request $request)
    {
        $owner = Auth::guard('owner')->user();
        if (!$owner) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $request->validate([
            'unit_id' => [
                'required',
                'integer',
                Rule::exists('units', 'id')->where(fn($q) => $q->where('owner_id_no', $owner->owner_id_no)),
            ],
            'amount' => 'required|numeric|min:0.1',
        ]);

        $unit = Unit::find($request->unit_id);
        if (!$unit) {
            return response()->json(['error' => 'Selected unit not found.'], 404);
        }

        if ($request->amount > $unit->balance) {
            return response()->json([
                'error' => 'Payment amount cannot exceed the outstanding balance of ' . number_format($unit->balance, 3),
            ], 422);
        }

        $secretKey = env('THAWANI_SECRET_KEY');
        $publishableKey = env('THAWANI_PUBLISHABLE_KEY');
        $thawaniBaseUrl = env('THAWANI_BASE_URL', 'https://uatcheckout.thawani.om');

        $successUrl = URL::route('owner.payment.success', [], true);
        $cancelUrl = URL::route('owner.payment.cancel', [], true);

        $clientReferenceId = 'OWNER-' . $owner->id . '-UNIT-' . $unit->id . '-TXN-' . uniqid();

        try {
            $thawaniResponse = Http::withHeaders([
                'Content-Type' => 'application/json',
                'thawani-api-key' => $secretKey,
            ])->post("{$thawaniBaseUrl}/api/v1/checkout/session", [
                'client_reference_id' => $clientReferenceId,
                'mode' => 'payment',
                'products' => [
                    [
                        'name' => 'Payment for Unit ' . $unit->unit_code,
                        'quantity' => 1,
                        'unit_amount' => (int)($request->amount * 1000),
                    ],
                ],
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'metadata' => [
                    'owner_id' => $owner->id,
                    'unit_id' => $unit->id,
                    'requested_amount' => $request->amount,
                    'unit_code' => $unit->unit_code,
                    'client_reference_id' => $clientReferenceId,
                ],
            ]);

            $responseData = $thawaniResponse->json();

            if (!$thawaniResponse->successful() || empty($responseData['success'])) {
                $errorMessage = $responseData['description'] ?? 'Unknown Thawani API error.';
                return response()->json(['error' => $errorMessage], 500);
            }

            $sessionId = $responseData['data']['session_id'];
            $checkoutUrl = "{$thawaniBaseUrl}/pay/{$sessionId}?key={$publishableKey}";

            // 💾 Save payment session
            PaymentSession::create([
                'owner_id' => $owner->id,
                'unit_id' => $unit->id,
                'session_id' => $sessionId,
                'client_reference_id' => $clientReferenceId,
                'amount' => $request->amount,
                'status' => 'pending',
            ]);

            return response()->json([
                'redirectUrl' => $checkoutUrl,
                'session_id' => $sessionId,
            ]);

        } catch (\Exception $e) {
            Log::error('Thawani initiate error', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Payment initiation failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Handle payment success callback from Thawani.
     */
    public function handleThawaniSuccess(Request $request): RedirectResponse
    {
        $owner = Auth::guard('owner')->user();
        if (!$owner) {
            return redirect()->route('owner_login')->with('error', 'Session expired. Please log in again.');
        }

        // 🧠 Get the latest pending payment session for this owner
        $paymentSession = PaymentSession::where('owner_id', $owner->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        if (!$paymentSession) {
            Log::error('Thawani success: No pending session found.', ['owner' => $owner->id]);
            return redirect()->route('owner_dashboard')->with('error', 'No payment session found.');
        }

        $sessionId = $paymentSession->session_id;
        $secretKey = env('THAWANI_SECRET_KEY');
        $thawaniBaseUrl = env('THAWANI_BASE_URL', 'https://uatcheckout.thawani.om');

        try {
            $response = Http::withHeaders([
                'thawani-api-key' => $secretKey,
            ])->get("{$thawaniBaseUrl}/api/v1/checkout/session/{$sessionId}");

            $responseData = $response->json();
            Log::info('Thawani success verification response', $responseData);

            if ($response->failed() || !isset($responseData['data']['payment_status']) || $responseData['data']['payment_status'] !== 'paid') {
                $paymentSession->update(['status' => 'failed']);
                return redirect()->route('owner_dashboard')->with('error', 'Payment verification failed or not completed.');
            }

            // ✅ Payment successful — mark session as paid
            $paymentSession->update(['status' => 'paid']);

            $metadata = $responseData['data']['metadata'] ?? [];
            $thawaniPaidAmount = $responseData['data']['total_amount'] / 1000;
            $unitId = $paymentSession->unit_id;
            $paymentId = $responseData['data']['invoice'] ?? $sessionId;

            $unit = Unit::find($unitId);
            if (!$unit) {
                Log::error('Thawani success: Unit not found.', ['unit_id' => $unitId]);
                return redirect()->route('owner_dashboard')->with('error', 'Payment successful but unit not found.');
            }

            if (Payment::where('reference', $paymentId)->exists()) {
                return redirect()->route('owner_dashboard')->with('info', 'Payment already recorded.');
            }

            Payment::create([
                'owner_id' => $owner->id,
                'unit_id' => $unit->id,
                'amount' => $thawaniPaidAmount,
                'method' => 'Thawani',
                'reference' => $paymentId,
                'payment_date' => now(),
                'meta' => $responseData['data'],
            ]);

            $unit->increment('received', $thawaniPaidAmount);
            $unit->balance = $unit->total - $unit->received;
            $unit->save();

            return redirect()->route('owner_dashboard')
                ->with('success', '✅ Payment of ' . number_format($thawaniPaidAmount, 3) . ' OMR completed successfully.');

        } catch (\Exception $e) {
            Log::error('Thawani success callback error', [
                'message' => $e->getMessage(),
                'session_id' => $sessionId,
            ]);

            $paymentSession->update(['status' => 'failed']);
            return redirect()->route('owner_dashboard')->with('error', 'An error occurred during payment verification.');
        }
    }

    /**
     * Handle payment cancellation callback from Thawani.
     */
    public function handleThawaniCancel(Request $request): RedirectResponse
    {
        $owner = Auth::guard('owner')->user();
        if ($owner) {
            $pendingSession = PaymentSession::where('owner_id', $owner->id)
                ->where('status', 'pending')
                ->latest()
                ->first();

            if ($pendingSession) {
                $pendingSession->update(['status' => 'failed']);
            }
        }

        Log::info('Thawani payment cancelled or failed.', ['request' => $request->all()]);
        return redirect()->route('owner_dashboard')->with('error', '❌ Payment was cancelled or failed. Please try again.');
    }

    /**
     * Handle direct payments (Cash or Bank Transfer).
     */
    public function processDirectPayment(Request $request): RedirectResponse
    {
        $owner = Auth::guard('owner')->user();
        if (!$owner) {
            return back()->with('error', 'Authentication required to process payment.');
        }

        $request->validate([
            'unit_id' => [
                'required',
                'integer',
                Rule::exists('units', 'id')->where(fn($q) => $q->where('owner_id_no', $owner->owner_id_no)),
            ],
            'method' => ['required', 'string', Rule::in(['Cash', 'Bank Transfer'])],
            'amount' => 'required|numeric|min:0.01',
            'reference' => 'nullable|string|max:255',
            'payment_date' => 'required|date',
        ]);

        if ($request->method === 'Bank Transfer') {
            $request->validate(['reference' => 'required|string|max:255']);
        }

        $unit = Unit::find($request->unit_id);
        if (!$unit) {
            Log::warning("Direct payment failed: Unit ID {$request->unit_id} not found for owner {$owner->id}.");
            return back()->with('error', 'Selected unit not found.');
        }

        if ($request->amount > $unit->balance) {
            return back()->with('error', 'Payment amount cannot exceed the outstanding balance of ' . number_format($unit->balance, 3) . '.');
        }

        try {
            Payment::create([
                'owner_id' => $owner->id,
                'unit_id' => $unit->id,
                'amount' => $request->amount,
                'method' => $request->method,
                'reference' => $request->reference,
                'payment_date' => $request->payment_date,
                'meta' => ['source' => 'owner_direct_payment', 'details' => $request->all()],
            ]);

            $unit->increment('received', $request->amount);
            $unit->balance = $unit->total - $unit->received;
            $unit->save();

            return redirect()->route('owner_dashboard')->with(
                'success',
                '✅ Your ' . $request->method . ' payment of ' . number_format($request->amount, 3) . ' for Unit ' . $unit->unit_code . ' was recorded successfully!'
            );

        } catch (\Exception $e) {
            Log::error('Direct payment processing error', [
                'message' => $e->getMessage(),
                'owner' => $owner->id,
                'unit_id' => $unit->id ?? null,
                'request' => $request->all(),
            ]);

            return back()->with('error', 'An unexpected error occurred while processing your payment. Please try again.');
        }
    }
}
