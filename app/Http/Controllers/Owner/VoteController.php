<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Voter;
use App\Models\Candidate;
use App\Models\Vote;
use App\Models\Election; // Import the Election model
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\Admin\ElectionController; // To access constants like RESULTS_CACHE_PREFIX

class VoteController extends Controller
{
    /**
     * Display the owner's voting page for a specific election.
     * Requires an election_id in the request.
     */
    public function index(Request $request): Response | RedirectResponse
    {
        $owner = Auth::guard('owner')->user();
        if (!$owner) {
            return redirect()->route('owner_login')->with('error', 'Authentication required.');
        }

        $electionId = $request->input('election_id');
        if (!$electionId) {
            // Redirect to a page that lists elections for owners, or show an error
            return redirect()->route('owner_dashboard')->with('error', 'Please select an election to vote in.');
        }

        $election = Election::find($electionId);
        if (!$election) {
            return redirect()->route('owner_dashboard')->with('error', 'The specified election was not found.');
        }

        // Find the voter record linked to this owner and election
        $voter = Voter::where('owner_id', $owner->id) // Assuming owner_id exists in voters table for owner login
                      ->where('election_id', $election->id)
                      ->first();

        if (!$voter) {
            return Inertia::render('Owner/Voting/Unavailable', [
                'message' => 'Your voting eligibility for election "' . $election->title . '" could not be determined. Please contact support.',
                'breadcrumbs' => [
                    ['label' => 'Dashboard', 'url' => route('owner_dashboard')],
                    ['label' => 'Elections', 'url' => route('owner_dashboard')], // Link to dashboard where elections could be listed
                    ['label' => 'Voting', 'url' => '#'],
                ],
            ]);
        }

        if (!$election->isActive()) {
            return Inertia::render('Owner/Voting/Inactive', [
                'status' => $election->status,
                'electionTitle' => $election->title, // Pass election title
                'breadcrumbs' => [
                    ['label' => 'Dashboard', 'url' => route('owner_dashboard')],
                    ['label' => 'Elections', 'url' => route('owner_dashboard')],
                    ['label' => 'Voting', 'url' => '#'],
                ],
            ]);
        }

        if ($voter->has_voted) {
            return Inertia::render('Owner/Voting/Completed', [
                'message' => 'You have already submitted your vote for election "' . $election->title . '".',
                'electionTitle' => $election->title, // Pass election title
                'breadcrumbs' => [
                    ['label' => 'Dashboard', 'url' => route('owner_dashboard')],
                    ['label' => 'Elections', 'url' => route('owner_dashboard')],
                    ['label' => 'Voting', 'url' => '#'],
                ],
            ]);
        }

        $votesRemaining = $voter->number_of_units;
        $candidates = Candidate::where('election_id', $election->id)->orderBy('name')->get();

        return Inertia::render('Owner/Voting/Index', [
            'voter' => [
                'id' => $voter->id,
                'name' => $voter->name,
                'phone' => $voter->phone,
                'number_of_units' => $voter->number_of_units,
                'votesRemaining' => $votesRemaining,
            ],
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'description' => $election->description,
            ],
            'candidates' => $candidates->map(function ($candidate) {
                return [
                    'id' => $candidate->id,
                    'name' => $candidate->name,
                    'description' => $candidate->description,
                    'photo' => $candidate->photo ? asset('storage/' . $candidate->photo) : null,
                ];
            }),
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('owner_dashboard')],
                ['label' => 'Elections', 'url' => route('owner_dashboard')],
                ['label' => 'Voting: ' . $election->title, 'url' => '#'],
            ],
        ]);
    }

    /**
     * Handle the owner casting their vote(s).
     */
    public function castVote(Request $request): RedirectResponse
    {
        Log::info('Received owner castVote request data (before validation):', $request->all());
        $owner = Auth::guard('owner')->user();
        if (!$owner) {
            return back()->with('error', 'Authentication required.');
        }

        $request->validate([
            'election_id' => 'required|integer|exists:elections,id', // Election ID is now required
            'votes' => 'required|array|min:1',
            'votes.*.candidate_id' => ['required', 'integer', Rule::exists('candidates', 'id')->where(function ($query) use ($request) {
                return $query->where('election_id', $request->election_id); // Candidate must belong to this election
            })],
            'votes.*.count' => 'required|integer|min:1',
        ]);

        $election = Election::find($request->election_id);
        if (!$election || !$election->isActive()) {
            return back()->with('error', '❌ Voting for "' . ($election ? $election->title : 'the selected election') . '" is currently not active or does not exist.');
        }

        $voter = Voter::where('owner_id', $owner->id)
                      ->where('election_id', $election->id)
                      ->first();
        if (!$voter) {
            return back()->with('error', 'Your voting eligibility for this election could not be determined.');
        }
        if ($voter->has_voted) {
            return back()->with('info', 'You have already submitted your vote for "' . $election->title . '".');
        }

        $totalVotesRequested = 0;
        foreach ($request->votes as $voteData) {
            $totalVotesRequested += $voteData['count'];
        }

        if ($totalVotesRequested > $voter->number_of_units) {
            return back()->with('error', '❌ You are trying to cast more votes than your allocated number of units (' . $voter->number_of_units . ') for "' . $election->title . '".');
        }

        try {
            DB::transaction(function () use ($voter, $request, $election) {
                foreach ($request->votes as $voteData) {
                    for ($i = 0; $i < $voteData['count']; $i++) {
                        Vote::create([
                            'election_id' => $election->id,
                            'voter_id' => $voter->id,
                            'candidate_id' => $voteData['candidate_id'],
                            'vote_weight' => 1,
                        ]);
                    }
                }

                $voter->has_voted = true;
                $voter->save();

                // Clear election-specific results cache
                Cache::forget(ElectionController::RESULTS_CACHE_PREFIX . $election->id);
            });

            return redirect()->route('owner_voting_index', ['election_id' => $election->id])->with('success', '✅ Your votes for "' . $election->title . '" have been cast successfully!');

        } catch (\Exception $e) {
            Log::error('Owner vote casting error: ' . $e->getMessage(), ['owner_id' => $owner->id, 'election_id' => $election->id, 'request_data' => $request->all(), 'exception' => $e]);
            return back()->with('error', '❌ Failed to cast votes. An unexpected error occurred.');
        }
    }

    /**
     * Check current voting status for the owner app. (This will now be election-specific)
     */
    public function checkStatus(Request $request)
    {
        $electionId = $request->input('election_id');
        if (!$electionId) {
            return response()->json(['error' => 'Election ID is required.'], 400);
        }

        $election = Election::find($electionId);
        if (!$election) {
            return response()->json(['error' => 'Election not found.'], 404);
        }

        return response()->json([
            'election_id' => $election->id,
            'title' => $election->title,
            'status' => $election->status,
            'start_time' => $election->start_time?->toDateTimeString(),
            'end_time' => $election->end_time?->toDateTimeString(),
            'is_active' => $election->isActive(),
            'is_completed' => $election->isCompleted(),
        ]);
    }
}
