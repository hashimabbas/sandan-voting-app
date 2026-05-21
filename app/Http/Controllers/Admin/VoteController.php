<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Vote;
use App\Models\Voter;
use App\Models\Unit;
use App\Models\Election;
use App\Models\Building;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB; // For database aggregation

class VoteController extends Controller
{
    const VOTING_STATUS_KEY = 'voting_system_status';
    const VOTING_PERIOD_KEY = 'voting_system_period';
    const VOTING_ACTIVE = 'active';
    const VOTING_INACTIVE = 'inactive';
    const RESULTS_CACHE_KEY = 'voting_results_cache'; // Cache key for results
    const RESULTS_CACHE_TTL = 60; // Cache results for 60 seconds

    /**
     * Use constructor for common authorization checks.
     */
    public function __construct()
    {
        $this->middleware('permission:viewVotingStatus')->only(['index', 'results', 'getResultsApi', 'liveResults']);
        $this->middleware('permission:manageVotingSystem')->only(['toggleVoting', 'resetVoting']);
    }

    /**
     * Display the voting system management dashboard (admin).
     */
    public function index(): Response
    {
        $this->authorize('viewVotingStatus'); // Ensure authorization

        $votingStatus = Cache::get(self::VOTING_STATUS_KEY, self::VOTING_INACTIVE);
        $votingPeriod = Cache::get(self::VOTING_PERIOD_KEY, ['start' => null, 'end' => null]);
        $totalVoters = Voter::count();
        $totalCandidates = Candidate::count();
        $totalVotesCast = Vote::count();

        $activeElectionId = Election::where('status', 'active')->first()?->id;
        $votedUnitsStr = Voter::where('election_id', $activeElectionId)->whereNotNull('unit_name')->pluck('unit_name')->toArray();
        $eligibleUnitNames = [];
        foreach ($votedUnitsStr as $str) {
            foreach (array_map('trim', explode(',', $str)) as $part) {
                if (!empty($part)) $eligibleUnitNames[] = $part;
            }
        }
        $eligibleUnitNames = array_unique($eligibleUnitNames);

        $untransferredCount = Unit::whereNotIn('unit_name', $eligibleUnitNames)
            ->where(function($q) {
                $q->where('ownership_status', '!=', 'محولة')
                  ->where('ownership_status', '!=', 'transferred')
                  ->orWhereNull('ownership_status')
                  ->orWhere('ownership_status', '');
            })->count();

        return Inertia::render('Admin/Voting/Index', [
            'votingStatus' => $votingStatus,
            'votingPeriod' => $votingPeriod,
            'totalVoters' => $totalVoters,
            'totalCandidates' => $totalCandidates,
            'totalVotesCast' => $totalVotesCast,
            'untransferredCount' => $untransferredCount,
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Voting System', 'url' => route('admin_voting_index')],
            ],
        ]);
    }

    public function untransferredUnits(): Response
    {
        $this->authorize('manageVotingSystem');

        $activeElectionId = Election::where('status', 'active')->first()?->id;
        $votedUnitsStr = Voter::where('election_id', $activeElectionId)->whereNotNull('unit_name')->pluck('unit_name')->toArray();
        $eligibleUnitNames = [];
        foreach ($votedUnitsStr as $str) {
            foreach (array_map('trim', explode(',', $str)) as $part) {
                if (!empty($part)) $eligibleUnitNames[] = $part;
            }
        }
        $eligibleUnitNames = array_unique($eligibleUnitNames);

        $units = Unit::whereNotIn('unit_name', $eligibleUnitNames)
            ->where(function($q) {
                $q->where('ownership_status', '!=', 'محولة')
                  ->where('ownership_status', '!=', 'transferred')
                  ->orWhereNull('ownership_status')
                  ->orWhere('ownership_status', '');
            })
            ->with(['building', 'votes.candidate']) // Include votes and candidate info
            ->get();

        $candidates = Candidate::all();

        return Inertia::render('Admin/Voting/Untransferred', [
            'units' => $units,
            'candidates' => $candidates,
        ]);
    }

    public function adminVote(Request $request): RedirectResponse
    {
        $this->authorize('manageVotingSystem');

        $request->validate([
            'unit_ids' => 'required|array',
            'unit_ids.*' => 'exists:units,id',
            'candidate_id' => 'required|exists:candidates,id',
        ]);

        $electionId = Election::where('status', 'active')->first()?->id;
        if (!$electionId) {
             return back()->with('error', '❌ No active election found for admin voting.');
        }

        DB::transaction(function() use ($request, $electionId) {
            foreach ($request->unit_ids as $unitId) {
                // Ensure the unit hasn't voted yet
                $existingVote = Vote::where('election_id', $electionId)->where('unit_id', $unitId)->first();
                if (!$existingVote) {
                    Vote::create([
                        'election_id' => $electionId,
                        'candidate_id' => $request->candidate_id,
                        'unit_id' => $unitId,
                        'vote_weight' => 1,
                        'voter_id' => null, // Admin cast
                    ]);
                }
            }
        });

        return back()->with('success', '✅ Votes cast successfully for selected units.');
    }

    /**
     * Toggle the voting system status (activate/deactivate).
     */
    public function toggleVoting(Request $request): RedirectResponse
    {
        $this->authorize('manageVotingSystem'); // Ensure authorization

        $request->validate([
            'action' => ['required', Rule::in(['activate', 'deactivate'])],
            'start_time' => 'required_if:action,activate|date',
            'end_time' => 'required_if:action,activate|date|after:start_time',
        ]);

        $currentStatus = Cache::get(self::VOTING_STATUS_KEY, self::VOTING_INACTIVE);

        if ($request->action === 'activate' && $currentStatus === self::VOTING_INACTIVE) {
            // Check if there are candidates to vote for
            if (Candidate::count() === 0) {
                 return back()->with('error', '❌ Cannot activate voting: No candidates have been registered yet!');
            }
            // Clear any previous results cache on activation
            Cache::forget(self::RESULTS_CACHE_KEY);
            Cache::put(self::VOTING_STATUS_KEY, self::VOTING_ACTIVE);
            Cache::put(self::VOTING_PERIOD_KEY, ['start' => $request->start_time, 'end' => $request->end_time]);
            $message = '✅ Voting system activated for the period ' . $request->start_time . ' to ' . $request->end_time . '!';
        } elseif ($request->action === 'deactivate' && $currentStatus === self::VOTING_ACTIVE) {
            Cache::put(self::VOTING_STATUS_KEY, self::VOTING_INACTIVE);
            // Invalidate results cache on deactivation to ensure fresh results for final view
            Cache::forget(self::RESULTS_CACHE_KEY);
            $message = '✅ Voting system deactivated!';
        } else {
            return back()->with('info', 'ℹ️ Voting system is already in the requested state.');
        }

        return redirect()->route('admin_voting_index')->with('success', $message);
    }

    /**
     * Reset the voting system (clear all votes and set voters to not voted).
     */
    public function resetVoting(): RedirectResponse
    {
        $this->authorize('manageVotingSystem'); // Ensure authorization

        if (Cache::get(self::VOTING_STATUS_KEY, self::VOTING_INACTIVE) === self::VOTING_ACTIVE) {
            return back()->with('error', '❌ Please deactivate the voting system before resetting votes.');
        }

        try {
            DB::transaction(function () {
                Vote::truncate(); // Delete all vote records
                Voter::query()->update(['has_voted' => false, 'token' => null]); // Reset voter status
                // Clear results cache
                Cache::forget(self::RESULTS_CACHE_KEY);
            });

            return redirect()->route('admin_voting_index')->with('success', '✅ Voting data reset successfully! All votes cleared and voters reset.');
        } catch (\Exception $e) {
            Log::error('Error resetting voting data: ' . $e->getMessage(), ['exception' => $e]);
            return back()->with('error', '❌ Failed to reset voting data. An unexpected error occurred.');
        }
    }

    /**
     * Display the voting results page (admin).
     */
    public function results(): Response
    {
        $this->authorize('viewVotingResults'); // Ensure authorization

        // Prepare initial data for results page
        $resultsData = $this->getVotingResultsData();

        // --- FIX START ---
        // Ensure votingStatus is a string, even if Cache::get returns null for some reason.
        $votingStatus = Cache::get(self::VOTING_STATUS_KEY, self::VOTING_INACTIVE) ?? self::VOTING_INACTIVE;
        // --- FIX END ---

        return Inertia::render('Admin/Voting/Results', [
            'results' => $resultsData['results'],
            'totalPossibleVotes' => $resultsData['totalPossibleVotes'],
            'totalVotesCast' => $resultsData['totalVotesCast'],
            'votingStatus' => $votingStatus, // Pass the guaranteed string status
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Voting System', 'url' => route('admin_voting_index')],
                ['label' => 'Voting Results', 'url' => route('admin_voting_results')],
            ],
        ]);
    }

    /**
     * Display the live voting results page (for large screen/public display).
     */
    public function liveResults(): Response
    {
        $this->authorize('viewVotingResults'); // Ensure authorization

        // Similar data as results, but for a potentially simpler UI
        $resultsData = $this->getVotingResultsData();

        // --- FIX START ---
        $votingStatus = Cache::get(self::VOTING_STATUS_KEY, self::VOTING_INACTIVE) ?? self::VOTING_INACTIVE;
        // --- FIX END ---

        return Inertia::render('Admin/Voting/LiveResults', [
            'results' => $resultsData['results'],
            'totalPossibleVotes' => $resultsData['totalPossibleVotes'],
            'totalVotesCast' => $resultsData['totalVotesCast'],
            'votingStatus' => $votingStatus, // Pass the guaranteed string status
            // No breadcrumbs for a full-screen view
        ]);
    }

    /**
     * API endpoint to get real-time voting results.
     */
    public function getResultsApi(): \Illuminate\Http\JsonResponse
    {
        $this->authorize('viewVotingStatus'); // Or a more specific API permission if needed

        $resultsData = $this->getVotingResultsData();

        // --- FIX START ---
        $votingStatus = Cache::get(self::VOTING_STATUS_KEY, self::VOTING_INACTIVE) ?? self::VOTING_INACTIVE;
        // --- FIX END ---

        return response()->json([
            'results' => $resultsData['results'],
            'totalPossibleVotes' => $resultsData['totalPossibleVotes'],
            'totalVotesCast' => $resultsData['totalVotesCast'],
            'votingStatus' => $votingStatus, // Pass the guaranteed string status
        ]);
    }

    /**
     * Helper to get common voting results data, with caching.
     */
    protected function getVotingResultsData(): array
    {
        return Cache::remember(self::RESULTS_CACHE_KEY, self::RESULTS_CACHE_TTL, function () {

            // CRITICAL FIX: Use withSum and the correct alias for orderByDesc
            $results = Candidate::withSum('votes', 'vote_weight')
                                // Use the correct alias: [relation]_[aggregate]_[column]
                                ->orderByDesc('votes_sum_vote_weight')
                                ->get()
                                ->map(function ($candidate) {
                                    return [
                                        'id' => $candidate->id,
                                        'name' => $candidate->name,
                                        'photo' => $candidate->photo ? asset('storage/' . $candidate->photo) : null,
                                        // CRITICAL FIX: Use the correct property accessor
                                        'votes_count' => (int) $candidate->votes_sum_vote_weight ?? 0,
                                    ];
                                });

            $totalPossibleVotes = Unit::count();
            // The total votes cast is the SUM of vote_weight from all votes
            $totalVotesCast = \App\Models\Vote::count();

            return [
                'results' => $results,
                'totalPossibleVotes' => (int) $totalPossibleVotes,
                'totalVotesCast' => (int) $totalVotesCast,
            ];
        });
    }
}
