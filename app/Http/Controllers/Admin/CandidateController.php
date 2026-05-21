<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Election; // Import the Election model
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CandidateController extends Controller
{
    /**
     * Use constructor for common authorization checks.
     */
    public function __construct()
    {
        $this->middleware('permission:viewCandidates')->only('index');
        $this->middleware('permission:createCandidates')->only(['create', 'store']);
        $this->middleware('permission:editCandidates')->only(['edit', 'update']);
        $this->middleware('permission:deleteCandidates')->only('destroy');
    }

    /**
     * Display a listing of candidates, filtered by election.
     */
    public function index(Request $request): Response
    {
        $query = Candidate::latest();

        // Filter by election_id if provided
        if ($electionId = $request->input('election_id')) {
            $query->where('election_id', $electionId);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $candidates = $query->paginate(10)->withQueryString()->through(fn ($candidate) => [
            'id' => $candidate->id,
            'election_id' => $candidate->election_id,
            'name' => $candidate->name,
            'phone' => $candidate->phone,
            'description' => $candidate->description,
            'photo' => $candidate->photo ? asset('storage/' . $candidate->photo) : null,
            'created_at' => $candidate->created_at,
        ]);
        $elections = Election::orderBy('title')->get(['id', 'title']); // Get list of elections for dropdown

        return Inertia::render('Admin/Voting/Candidates/Index', [
            'candidates' => $candidates,
            'elections' => $elections,
            'filters' => $request->only(['search', 'election_id']),
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Elections', 'url' => route('admin_elections_index')],
                ['label' => 'Manage Candidates', 'url' => route('admin_candidates_index')],
            ]
            // 'can' => [
            //     'createCandidates' => auth()->user()->can('createCandidates'),
            //     'editCandidates' => auth()->user()->can('editCandidates'),
            //     'deleteCandidates' => auth()->user()->can('deleteCandidates'),
            // ]
        ]);
    }

    /**
     * Show the form for creating a new candidate for a specific election.
     */
    public function create(Request $request): Response
    {
        $elections = Election::orderBy('title')->get(['id', 'title']);
        
        $selectedElectionId = $request->input('election_id');
        
        // If 'all' is passed from the index filter, or if nothing is passed, default to first election
        if ($selectedElectionId === 'all' || !$selectedElectionId) {
            $selectedElectionId = $elections->first()->id ?? null;
        }

        return Inertia::render('Admin/Voting/Candidates/Create', [
            'elections' => $elections,
            'selectedElectionId' => $selectedElectionId ? (int) $selectedElectionId : null,
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Elections', 'url' => route('admin_elections_index')],
                ['label' => 'Manage Candidates', 'url' => route('admin_candidates_index')],
                ['label' => 'Create Candidate', 'url' => route('admin_candidates_create')],
            ],
        ]);
    }

    /**
     * Store a newly created candidate in storage for a specific election.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'election_id' => 'required|integer|exists:elections,id', // Candidate must belong to an election
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'photo' => 'nullable|image|max:2048', // Max 2MB
        ]);

        // Safety check: Cannot create candidate if election is active
        $election = Election::findOrFail($request->election_id);
        if ($election->status === 'active') {
            return back()->with('error', '❌ Cannot add candidates while the associated election is ACTIVE.');
        }

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('candidate-photos', 'public');
        }

        Candidate::create([
            'election_id' => $request->election_id,
            'name' => $request->name,
            'phone' => $request->phone,
            'description' => $request->description,
            'photo' => $photoPath,
        ]);

        return redirect()->route('admin_candidates_index', ['election_id' => $request->election_id])->with('success', '✅ Candidate created successfully!');
    }

    /**
     * Show the form for editing the specified candidate.
     */
    public function edit(Candidate $candidate): Response
    {
        $elections = Election::orderBy('title')->get(['id', 'title']);

        return Inertia::render('Admin/Voting/Candidates/Edit', [
            'candidate' => [
                'id' => $candidate->id,
                'election_id' => $candidate->election_id, // Added
                'name' => $candidate->name,
                'phone' => $candidate->phone,
                'description' => $candidate->description,
                'photo' => $candidate->photo ? asset('storage/' . $candidate->photo) : null, // Public URL
            ],
            'elections' => $elections,
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Elections', 'url' => route('admin_elections_index')],
                ['label' => 'Manage Candidates', 'url' => route('admin_candidates_index')],
                ['label' => 'Edit Candidate', 'url' => route('admin_candidates_edit', $candidate->id)],
            ],
        ]);
    }

    /**
     * Update the specified candidate in storage.
     */
    public function update(Request $request, Candidate $candidate): RedirectResponse
    {
        $request->validate([
            'election_id' => 'required|integer|exists:elections,id', // Candidate must belong to an election
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'photo' => 'nullable|image|max:2048',
            'remove_photo' => 'boolean', // To handle photo removal
        ]);

        // Safety check: Cannot modify candidate data if election is active
        $election = Election::findOrFail($request->election_id);
        if ($election->status === 'active') {
            return back()->with('error', '❌ Cannot update candidate data while their associated election is ACTIVE.');
        }

        $photoPath = $candidate->photo;
        if ($request->hasFile('photo')) {
            if ($candidate->photo && Storage::disk('public')->exists($candidate->photo)) {
                Storage::disk('public')->delete($candidate->photo);
            }
            $photoPath = $request->file('photo')->store('candidate-photos', 'public');
        } elseif ($request->boolean('remove_photo')) {
            if ($candidate->photo && Storage::disk('public')->exists($candidate->photo)) {
                Storage::disk('public')->delete($candidate->photo);
            }
            $photoPath = null;
        }

        $candidate->update([
            'election_id' => $request->election_id,
            'name' => $request->name,
            'phone' => $request->phone,
            'description' => $request->description,
            'photo' => $photoPath,
        ]);

        return redirect()->route('admin_candidates_index', ['election_id' => $request->election_id])->with('success', '✅ Candidate updated successfully!');
    }

    /**
     * Remove the specified candidate from storage.
     */
    public function destroy(Candidate $candidate): RedirectResponse
    {
        // Safety check: Cannot delete candidate if election is active
        if ($candidate->election && $candidate->election->status === 'active') {
            return back()->with('error', '❌ Cannot delete candidate while their associated election is ACTIVE.');
        }

        try {
            if ($candidate->photo && Storage::disk('public')->exists($candidate->photo)) {
                Storage::disk('public')->delete($candidate->photo);
            }
            $candidate->delete();
            return redirect()->route('admin_candidates_index', ['election_id' => $candidate->election_id])->with('success', '🗑️ Candidate deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Error deleting candidate: ' . $e->getMessage(), ['candidate_id' => $candidate->id, 'exception' => $e]);
            return back()->with('error', '❌ Failed to delete candidate. An unexpected error occurred.');
        }
    }
}
// namespace App\Http\Controllers\Admin;

// use App\Http\Controllers\Controller;
// use App\Models\Candidate;
// use Illuminate\Http\Request;
// use Illuminate\Http\RedirectResponse;
// use Inertia\Inertia;
// use Inertia\Response;
// use Illuminate\Validation\Rule;
// use Illuminate\Support\Facades\Storage;
// use Illuminate\Support\Facades\Log;

// class CandidateController extends Controller
// {
//     /**
//      * Use constructor for common authorization checks.
//      */
//     public function __construct()
//     {
//         $this->middleware('permission:viewCandidates')->only('index');
//         $this->middleware('permission:createCandidates')->only(['create', 'store']);
//         $this->middleware('permission:editCandidates')->only(['edit', 'update']);
//         $this->middleware('permission:deleteCandidates')->only('destroy');
//     }

//     /**
//      * Display a listing of candidates.
//      */
//     public function index(Request $request): Response
//     {
//         $query = Candidate::query();

//         if ($search = $request->input('search')) {
//             $query->where(function ($q) use ($search) {
//                 $q->where('name', 'like', "%{$search}%")
//                   ->orWhere('phone', 'like', "%{$search}%");
//             });
//         }

//         $candidates = $query->latest()->paginate(10)->withQueryString();

//         return Inertia::render('Admin/Voting/Candidates/Index', [
//             'candidates' => $candidates,
//             'filters' => $request->only(['search']),
//             'breadcrumbs' => [
//                 ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
//                 ['label' => 'Voting System', 'url' => '#'],
//                 ['label' => 'Manage Candidates', 'url' => route('admin_candidates_index')],
//             ],
//         ]);
//     }

//     /**
//      * Show the form for creating a new candidate.
//      */
//     public function create(): Response
//     {
//         return Inertia::render('Admin/Voting/Candidates/Create', [
//             'breadcrumbs' => [
//                 ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
//                 ['label' => 'Voting System', 'url' => '#'],
//                 ['label' => 'Manage Candidates', 'url' => route('admin_candidates_index')],
//                 ['label' => 'Create Candidate', 'url' => route('admin_candidates_create')],
//             ],
//         ]);
//     }

//     /**
//      * Store a newly created candidate in storage.
//      */
//     public function store(Request $request): RedirectResponse
//     {
//         $request->validate([
//             'name' => 'required|string|max:255',
//             'phone' => 'nullable|string|max:255',
//             'description' => 'nullable|string|max:1000',
//             'photo' => 'nullable|image|max:2048', // Max 2MB
//         ]);

//         $photoPath = null;
//         if ($request->hasFile('photo')) {
//             $photoPath = $request->file('photo')->store('candidate-photos', 'public');
//         }

//         Candidate::create([
//             'name' => $request->name,
//             'phone' => $request->phone,
//             'description' => $request->description,
//             'photo' => $photoPath,
//         ]);

//         return redirect()->route('admin_candidates_index')->with('success', '✅ Candidate created successfully!');
//     }

//     /**
//      * Show the form for editing the specified candidate.
//      */
//     public function edit(Candidate $candidate): Response
//     {
//         return Inertia::render('Admin/Voting/Candidates/Edit', [
//             'candidate' => [
//                 'id' => $candidate->id,
//                 'name' => $candidate->name,
//                 'phone' => $candidate->phone,
//                 'description' => $candidate->description,
//                 'photo' => $candidate->photo ? asset('storage/' . $candidate->photo) : null, // Public URL
//             ],
//             'breadcrumbs' => [
//                 ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
//                 ['label' => 'Voting System', 'url' => '#'],
//                 ['label' => 'Manage Candidates', 'url' => route('admin_candidates_index')],
//                 ['label' => 'Edit Candidate', 'url' => route('admin_candidates_edit', $candidate->id)],
//             ],
//         ]);
//     }

//     /**
//      * Update the specified candidate in storage.
//      */
//     public function update(Request $request, Candidate $candidate): RedirectResponse
//     {
//         $request->validate([
//             'name' => 'required|string|max:255',
//             'phone' => 'nullable|string|max:255',
//             'description' => 'nullable|string|max:1000',
//             'photo' => 'nullable|image|max:2048',
//         ]);

//         $photoPath = $candidate->photo;
//         if ($request->hasFile('photo')) {
//             if ($candidate->photo && Storage::disk('public')->exists($candidate->photo)) {
//                 Storage::disk('public')->delete($candidate->photo);
//             }
//             $photoPath = $request->file('photo')->store('candidate-photos', 'public');
//         } elseif ($request->boolean('remove_photo')) {
//             if ($candidate->photo && Storage::disk('public')->exists($candidate->photo)) {
//                 Storage::disk('public')->delete($candidate->photo);
//             }
//             $photoPath = null;
//         }

//         $candidate->update([
//             'name' => $request->name,
//             'phone' => $request->phone,
//             'description' => $request->description,
//             'photo' => $photoPath,
//         ]);

//         return redirect()->route('admin_candidates_index')->with('success', '✅ Candidate updated successfully!');
//     }

//     /**
//      * Remove the specified candidate from storage.
//      */
//     public function destroy(Candidate $candidate): RedirectResponse
//     {
//         try {
//             if ($candidate->photo && Storage::disk('public')->exists($candidate->photo)) {
//                 Storage::disk('public')->delete($candidate->photo);
//             }
//             $candidate->delete();
//             return redirect()->route('admin_candidates_index')->with('success', '🗑️ Candidate deleted successfully!');
//         } catch (\Exception $e) {
//             Log::error('Error deleting candidate: ' . $e->getMessage(), ['candidate_id' => $candidate->id, 'exception' => $e]);
//             return back()->with('error', '❌ Failed to delete candidate. An unexpected error occurred.');
//         }
//     }
// }
