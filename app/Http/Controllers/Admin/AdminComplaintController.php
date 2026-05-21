<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Owner;
use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AdminComplaintController extends Controller
{
    /**
     * Display a listing of all complaints for admin.
     */
    public function index(Request $request): Response
    {
        $query = Complaint::with(['owner', 'unit'])
                          ->latest('created_at'); // Order by newest complaints first

        // --- Filtering Logic ---
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('owner_id') && $request->input('owner_id') !== 'all') {
            $query->where('owner_id', $request->input('owner_id'));
        }
        if ($request->filled('unit_code')) {
            $unit = \App\Models\Unit::where('unit_code', 'like', '%' . $request->input('unit_code') . '%')->first();
            if ($unit) {
                $query->where('unit_id', $unit->id);
            } else {
                $query->whereNull('unit_id'); // No matching unit, so no complaints
            }
        }
        // --- End Filtering Logic ---

        $complaints = $query->paginate(10)->withQueryString();

        $owners = Owner::select('id', 'name', 'phone')->get();
        $statuses = ['pending', 'in_progress', 'resolved', 'rejected']; // Define possible statuses

        return Inertia::render('Admin/Complaint/Index', [
            'complaints' => $complaints,
            'owners' => $owners,
            'statuses' => $statuses,
            'filters' => $request->only(['status', 'owner_id', 'unit_code']),
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Complaints', 'url' => route('admin_complaints_index')],
            ],
        ]);
    }

    /**
     * Show the form for editing the specified complaint.
     */
    public function edit(Complaint $complaint): Response
    {
        // Load relations for displaying details
        $complaint->load(['owner', 'unit']);

        $statuses = ['pending', 'in_progress', 'resolved', 'rejected']; // Possible statuses

        return Inertia::render('Admin/Complaint/Edit', [
            'complaint' => $complaint,
            'statuses' => $statuses,
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Complaints', 'url' => route('admin_complaints_index')],
                ['label' => 'Edit Complaint', 'url' => route('admin_complaints_edit', $complaint->id)],
            ],
        ]);
    }

    /**
     * Update the specified complaint in storage.
     */
    public function update(Request $request, Complaint $complaint): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'string', Rule::in(['pending', 'in_progress', 'resolved', 'rejected'])],
            'admin_notes' => 'nullable|string|max:1000',
            // Allow admin to correct description if needed, but keep original subject
            'description' => 'required|string',
        ]);

        $complaint->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
            'description' => $request->description, // Admin can update description
        ]);

        return redirect()->route('admin_complaints_index')->with('success', '✅ Complaint updated successfully!');
    }

    /**
     * Remove the specified complaint from storage.
     */
    public function destroy(Complaint $complaint): RedirectResponse
    {
        $complaint->delete();
        return redirect()->route('admin_complaints_index')->with('success', '🗑️ Complaint deleted successfully!');
    }

     /**
     * Convert a complaint into a work order.
     */
    public function convertToWorkOrder(Complaint $complaint): RedirectResponse
    {
        // Ensure complaint has a unit_id to create a valid work order
        if (!$complaint->unit_id) {
            return back()->with('error', '❌ Cannot convert to work order: Complaint is not linked to a specific unit.');
        }

        // Check if a work order already exists for this complaint
        if ($complaint->workOrder()->exists()) { // Assuming WorkOrder has a belongsTo Complaint relationship
            return back()->with('info', 'ℹ️ A work order already exists for this complaint.');
        }

        try {
            $workOrder = WorkOrder::create([
                'complaint_id' => $complaint->id,
                'owner_id' => $complaint->owner_id,
                'unit_id' => $complaint->unit_id,
                'subject' => 'WO: ' . $complaint->subject, // Prefix for clarity
                'description' => $complaint->description,
                'priority' => 'medium', // Default priority, admin can change later
                'status' => 'open',     // Default status
                // 'assigned_to' => Auth::user()->name ?? 'Admin', // Assign to current admin, or leave null
                'admin_notes' => 'Converted from complaint ID ' . $complaint->id . ' by Admin.',
            ]);

            // Optionally update the complaint status
            $complaint->status = 'in_progress'; // Or 'converted'
            $complaint->admin_notes = ($complaint->admin_notes ? $complaint->admin_notes . "\n" : '') . "Converted to Work Order: WO-" . $workOrder->id . ".";
            $complaint->save();


            return redirect()->route('admin_work_orders_edit', $workOrder->id)
                             ->with('success', '✅ Complaint converted to Work Order WO-' . $workOrder->id . ' successfully!');

        } catch (\Exception $e) {
            Log::error('Error converting complaint to work order: ' . $e->getMessage(), ['complaint_id' => $complaint->id, 'exception' => $e]);
            return back()->with('error', '❌ Failed to convert complaint to work order. An unexpected error occurred.');
        }
    }
}
