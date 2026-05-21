<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Owner;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;

class OwnerComplaintController extends Controller
{
    /**
     * Display a listing of complaints for the authenticated owner.
     */
     public function index(): Response
    {
        $owner = Auth::guard('owner')->user();
        if (!$owner) {
            return redirect()->route('owner_login')->with('error', 'Authentication required.');
        }

        $complaints = Complaint::where('owner_id', $owner->id)
                               ->with(['unit', 'workOrder' => function($query) { // <--- EAGER LOAD WORK ORDER
                                   $query->select('id', 'complaint_id', 'status'); // Select only necessary WO fields
                               }])
                               ->latest()
                               ->paginate(10);

        // Map complaints to add work_order_status directly to each complaint object
        $complaints->getCollection()->transform(function ($complaint) {
            $complaint->work_order_id = $complaint->workOrder->id ?? null;
            $complaint->work_order_status = $complaint->workOrder->status ?? null;
            return $complaint;
        });


        return Inertia::render('Owner/Complaint/Index', [
            'complaints' => $complaints,
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('owner_dashboard')],
                ['label' => 'My Complaints', 'url' => route('owner_complaints_index')],
            ],
        ]);
    }

    /**
     * Show the form for creating a new complaint.
     */
    public function create(): Response
    {
        $owner = Auth::guard('owner')->user();
        if (!$owner) {
            return redirect()->route('owner_login')->with('error', 'Authentication required.');
        }

        // Get owner's units for the dropdown
        $units = $owner->units()->select('id', 'unit_code')->get();

        return Inertia::render('Owner/Complaint/Create', [
            'units' => $units,
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('owner_dashboard')],
                ['label' => 'My Complaints', 'url' => route('owner_complaints_index')],
                ['label' => 'Submit New', 'url' => route('owner_complaints_create')],
            ],
        ]);
    }

    /**
     * Store a newly created complaint in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $owner = Auth::guard('owner')->user();
        if (!$owner) {
            return back()->with('error', 'Authentication required.');
        }

        $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'unit_id' => [
                'nullable', // Unit ID is optional
                'integer',
                // Ensure the unit belongs to the owner if provided
                Rule::exists('units', 'id')->where(function ($query) use ($owner) {
                    $query->where('owner_id_no', $owner->owner_id_no);
                }),
            ],
        ]);

        Complaint::create([
            'owner_id' => $owner->id,
            'unit_id' => $request->unit_id,
            'subject' => $request->subject,
            'description' => $request->description,
            'status' => 'pending', // Default status
        ]);

        return redirect()->route('owner_complaints_index')->with('success', '✅ Your complaint has been submitted successfully!');
    }
}
