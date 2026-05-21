<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Election;
use App\Models\Vote;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    /**
     * Display the welcome page with a list of active public elections.
     */
    public function index(): Response
    {
        $now = now();

        // 1. Get Ongoing Elections
        $ongoingElections = Election::where('status', 'active')
            ->where('is_public', true)
            ->where('start_time', '<=', $now)
            ->where('end_time', '>=', $now)
            ->orderBy('end_time')
            ->get();

        // 2. Get Completed Elections (that are NOT archived)
        $completedElections = Election::where(function($query) use ($now) {
                $query->where('status', 'completed')
                      ->orWhere(function($q) use ($now) {
                          $q->where('status', 'active')
                            ->where('end_time', '<', $now);
                      });
            })
            ->where('status', '!=', 'archived')
            ->where('is_public', true)
            ->get();

        // Prepare data for the frontend
        $data = [
            'ongoing' => $ongoingElections->map(fn($e) => $this->formatElection($e)),
            'completed' => $completedElections->map(fn($e) => $this->formatElection($e, true)),
            'hasElections' => $ongoingElections->isNotEmpty() || $completedElections->isNotEmpty(),
        ];

        return Inertia::render('welcome', $data);
    }

    private function formatElection($election, $includeResults = false)
    {
        $result = [
            'id' => $election->id,
            'title' => $election->title,
            'description' => $election->description,
            'status' => $election->status,
            'start_time' => $election->start_time?->toDateTimeString(),
            'end_time' => $election->end_time?->toDateTimeString(),
            'slug' => $election->slug,
            'show_results' => $election->show_results,
        ];

        if ($includeResults && $election->show_results) {
            $candidates = $election->candidates()->get();
            $votes = Vote::where('election_id', $election->id)
                ->selectRaw('candidate_id, SUM(vote_weight) as total_weight')
                ->groupBy('candidate_id')
                ->pluck('total_weight', 'candidate_id');

            $resultsData = $candidates->map(function($c) use ($votes) {
                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'photo' => $c->photo ? asset('storage/' . $c->photo) : null,
                    'votes' => (float)($votes[$c->id] ?? 0),
                ];
            })->sortByDesc('votes')->values();

            $result['results'] = $resultsData;
            $result['winner'] = $resultsData->first();
            $result['total_votes'] = $resultsData->sum('votes');
        }

        return $result;
    }
}
