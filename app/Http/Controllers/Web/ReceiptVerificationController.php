<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Voter; // Import Voter model
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\RedirectResponse;

class ReceiptVerificationController extends Controller
{
    /**
     * Show the form for verifying a vote receipt.
     */
    public function showVerificationForm(Request $request): Response // NEW: Accept Request to get query params
    {
        return Inertia::render('Verification/Receipt', [
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'errors' => session('errors') ? session('errors')->getBag('default')->toArray() : [],
            // NEW: Pass query parameters to frontend props
            'voter_id_no_qp' => $request->query('voter_id_no'),
            'receipt_code_qp' => $request->query('receipt_code'),
        ]);
    }

    /**
     * Handle the submission of the receipt verification form.
     */
    public function verifyReceipt(Request $request): RedirectResponse // This type hint is now correct
    {
        $request->validate([
            'voter_id_no' => 'required|string|max:255',
            'receipt_code' => 'required|string|size:64',
        ], [
            'receipt_code.size' => 'The receipt code must be 64 characters long.',
        ]);

        $voter = Voter::where('voter_id_no', $request->voter_id_no)
                      ->where('receipt_code', $request->receipt_code)
                      ->with('election')
                      ->first();

        if (!$voter) {
            throw ValidationException::withMessages([
                'receipt_code' => 'No matching vote found with the provided Voter ID and Receipt Code.',
            ])->redirectTo(route('receipt_verification_form'));
        }

        return redirect()->route('receipt_verification_form')->with('success', '✅ Vote successfully verified for "' . $voter->election->title . '" by Voter ID ' . $voter->voter_id_no . '.');
    }
}
