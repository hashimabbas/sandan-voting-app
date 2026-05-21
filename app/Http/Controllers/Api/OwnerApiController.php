<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Owner;
use App\Models\Payment; // Import Payment model
use App\Models\Unit;    // Import Unit model
use App\Models\Complaint; // Import Complaint model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Http; // For Thawani API calls
use Illuminate\Support\Facades\URL; // For absolute URLs (Thawani callbacks)

class OwnerApiController extends Controller
{
    /**
     * Handle owner login and issue Sanctum token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'phone'    => 'required|string',
            'password' => 'required|string',
        ]);

        $owner = Owner::where('phone', $request->phone)->first();

        if (!$owner || !Hash::check($request->password, $owner->password)) {
            throw ValidationException::withMessages([
                'phone' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Revoke old tokens with the same name and create a new one
        $owner->tokens()->where('name', 'owner_app_token')->delete();
        $token = $owner->createToken('owner_app_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'owner' => [
                'id' => $owner->id,
                'name' => $owner->name,
                'phone' => $owner->phone,
                'owner_id_no' => $owner->owner_id_no,
                'photo' => $owner->photo ? asset('storage/' . $owner->photo) : null,
            ],
        ]);
    }

    /**
     * Handle owner logout and revoke Sanctum token.
     */
    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
       $request->user('sanctum')->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get owner dashboard data (profile, units, payments, complaints).
     */
    public function dashboard(Request $request)
    {
        $owner = $request->user('sanctum'); // Access user via custom guard
        if (!$owner) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Fetch units
        $units = $owner->units()->latest('created_at')->get();
        // Fetch payments
        $payments = $owner->payments()->with('unit')->latest('payment_date')->take(5)->get(); // Take 5 recent payments

        // Fetch complaints
        $complaints = $owner->complaints()->with('unit')->latest('created_at')->take(5)->get(); // Take 5 recent complaints


        return response()->json([
            'owner' => [
                'id' => $owner->id,
                'name' => $owner->name,
                'phone' => $owner->phone,
                'owner_id_no' => $owner->owner_id_no,
                'photo' => $owner->photo ? asset('storage/' . $owner->photo) : null,
            ],
            'units' => $units->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'unit_code' => $unit->unit_code,
                    'total' => (float) $unit->total,
                    'received' => (float) $unit->received,
                    'balance' => (float) $unit->balance,
                    'y2020' => (float) $unit->y2020,
                    'y2021' => (float) $unit->y2021,
                    'y2022' => (float) $unit->y2022,
                    'y2023' => (float) $unit->y2023,
                    'y2024' => (float) $unit->y2024,
                    'y2025' => (float) $unit->y2025,
                    'y2026' => (float) $unit->y2026,
                ];
            }),
            'payments' => $payments->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => (float) $payment->amount,
                    'method' => $payment->method,
                    'reference' => $payment->reference,
                    'payment_date' => $payment->payment_date?->format('Y-m-d'),
                    'unit_code' => $payment->unit->unit_code ?? 'N/A',
                ];
            }),
             'complaints' => $complaints->map(function ($complaint) {
                return [
                    'id' => $complaint->id,
                    'subject' => $complaint->subject,
                    'status' => $complaint->status,
                    'created_at' => $complaint->created_at?->format('Y-m-d H:i:s'),
                    'unit_code' => $complaint->unit->unit_code ?? 'N/A',
                ];
            }),
        ]);
    }

    // Add other API methods here as needed for payments, complaints submission, etc.
}
