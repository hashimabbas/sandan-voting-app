<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voter;
use App\Models\Election; // Import the Election model
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\VoterImport;
use Illuminate\Support\Facades\Log;
// Removed the old VoteController alias as it's now ElectionController
use App\Http\Controllers\Admin\ElectionController; // Use the new ElectionController for constants

class VoterController extends Controller
{
    /**
     * Use constructor for common authorization checks.
     */
    public function __construct()
    {
        $this->middleware('permission:viewVoters')->only('index');
        $this->middleware('permission:importVoters')->only('import');
        $this->middleware('permission:editVoters')->only(['edit', 'update']);
        $this->middleware('permission:deleteVoters')->only('destroy');
        // $this->middleware('permission:deleteVoters')->only(['destroy', 'bulkDestroy']);
    }

    /**
     * Display a listing of voters, filtered by election.
     */
    public function index(Request $request): Response
    {
        $query = Voter::latest();

        // Filter by election_id if provided
        if ($electionId = $request->input('election_id')) {
            $query->where('election_id', $electionId);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('voter_id_no', 'like', "%{$search}%");
            });
        }

        // Increase pagination limit significantly to show 'all' records in a single matrix
        $voters = $query->paginate(10000)->withQueryString();
        $elections = Election::orderBy('title')->get(['id', 'title']); // Get list of elections for dropdown

        return Inertia::render('Admin/Voting/Voters/Index', [
            'voters' => $voters,
            'elections' => $elections,
            'filters' => $request->only(['search', 'election_id']),
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Elections', 'url' => route('admin_elections_index')],
                ['label' => 'Manage Voters', 'url' => route('admin_voters_index')],
            ]
            // 'can' => [
            //     'importVoters' => auth()->user()->can('importVoters'),
            //     'editVoters' => auth()->user()->can('editVoters'),
            //     'deleteVoters' => auth()->user()->can('deleteVoters'),
            // ]
        ]);
    }

    /**
     * Import voters from an Excel file for a specific election.
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // Max 10MB, 'file' rule for UploadedFile
            'election_id' => 'required|integer|exists:elections,id', // Must specify an election
        ]);

        $election = Election::findOrFail($request->election_id);

        // Safety check: Cannot import or update voters for an active election
        if ($election->status === 'active') {
            return back()->with('error', '❌ Cannot import or update voters for an ACTIVE election. Please deactivate it first.');
        }

        try {
            // --- NEW: Use your custom VoterImport class directly ---
            $importer = new VoterImport($election->id, $request->file('file'));
            $importer->import(); // Call the custom import method

            $message = "Voters Import completed for election \"{$election->title}\": Inserted: {$importer->inserted}, Updated: {$importer->updated}, Skipped: {$importer->skipped}";

            if (!empty($importer->errors)) {
                $errorMessage = " Some rows had errors. Check logs for details. Errors: " . implode('; ', $importer->errors);
                Log::error('Voter Import Errors (PhpSpreadsheet):', ['errors' => $importer->errors]);
                return back()->with('error', $message . $errorMessage);
            }

            return back()->with('success', $message);

        } catch (\Exception $e) {
            Log::error('Voter Import Failed (PhpSpreadsheet): ' . $e->getMessage(), ['exception' => $e]);
            return back()->with('error', '❌ Voter import failed: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified voter.
     */
    public function edit(Voter $voter): Response
    {
        $elections = Election::orderBy('title')->get(['id', 'title']); // Get list of elections for dropdown

        return Inertia::render('Admin/Voting/Voters/Edit', [
            'voter' => $voter,
            'elections' => $elections,
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Elections', 'url' => route('admin_elections_index')],
                ['label' => 'Manage Voters', 'url' => route('admin_voters_index')],
                ['label' => 'Edit Voter', 'url' => route('admin_voters_edit', $voter->id)],
            ],
        ]);
    }

    /**
     * Update the specified voter in storage.
     */
    public function update(Request $request, Voter $voter): RedirectResponse
    {
        $request->validate([
            'election_id' => ['required', 'integer', 'exists:elections,id'],
            'voter_id_no' => ['required', 'string', 'max:255', Rule::unique('voters')->ignore($voter->id)->where(function ($query) use ($request) {
                return $query->where('election_id', $request->election_id);
            })],
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'number_of_units' => 'required|integer|min:0',
            'building_no' => 'nullable|string|max:255',
            'unit_name' => 'nullable|string|max:255',
            'mulkiya_status' => 'nullable|string|max:255',
            'has_voted' => 'boolean',
        ]);

        // Safety check: Cannot modify voter data if election is active
        $election = Election::findOrFail($request->election_id);
        if ($election->status === 'active') {
            return back()->with('error', '❌ Cannot update voter data while their associated election is ACTIVE.');
        }

        $voter->update($request->only([
            'election_id', 'voter_id_no', 'name', 'phone', 'number_of_units', 
            'building_no', 'unit_name', 'mulkiya_status', 'has_voted'
        ]));

        return redirect()->route('admin_voters_index', ['election_id' => $voter->election_id])->with('success', '✅ Voter updated successfully!');
    }

    /**
     * Remove the specified voter from storage.
     */
    public function destroy(Voter $voter): RedirectResponse
    {
        // Safety check: Cannot delete voter if election is active
        if ($voter->election && $voter->election->status === 'active') {
            return back()->with('error', '❌ Cannot delete voter while their associated election is ACTIVE.');
        }

        $voter->delete();
        // Redirect back to the voters list, potentially filtered by the election they belonged to
        return redirect()->route('admin_voters_index', ['election_id' => $voter->election_id])->with('success', '🗑️ Voter deleted successfully!');
    }

    /**
     * Remove all voters (optionally filtered by election).
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        Log::info('BulkDestroy requested', ['all_input' => $request->all()]);
        
        $query = Voter::query();

        if ($electionId = $request->input('election_id')) {
            Log::info('Filtering by election_id', ['id' => $electionId]);
            $election = Election::find($electionId);
            if ($election && $election->status === 'active') {
                return back()->with('error', '❌ Cannot delete voters for an ACTIVE election.');
            }
            $query->where('election_id', $electionId);
        } else {
            Log::info('Deleting ALL voters');
            // If deleting all, check if ANY active election exists with voters
            $activeElectionVotersExist = Voter::whereHas('election', function($q) {
                $q->where('status', 'active');
            })->exists();

            if ($activeElectionVotersExist) {
                Log::warning('Delete all blocked: active elections exist');
                return back()->with('error', '❌ Cannot delete all voters because some belong to an ACTIVE election.');
            }
        }

        $count = $query->count();
        Log::info('Found voters to delete', ['count' => $count]);
        $query->delete();

        return back()->with('success', "🗑️ Successfully deleted {$count} voters!");
    }
}
