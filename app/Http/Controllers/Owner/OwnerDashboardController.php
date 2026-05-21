<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Owner;
use App\Models\Voter; // Import Voter model
use App\Models\Election; // Import Election model
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class OwnerDashboardController extends Controller
{
    // ... (showLoginForm, login methods remain the same) ...

    /**
     * Display the owner dashboard with relevant election information.
     */
    public function dashboard(): Response
    {
        $owner = Auth::guard('owner')->user();

        // Retrieve active elections that this owner is eligible to vote in
        $activeElections = Election::where('status', 'active')
                                   ->where('start_time', '<=', now())
                                   ->where('end_time', '>=', now())
                                   ->whereHas('voters', function ($query) use ($owner) {
                                       $query->where('owner_id', $owner->id); // Link to owner
                                   })
                                   ->orderBy('end_time')
                                   ->get();

        // For each election, check if this specific owner/voter has already voted
        $electionsForOwner = $activeElections->map(function ($election) use ($owner) {
            $voter = Voter::where('owner_id', $owner->id)
                          ->where('election_id', $election->id)
                          ->first();
            return [
                'id' => $election->id,
                'title' => $election->title,
                'description' => $election->description,
                'start_time' => $election->start_time->toDateTimeString(),
                'end_time' => $election->end_time->toDateTimeString(),
                'status' => $election->status,
                'has_voted' => $voter ? $voter->has_voted : false, // Check voter's status for this election
            ];
        });

        return Inertia::render('Owner/Dashboard', [
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('owner_dashboard')],
            ],
            'activeElections' => $electionsForOwner, // Pass the list of elections
        ]);
    }

    /**
     * Handle owner logout.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('owner')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('owner_login')->with('success', 'Logged out successfully.');
    }
}
