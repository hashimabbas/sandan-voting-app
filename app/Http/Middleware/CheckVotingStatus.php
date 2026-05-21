<?php

namespace App\Http\Middleware;

use App\Models\Voter;
use App\Models\Election; // Import Election model
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
// Removed App\Http\Controllers\Admin\VoteController, now using Election model directly for status checks

class CheckVotingStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->route('token') ?? $request->input('token');

        // 1. Find the voter by token (eager load election to avoid N+1)
        $voter = Voter::where('token', $token)->with('election')->first();

        if (!$voter) {
            // If token is invalid or expired
            return redirect()->route('vote_show_voter_id_form')->with('error', 'Invalid or expired voting link. Please verify your details again.');
        }

        // 2. Get the associated election
        $election = $voter->election;

        if (!$election) {
            // This should ideally not happen if voters are always assigned an election
            $voter->token = null; // Invalidate token if no election found
            $voter->save();
            return redirect()->route('vote_show_voter_id_form')->with('error', 'The election for your vote could not be determined. Please contact support.');
        }

        // 3. Check election status and voting period
        if (!$election->isActive()) { // Assuming isActive() method on Election model checks status AND dates
            // Invalidate the token as voting is closed for this election
            $voter->token = null;
            $voter->save();

            $statusMessage = '';
            if ($election->status === 'pending') {
                $statusMessage = 'Voting for "' . $election->title . '" has not started yet.';
            } elseif ($election->status === 'completed' || ($election->end_time && now()->gt($election->end_time))) {
                $statusMessage = 'Voting for "' . $election->title . '" has already ended.';
            } elseif ($election->status === 'archived') {
                $statusMessage = 'Voting for "' . $election->title . '" is archived.';
            } else {
                $statusMessage = 'Voting for "' . $election->title . '" is currently inactive.';
            }

            return redirect()->route('vote_show_voter_id_form')->with('error', '❌ ' . $statusMessage);
        }

        // 4. Check if voter has already voted for this election
        if ($voter->has_voted) {
            // Invalidate token as they have already voted
            $voter->token = null;
            $voter->save();
            return redirect()->route('vote_thank_you')->with('info', '✅ You have already cast your vote for "' . $election->title . '".');
        }

        // 5. Attach voter and election to the request and proceed
        $request->attributes->add(['voter' => $voter, 'election' => $election]);

        return $next($request);
    }
}
// namespace App\Http\Middleware;

// use App\Models\Voter;
// use App\Http\Controllers\Admin\VoteController;
// use Closure;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Cache;
// use Symfony\Component\HttpFoundation\Response;

// class CheckVotingStatus
// {
//     /**
//      * Handle an incoming request.
//      *
//      * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
//      */
//     public function handle(Request $request, Closure $next): Response
//     {
//         $token = $request->route('token') ?? $request->input('token');

//         // 1. Check global voting status
//         if (Cache::get(VoteController::VOTING_STATUS_KEY) !== VoteController::VOTING_ACTIVE) {
//             return redirect()->route('vote_verification_form')->with('error', 'Voting is currently closed.');
//         }

//         // 2. Find Voter by token
//         $voter = Voter::where('token', $token)->first();

//         if (!$voter || $voter->has_voted) {
//             // If token is invalid, expired, or already used
//             return redirect()->route('vote_verification_form')->with('error', 'Invalid or expired voting link. Please verify your details again.');
//         }

//         // 3. Attach voter to the request and proceed
//         $request->attributes->add(['voter' => $voter]);

//         return $next($request);
//     }
// }
