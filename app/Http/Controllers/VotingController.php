<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Vote;
use App\Models\Voter;
use App\Models\Building;
use App\Models\Unit;
use App\Models\Owner;
use App\Models\Election;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class VotingController extends Controller
{
    public function showVoterIdForm(Request $request): Response | RedirectResponse
    {
        if (session('voter_authenticated')) {
            $voter = Voter::find(session('voter_id'));
            $election = Election::find(session('election_id'));
            
            if ($voter && $election) {
                // If they have already finalized their vote, send to thank you page
                if (session('view_results_only')) {
                    return redirect()->route('vote_thank_you');
                }
                
                // Otherwise, let them continue voting from where they left off
                return redirect()->route('vote_cast_vote_page');
            }
            
            // If session is stale (voter or election deleted), clear it
            session()->forget(['voter_authenticated', 'voter_id', 'election_id', 'eligible_unit_ids', 'view_results_only']);
        }

        $electionId = $request->query('election_id');
        
        // Auto-detect active election if not provided in URL
        if (!$electionId) {
            $activeElection = Election::where('status', 'active')
                ->latest() // Get the most recently created active election
                ->first();
            
            if ($activeElection) {
                $electionId = $activeElection->id;
            }
        }

        // If still no election ID, we can still show the form but with a warning, 
        // or check if there's a completed election to view results.
        $election = $electionId ? Election::find($electionId) : null;

        return Inertia::render('Voting/VoterLogin', [
            'buildings' => Building::select('id', 'name')->get(),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
                'info' => session('info'),
            ],
            'errors' => session('errors') ? session('errors')->getBag('default')->toArray() : [],
            'election_id' => $electionId,
            'election' => $election,
        ]);
    }

    public function getUnits(Building $building, Request $request)
    {
        $electionId = $request->query('election_id');
        
        if (!$electionId) {
            $fallbackElection = Election::where('status', 'active')->latest()->first();
            if ($fallbackElection) {
                $electionId = $fallbackElection->id;
            }
        }

        $voterUnits = collect();
        if ($electionId) {
            $paddedBuilding = is_numeric($building->name) ? str_pad($building->name, 2, '0', STR_PAD_LEFT) : $building->name;
            $voters = Voter::where('election_id', $electionId)->get();
            
            $units = [];
            foreach ($voters as $voter) {
                $bldgStr = $voter->building_no ?? '';
                $bldgArray = array_map('trim', explode(',', $bldgStr));
                
                if (in_array((string)$building->name, $bldgArray, true)) {
                    $names = $voter->unit_name ? array_map('trim', explode(',', $voter->unit_name)) : [];
                    foreach ($names as $name) {
                        if (empty($name)) continue;
                        
                        $matchesBuilding = false;
                        if (is_numeric($building->name)) {
                            if (str_starts_with($name, $paddedBuilding . '/') || str_starts_with($name, $building->name . '/')) {
                                $matchesBuilding = true;
                            }
                        } else {
                            if (!str_contains($name, '/')) {
                                $matchesBuilding = true;
                            }
                        }
                        
                        if ($matchesBuilding) {
                            $units[] = [
                                'id' => "voter_{$voter->id}",
                                'unit_name' => $name,
                                'ownership_status' => $voter->mulkiya_status,
                                'type' => 'voter_import'
                            ];
                        }
                    }
                }
            }
            $voterUnits = collect($units)->unique('unit_name')->values();
        }

        return response()->json($voterUnits);
    }

    public function voterLogin(Request $request): RedirectResponse
    {
        \Log::info("Voter Login Attempt Started", $request->all());

        $request->validate([
            'unit_id' => 'nullable|string', // Changed from exists:units,id to string to allow voter_ prefix
            'civil_id' => 'nullable|string',
            'phone' => 'nullable|string',
            'election_id' => 'nullable|exists:elections,id', // Allow null so we can fallback
        ]);

        $unitId = $request->unit_id;
        $civilId = $request->civil_id;
        $phone = $request->phone;
        $electionId = $request->election_id;

        // Count provided factors
        $providedFactors = 0;
        if ($unitId) $providedFactors++;
        if ($civilId) $providedFactors++;
        if ($phone) $providedFactors++;

        if ($providedFactors < 2) {
            return back()->withErrors(['global' => '❌ Please provide at least two verification factors (Unit, ID, or Phone).']);
        }

        // Identify Election if not provided
        if (!$electionId) {
            $fallbackElection = Election::where('status', 'active')->latest()->first();
            if ($fallbackElection) {
                $electionId = $fallbackElection->id;
            } else {
                return back()->withErrors(['global' => '❌ No active election found. Please contact administration.']);
            }
        }

        // Load Election
        $election = Election::find($electionId);
        if (!$election || ($election->status !== 'active' && $election->status !== 'completed')) {
            return back()->withErrors(['global' => '❌ This election is currently closed.']);
        }

        if ($election->status === 'active' && !$election->isActive()) {
             return back()->withErrors(['global' => '❌ This election is currently outside the active voting period.']);
        }

        $voterRecord = null;

        if ($unitId) {
            // Unit was provided from the dropdown (which only returns voter_ IDs now)
            if (str_starts_with($unitId, 'voter_')) {
                $voterId = str_replace('voter_', '', $unitId);
                $voterRecord = Voter::where('id', $voterId)->where('election_id', $electionId)->first();
                
                if ($voterRecord) {
                    // Verify against Voter record factors (we need at least 1 more factor to match)
                    $matchFound = false;
                    if ($civilId && trim($voterRecord->voter_id_no) === trim($civilId)) $matchFound = true;
                    if ($phone && trim($voterRecord->phone) === trim($phone)) $matchFound = true;
                    
                    if (!$matchFound) {
                        return back()->withErrors(['global' => '❌ Verification failed. The provided ID/Phone does not match the unit owner in the Voter list.']);
                    }
                } else {
                    return back()->withErrors(['global' => '❌ Selected unit not found in this election.']);
                }
            } else {
                // If the frontend somehow sent a numeric ID (cached Master Registry data)
                return back()->withErrors(['global' => '❌ Please refresh the page and select the unit again to sync with the updated Voter list.']);
            }
        } else {
            // Factor Check: ID + Phone (No Unit provided)
            $voterRecord = Voter::where('election_id', $electionId)
                ->where(function($q) use ($civilId, $phone) {
                    // Must match exactly what is in the Excel Voter List
                    $q->where('voter_id_no', $civilId)->where('phone', $phone);
                })
                ->first();

            if (!$voterRecord) {
                \Log::info("Voter Login Failed: ID + Phone did not match any Voter record.", ['civilId' => $civilId, 'phone' => $phone]);
                return back()->withErrors(['global' => '❌ Verification failed. The provided ID and Phone do not match our Voter records.']);
            }
        }

        if (!$voterRecord) {
            return back()->withErrors(['global' => '❌ You are not registered in the voters list for this election. Please contact support.']);
        }

        // --- ENFORCE MULKIYA STATUS (Must be Transferred) ---
        $voterStatus = strtolower(trim($voterRecord->mulkiya_status ?? ''));
        if ($voterStatus !== 'transferred' && $voterStatus !== 'محولة') {
            \Log::info("Voter Login Failed: Mulkiya Status is not Transferred.", ['voter_id' => $voterRecord->id, 'status' => $voterRecord->mulkiya_status]);
            return back()->withErrors(['global' => '❌ This unit is not eligible for owner voting (Mulkiya Status is not Transferred). Only the Admin can vote on your behalf.']);
        }

        // Calculate remaining votes strictly based on the Voter record's weight
        $votedCount = Vote::where('voter_id', $voterRecord->id)
            ->where('election_id', $electionId)
            ->count();

        $totalWeight = $voterRecord->number_of_units ?? 0;
        $remainingVotesCount = max(0, $totalWeight - $votedCount);

        // We use virtual units (placeholders) to ensure the count is EXACTLY what's in the Excel.
        // This avoids discrepancies between the master registry and the imported election data.
        $eligibleUnitIds = array_fill(0, $remainingVotesCount, 'voter_unit');

        if (empty($eligibleUnitIds) || $election->status === 'completed') {
            session([
                'voter_authenticated' => true,
                'voter_id' => $voterRecord->id,
                'election_id' => $electionId,
                'view_results_only' => true
            ]);
            return redirect()->route('vote_thank_you');
        }

        session([
            'voter_authenticated' => true,
            'voter_id' => $voterRecord->id, // ID from 'voters' table
            'election_id' => $electionId,
            'login_unit_id' => $unitId ?? "voter_{$voterRecord->id}",
            'eligible_unit_ids' => $eligibleUnitIds,
        ]);

        return redirect()->route('vote_cast_vote_page');
    }

    public function showCastVotePage(): Response | RedirectResponse
    {
        if (!session('voter_authenticated')) {
            return redirect()->route('vote_show_voter_id_form');
        }

        if (session('view_results_only')) {
            return redirect()->route('vote_thank_you');
        }

        $voter = Voter::find(session('voter_id'));
        $election = Election::with('candidates')->find(session('election_id'));
        $eligibleUnitIds = session('eligible_unit_ids', []);
        
        // Use unit names from the Voter record (Excel) as the source of truth for display
        $unitNamesFromRecord = $voter->unit_name ? array_map('trim', explode(',', $voter->unit_name)) : [];
        $units = collect();
        
        foreach ($eligibleUnitIds as $index => $unitId) {
            $name = $unitNamesFromRecord[$index] ?? ("Vote #" . ($index + 1));
            $units->push((object)[
                'unit_name' => $name,
                'building' => (object)['name' => $voter->building_no ?? 'N/A']
            ]);
        }

        if (!$voter || !$election || (empty($eligibleUnitIds) && $units->isEmpty())) {
            session()->forget(['voter_authenticated', 'voter_id', 'election_id', 'eligible_unit_ids', 'view_results_only']);
            return redirect()->route('vote_show_voter_id_form');
        }

        // --- NEW: Force logout if election is no longer active ---
        if ($election->status !== 'active') {
            session()->forget(['voter_authenticated', 'voter_id', 'election_id', 'eligible_unit_ids', 'view_results_only']);
            return redirect()->route('vote_show_voter_id_form')->with('error', '❌ This election has ended or been closed.');
        }

        // --- ENFORCE MULKIYA STATUS ---
        $voterStatus = strtolower(trim($voter->mulkiya_status ?? ''));
        if ($voterStatus !== 'transferred' && $voterStatus !== 'محولة') {
            session()->forget(['voter_authenticated', 'voter_id', 'election_id', 'eligible_unit_ids', 'view_results_only']);
            return redirect()->route('vote_show_voter_id_form')->with('error', '❌ This unit is not eligible for owner voting (Mulkiya Status is not Transferred).');
        }

        return Inertia::render('Voting/CastVote', [
            'voter' => [
                'id' => $voter->id,
                'name' => $voter->name,
                'number_of_units' => count($eligibleUnitIds),
                'units' => $units->map(fn($u) => [
                    'unit_name' => $u->unit_name,
                    'building_name' => $u->building->name ?? 'N/A'
                ])
            ],
            'election' => $election,
            'candidates' => $election->candidates->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'photo' => $c->photo ? asset('storage/' . $c->photo) : null,
                'description' => $c->description,
            ]),
        ]);
    }

    public function castVote(Request $request): RedirectResponse
    {
        if (!session('voter_authenticated')) {
            return redirect()->route('vote_show_voter_id_form');
        }

        if (session('view_results_only')) {
            return redirect()->route('vote_thank_you');
        }

        $request->validate([
            'votes' => 'required|array',
            'votes.*.candidate_id' => 'required|exists:candidates,id',
            'votes.*.count' => 'required|integer|min:1',
        ]);

        $ownerId = session('voter_id');
        $electionId = session('election_id');
        $eligibleUnitIds = session('eligible_unit_ids');

        $election = Election::find($electionId);

        // --- NEW: Force logout if election is no longer active ---
        if (!$election || $election->status !== 'active') {
            session()->forget(['voter_authenticated', 'voter_id', 'election_id', 'eligible_unit_ids', 'view_results_only']);
            return redirect()->route('vote_show_voter_id_form')->with('error', '❌ This election has ended or been closed.');
        }

        // --- ENFORCE MULKIYA STATUS ---
        $voter = Voter::find($ownerId);
        $voterStatus = strtolower(trim($voter->mulkiya_status ?? ''));
        if ($voterStatus !== 'transferred' && $voterStatus !== 'محولة') {
            session()->forget(['voter_authenticated', 'voter_id', 'election_id', 'eligible_unit_ids', 'view_results_only']);
            return redirect()->route('vote_show_voter_id_form')->with('error', '❌ This unit is not eligible for owner voting (Mulkiya Status is not Transferred).');
        }

        $totalVotesRequested = collect($request->votes)->sum('count');

        if ($totalVotesRequested > count($eligibleUnitIds)) {
            return back()->withErrors(['votes' => "❌ You can only cast " . count($eligibleUnitIds) . " votes."]);
        }

        try {
            DB::beginTransaction();

            $unitIndex = 0;
            foreach ($request->votes as $voteData) {
                for ($i = 0; $i < $voteData['count']; $i++) {
                    if ($unitIndex >= count($eligibleUnitIds)) break;

                    $unitIdToSave = $eligibleUnitIds[$unitIndex];
                    if ($unitIdToSave === 'voter_unit') {
                        $unitIdToSave = null;
                    }

                    Vote::create([
                        'election_id' => $electionId,
                        'voter_id' => $ownerId, // Mapping Owner ID to voter_id column
                        'candidate_id' => $voteData['candidate_id'],
                        'unit_id' => $unitIdToSave,
                        'vote_weight' => 1,
                    ]);
                    $unitIndex++;
                }
            }

            DB::commit();

            // Clear results cache for this election so results are updated immediately
            \Illuminate\Support\Facades\Cache::forget('election_results_' . $electionId);

            // Mark voter as having voted
            Voter::where('id', $ownerId)->update(['has_voted' => true]);

            // Update session eligible units
            $remainingUnitIds = array_slice($eligibleUnitIds, $totalVotesRequested);
            if (count($remainingUnitIds) === 0) {
                session(['view_results_only' => true]);
                session()->forget('eligible_unit_ids');
            } else {
                session(['eligible_unit_ids' => $remainingUnitIds]);
                // We DO NOT set view_results_only because they still have votes left.
            }

            return redirect()->route('vote_thank_you')->with('success', '✅ Your votes have been recorded successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Vote Casting Error: " . $e->getMessage());
            return back()->withErrors(['global' => '❌ An error occurred while processing your votes.']);
        }
    }

    public function thankYou(): Response | RedirectResponse
    {
        if (!session('voter_authenticated')) {
            return redirect()->route('vote_show_voter_id_form');
        }

        $voter = Voter::find(session('voter_id'));
        $election = Election::with(['candidates'])->find(session('election_id'));

        if (!$voter || !$election) {
            session()->forget(['voter_authenticated', 'voter_id', 'election_id', 'eligible_unit_ids', 'view_results_only']);
            return redirect()->route('vote_show_voter_id_form');
        }

        // Get voter's specific choices
        $myVotes = Vote::where('voter_id', $voter->id)
            ->where('election_id', $election->id)
            ->with('candidate')
            ->get()
            ->groupBy('candidate_id')
            ->map(function ($votes) {
                return [
                    'candidate_id' => $votes->first()->candidate_id,
                    'candidate_name' => $votes->first()->candidate->name,
                    'candidate_photo' => $votes->first()->candidate->photo ? asset('storage/' . $votes->first()->candidate->photo) : null,
                    'count' => $votes->count(),
                ];
            })->values();

        // Get overall results if enabled
        $overallResults = null;
        if ($election->show_results) {
            $totalVotes = Vote::where('election_id', $election->id)->count();
            
            $overallResults = Vote::where('election_id', $election->id)
                ->select('candidate_id', DB::raw('count(*) as vote_count'))
                ->groupBy('candidate_id')
                ->with('candidate')
                ->get()
                ->map(function ($v) use ($totalVotes) {
                    return [
                        'candidate_id' => $v->candidate_id,
                        'candidate_name' => $v->candidate->name,
                        'candidate_photo' => $v->candidate->photo ? asset('storage/' . $v->candidate->photo) : null,
                        'votes' => $v->vote_count,
                        'percentage' => $totalVotes > 0 ? round(($v->vote_count / $totalVotes) * 100, 1) : 0,
                    ];
                })->sortByDesc('votes')->values();
        }

        return Inertia::render('Voting/VoterResults', [
            'voter' => $voter,
            'election' => $election,
            'myVotes' => $myVotes,
            'showResults' => $election->show_results,
            'overallResults' => $overallResults,
            'flash' => [
                'success' => session('success'),
            ]
        ]);
    }

    public function voterLogout(): RedirectResponse
    {
        session()->forget(['voter_authenticated', 'voter_id', 'election_id', 'eligible_unit_ids', 'view_results_only']);
        return redirect()->route('vote_show_voter_id_form')->with('info', 'You have been logged out.');
    }
}
