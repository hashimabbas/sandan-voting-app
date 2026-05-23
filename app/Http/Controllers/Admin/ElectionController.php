<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Models\Voter;
use App\Models\Candidate;
use App\Models\Unit;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Cache; // Still used for global cache-clearing, but status is election-specific
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon; // For date handling

class ElectionController extends Controller
{
    // These constants are now largely election-specific, not global.
    // The previous global cache keys will be removed or repurposed.
    const RESULTS_CACHE_PREFIX = 'election_results_'; // Prefix for election-specific results cache
    const RESULTS_CACHE_TTL = 60; // Cache results for 60 seconds

    /**
     * Use constructor for common authorization checks.
     */
    public function __construct()
    {
        $this->middleware('permission:viewElections')->only(['index', 'show', 'results', 'getResultsApi', 'liveResults', 'report', 'exportCsv']);
        $this->middleware('permission:createElections')->only(['create', 'store']);
        $this->middleware('permission:editElections')->only(['edit', 'update', 'toggleStatus']); // toggleStatus is part of editing
        $this->middleware('permission:deleteElections')->only('destroy');
        $this->middleware('permission:manageVotingSystem')->only('resetVotes'); // This will reset votes for a specific election
    }

    /**
     * Display a listing of elections.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewElections');

        $query = Election::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $elections = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Elections/Index', [
            'elections' => $elections,
            'filters' => $request->only(['search']),
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Elections', 'url' => route('admin_elections_index')],
            ],
            // Pass permissions for UI control
            // 'can' => [
            //     'createElections' => auth()->user()->can('createElections'),
            //     'editElections' => auth()->user()->can('editElections'),
            //     'deleteElections' => auth()->user()->can('deleteElections'),
            //     'manageVotingSystem' => auth()->user()->can('manageVotingSystem'), // For toggle/reset on list
            // ],
        ]);
    }

    /**
     * Show the form for creating a new election.
     */
    public function create(): Response
    {
        $this->authorize('createElections');

        return Inertia::render('Admin/Elections/Create', [
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Elections', 'url' => route('admin_elections_index')],
                ['label' => 'Create Election', 'url' => route('admin_elections_create')],
            ],
        ]);
    }

    /**
     * Store a newly created election in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('createElections');

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'status' => ['required', Rule::in(['pending', 'active', 'completed', 'archived'])],
            'is_public' => 'boolean',
            'show_results' => 'boolean',
        ]);

        $election = Election::create($request->all());

        // If newly created election is active, close all others
        if ($election->status === 'active') {
            Election::where('id', '!=', $election->id)
                ->where('status', 'active')
                ->update(['status' => 'completed']);
        }

        return redirect()->route('admin_elections_index')->with('success', '✅ Election created successfully!');
    }

    /**
     * Show the form for editing the specified election.
     */
    public function edit(Election $election): Response
    {
        $this->authorize('editElections');

        return Inertia::render('Admin/Elections/Edit', [
            'election' => $election->toArray(), // Convert to array for Inertia
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Elections', 'url' => route('admin_elections_index')],
                ['label' => 'Edit Election', 'url' => route('admin_elections_edit', $election->id)],
            ],
        ]);
    }

    /**
     * Update the specified election in storage.
     */
    public function update(Request $request, Election $election): RedirectResponse
    {
        $this->authorize('editElections');

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'status' => ['required', Rule::in(['pending', 'active', 'completed', 'archived'])],
            'is_public' => 'boolean',
            'show_results' => 'boolean',
        ]);

        $election->update($request->all());

        // If this election is set to active, close all other active elections
        if ($election->status === 'active') {
            Election::where('id', '!=', $election->id)
                ->where('status', 'active')
                ->update(['status' => 'completed']);
        }

        // Clear cache for this specific election if status or period changed
        Cache::forget(self::RESULTS_CACHE_PREFIX . $election->id);

        return redirect()->route('admin_elections_index')->with('success', '✅ Election updated successfully!');
    }

    /**
     * Toggle the status of a specific election (activate/deactivate manually).
     * This is a simplified toggle, `update` method is for full editing.
     */
    public function toggleStatus(Request $request, Election $election): RedirectResponse
    {
        if (!$request->user()->can('manageVotingSystem')) {
            return back()->with('error', '🚫 You do not have permission to manage the voting system.');
        }

        $request->validate([
            'action' => ['required', Rule::in(['activate', 'deactivate', 'complete', 'archive'])],
        ]);

        $message = '';
        if ($request->action === 'activate') {
            if ($election->status !== 'active') {
                if (Candidate::where('election_id', $election->id)->count() === 0) {
                    return back()->with('error', '❌ Cannot activate: No candidates registered for this assembly!');
                }
                
                $election->status = 'active';
                
                // Ensure only one election is active at a time
                Election::where('id', '!=', $election->id)
                    ->where('status', 'active')
                    ->update(['status' => 'completed']);

                $message = '🚀 Assembly "' . $election->title . '" is now LIVE!';
            } else {
                return back()->with('info', 'ℹ️ Assembly is already active.');
            }
        } elseif ($request->action === 'deactivate') {
            if ($election->status === 'active') {
                $election->status = 'pending';
                $message = '⏹️ Assembly "' . $election->title . '" has been suspended.';
            } else {
                return back()->with('info', 'ℹ️ Assembly is not active.');
            }
        } elseif ($request->action === 'complete') {
            if ($election->status !== 'completed') {
                $election->status = 'completed';
                $message = '🏁 Assembly "' . $election->title . '" marked as completed.';
            } else {
                return back()->with('info', 'ℹ️ Assembly is already completed.');
            }
        } elseif ($request->action === 'archive') {
            if ($election->status !== 'archived') {
                $election->status = 'archived';
                $message = '📦 Assembly "' . $election->title . '" archived.';
            } else {
                return back()->with('info', 'ℹ️ Assembly is already archived.');
            }
        }

        $election->save();
        Cache::forget(self::RESULTS_CACHE_PREFIX . $election->id);
        return redirect()->route('admin_elections_index')->with('success', $message);
    }


    public function toggleShowResults(Election $election): RedirectResponse
    {
        if (!auth()->user()->can('manageVotingSystem')) {
            return back()->with('error', '🚫 Unauthorized action.');
        }

        $election->show_results = !$election->show_results;
        $election->save();

        $status = $election->show_results ? 'enabled' : 'disabled';
        return back()->with('success', "✅ Results visibility is now {$status}.");
    }

    /**
     * Reset the votes for a specific election.
     */
    public function resetVotes(Election $election): RedirectResponse
    {
        if (!auth()->user()->can('manageVotingSystem')) {
            return back()->with('error', '🚫 You do not have permission to reset data.');
        }

        if ($election->status === 'active') {
            return back()->with('error', '❌ Cannot reset an active assembly. Please suspend it first.');
        }

        try {
            DB::transaction(function () use ($election) {
                // Delete all votes for this specific election
                Vote::where('election_id', $election->id)->delete();

                // Reset has_voted status for all voters associated with this election
                Voter::where('election_id', $election->id)->update([
                    'has_voted' => false, 
                    'token' => null, 
                    'otp_code' => null, 
                    'otp_expires_at' => null
                ]);

                // Clear results cache for this election
                Cache::forget(self::RESULTS_CACHE_PREFIX . $election->id);
            });

            return redirect()->route('admin_elections_index')->with('success', '🧹 All data for "' . $election->title . '" has been wiped successfully!');
        } catch (\Exception $e) {
            Log::error('Error resetting votes: ' . $e->getMessage());
            return back()->with('error', '❌ A technical error occurred during the reset process.');
        }
    }

    /**
     * Remove the specified election from storage.
     */
    public function destroy(Election $election): RedirectResponse
    {
        $this->authorize('deleteElections');

        if ($election->status === 'active') {
            return back()->with('error', '❌ Cannot delete an active election. Please deactivate it first.');
        }

        try {
            $election->delete();
            Cache::forget(self::RESULTS_CACHE_PREFIX . $election->id); // Clear cache on delete
            return redirect()->route('admin_elections_index')->with('success', '🗑️ Election "' . $election->title . '" deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Error deleting election: ' . $e->getMessage(), ['election_id' => $election->id, 'exception' => $e]);
            return back()->with('error', '❌ Failed to delete election. An unexpected error occurred.');
        }
    }

    /**
     * Display the voting results page for a specific election.
     */
    public function results(Election $election): Response
    {
        $this->authorize('viewElections');

        $resultsData = $this->getVotingResultsData($election);

        $participationLog = $this->buildParticipationLog($election);

        return Inertia::render('Admin/Elections/Results', [
            'election' => $election->toArray(),
            'results' => $resultsData['results'],
            'totalPossibleVotes' => $resultsData['totalPossibleVotes'],
            'totalVotesCast' => $resultsData['totalVotesCast'],
            'transferredWeight' => $resultsData['transferredWeight'],
            'untransferredCount' => $resultsData['untransferredCount'],
            'voters' => $participationLog,
            'generated_at' => now()->toDateTimeString(),
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Elections', 'url' => route('admin_elections_index')],
                ['label' => 'Results: ' . $election->title, 'url' => route('admin_elections_results', $election->id)],
            ],
        ]);
    }

    public function report(Election $election): Response
    {
        $this->authorize('viewElections');

        $resultsData = $this->getVotingResultsData($election);

        $participationLog = $this->buildParticipationLog($election);

        return Inertia::render('Admin/Elections/Report', [
            'election' => $election->toArray(),
            'results' => $resultsData['results'],
            'totalPossibleVotes' => $resultsData['totalPossibleVotes'],
            'totalVotesCast' => $resultsData['totalVotesCast'],
            'transferredWeight' => $resultsData['transferredWeight'],
            'untransferredCount' => $resultsData['untransferredCount'],
            'voters' => $participationLog,
            'generated_at' => now()->toDateTimeString(),
        ]);
    }

    public function exportCsv(Election $election)
    {
        $this->authorize('viewElections');

        $fileName = 'Election_Report_' . $election->id . '_' . now()->format('Y-m-d_H-i') . '.csv';
        
        $votes = Vote::where('election_id', $election->id)
            ->with(['voter', 'candidate', 'unit'])
            ->get();

        return response()->streamDownload(function() use ($votes) {
            $file = fopen('php://output', 'w');
            
            // UTF-8 BOM for Excel Arabic Support
            fputs($file, chr(0xEF) . chr(0xBB) . chr(0xBF));
            
            // Using semicolon (;) as delimiter which is more standard for Excel in many regions
            fputcsv($file, ['Voter Name', 'Voter Phone', 'Property Unit', 'Candidate Name', 'Weight', 'Date & Time'], ';');

            foreach ($votes as $v) {
                fputcsv($file, [
                    $v->voter->name ?? ($v->voter_id ? 'Unknown' : 'System/Admin (Proxy)'),
                    $v->voter->phone ?? 'N/A',
                    $v->unit->unit_name ?? 'N/A',
                    $v->candidate->name ?? 'N/A',
                    $v->vote_weight,
                    $v->created_at->format('Y-m-d H:i:s'),
                ], ';');
            }

            fclose($file);
        }, $fileName, [
            "Content-Type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Expires" => "0",
        ]);
    }

    /**
     * Display the live voting results page for a specific election.
     */
    public function liveResults(Election $election): Response
    {
        $this->authorize('viewElections'); // or 'viewElectionLiveResults'

        $resultsData = $this->getVotingResultsData($election);

        return Inertia::render('Admin/Elections/LiveResults', [
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'status' => $election->status,
                'start_time' => $election->start_time ? $election->start_time->toDateTimeString() : null,
                'end_time' => $election->end_time ? $election->end_time->toDateTimeString() : null,
            ],
            'results' => $resultsData['results'],
            'totalPossibleVotes' => $resultsData['totalPossibleVotes'],
            'totalVotesCast' => $resultsData['totalVotesCast'],
            // No breadcrumbs for a full-screen view
        ]);
    }

    /**
     * API endpoint to get real-time voting results for a specific election.
     */
    public function getResultsApi(Election $election): \Illuminate\Http\JsonResponse
    {
        $this->authorize('viewElections'); // or 'viewElectionLiveResults'

        $resultsData = $this->getVotingResultsData($election);

        return response()->json([
            'election_id' => $election->id,
            'title' => $election->title,
            'status' => $election->status,
            'start_time' => $election->start_time ? $election->start_time->toDateTimeString() : null,
            'end_time' => $election->end_time ? $election->end_time->toDateTimeString() : null,
            'results' => $resultsData['results'],
            'totalPossibleVotes' => $resultsData['totalPossibleVotes'],
            'totalVotesCast' => $resultsData['totalVotesCast'],
        ]);
    }

    /**
     * Count units eligible for admin proxy voting (untransferred ownership).
     */
    protected function getUntransferredUnitsCount(Election $election): int
    {
        $eligibleUnitNames = [];
        $voters = Voter::where('election_id', $election->id)->get();
        foreach ($voters as $voter) {
            if ($voter->unit_name) {
                foreach (array_map('trim', explode(',', $voter->unit_name)) as $part) {
                    if (!empty($part)) $eligibleUnitNames[] = $part;
                }
            }
        }
        $eligibleUnitNames = array_unique($eligibleUnitNames);

        return Unit::whereNotIn('unit_name', $eligibleUnitNames)
            ->where(function($q) {
                $q->where('ownership_status', '!=', 'محولة')
                  ->where('ownership_status', '!=', 'transferred')
                  ->orWhereNull('ownership_status')
                  ->orWhere('ownership_status', '');
            })->count();
    }

    /**
     * Build participation log from votes, grouped by voter.
     */
    protected function buildParticipationLog(Election $election): \Illuminate\Support\Collection
    {
        $allVotes = Vote::where('election_id', $election->id)
            ->with(['voter', 'candidate', 'unit'])
            ->get();

        return $allVotes->groupBy(function($vote) {
            return $vote->voter_id ? ('voter_' . $vote->voter_id) : 'system_admin';
        })->map(function($votes) {
            $first = $votes->first();
            $isAdmin = is_null($first->voter_id);

            $unitNames = [];
            if ($first->voter && $first->voter->unit_name) {
                $unitNames = array_map('trim', explode(',', $first->voter->unit_name));
            }

            if ($isAdmin) {
                // Admin votes: each has a specific unit_id, show per-vote
                $entries = $votes->map(fn($v) => [
                    'candidate_name' => $v->candidate->name ?? 'Deleted Candidate',
                    'unit_name' => $v->unit ? $v->unit->unit_name : 'N/A',
                    'count' => 1,
                ]);
            } else {
                // Owner votes: no unit_id on records, aggregate by candidate
                $entries = $votes->groupBy('candidate_id')->map(function($cv) use ($unitNames) {
                    return [
                        'candidate_name' => $cv->first()->candidate->name ?? 'Deleted Candidate',
                        'unit_name' => !empty($unitNames) ? implode(', ', $unitNames) : '',
                        'count' => $cv->count(),
                    ];
                })->values();
            }

            return [
                'name' => $first->voter ? $first->voter->name : 'إدارة سندان (تصويت بالإنابة)',
                'phone' => $first->voter ? $first->voter->phone : 'N/A',
                'weight' => $votes->count(),
                'votes' => $entries,
            ];
        })->values();
    }

    /**
     * Helper to get common voting results data for a specific election, with caching.
     */
    protected function getVotingResultsData(Election $election): array
    {
        return Cache::remember(self::RESULTS_CACHE_PREFIX . $election->id, self::RESULTS_CACHE_TTL, function () use ($election) {

            $results = Candidate::where('election_id', $election->id)
                                ->withSum('votes', 'vote_weight')
                                ->orderByDesc('votes_sum_vote_weight')
                                ->get()
                                ->map(function ($candidate) {
                                    return [
                                        'id' => $candidate->id,
                                        'name' => $candidate->name,
                                        'photo' => $candidate->photo ? asset('storage/' . $candidate->photo) : null,
                                        'votes_count' => (int) $candidate->votes_sum_vote_weight ?? 0,
                                    ];
                                });

            $transferredWeight = (int) Voter::where('election_id', $election->id)->sum('number_of_units');
            $untransferredCount = $this->getUntransferredUnitsCount($election);
            $totalPossibleVotes = $transferredWeight + $untransferredCount;
            $totalVotesCast = (int) Vote::where('election_id', $election->id)->sum('vote_weight');

            return [
                'results' => $results,
                'totalPossibleVotes' => $totalPossibleVotes,
                'totalVotesCast' => $totalVotesCast,
                'transferredWeight' => $transferredWeight,
                'untransferredCount' => $untransferredCount,
            ];
        });
    }
}
