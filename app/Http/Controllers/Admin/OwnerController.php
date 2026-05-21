<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Owner;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash; // Import Hash for password if an owner has one
use App\Imports\OwnerImport;
use Maatwebsite\Excel\Facades\Excel;

class OwnerController extends Controller
{
    /**
     * Display a listing of the owners.
     */
    public function index(Request $request)
    {
        $query = Owner::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $owners = $query->orderByDesc('created_at')->paginate(10)->withQueryString();

        return inertia('Admin/Owner/Index', [
            'owners' => $owners,
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('dashboard')],
                ['label' => 'Owners', 'url' => route('admin_owners_index')],
            ],
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new owner.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Owner/Create', [
            'breadcrumbs' => [
                ['title' => 'Admin', 'href' => route('admin_dashboard')],
                ['title' => 'Owners', 'href' => route('admin_owners_index')],
                ['title' => 'Create', 'href' => route('admin_owner_create')],
            ],
        ]);
    }

    /**
     * Store a newly created owner in storage.
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:owners,phone|min:8|max:15', // Adjust min/max for phone numbers
            'owner_id_no' => 'nullable|string|unique:owners|max:255',

        ]);

        Owner::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'owner_id_no' => $request->owner_id_no,
            // 'password' => Hash::make($request->password), // Uncomment if owners will have passwords
        ]);

        return redirect()->route('admin_owners_index')->with('success', 'Owner created successfully.');
    }

    /**
     * Show the form for editing the specified owner.
     */
    public function edit(Owner $owner): Response
    {
        return Inertia::render('Admin/Owner/Edit', [
            'owner' => $owner,
            'breadcrumbs' => [
                ['title' => 'Admin', 'href' => route('admin_dashboard')],
                ['title' => 'Owners', 'href' => route('admin_owners_index')],
                ['title' => 'Edit', 'href' => route('admin_owner_edit', $owner)],
            ],
        ]);
    }

    /**
     * Update the specified owner in storage.
     * @throws \Illuminate\Validation\ValidationException
     */
    public function update(Request $request, Owner $owner): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => ['required', 'string', 'min:9', 'max:15', Rule::unique('owners', 'phone')->ignore($owner->id)],
            'owner_id_no' => 'nullable|string|max:255',
        ]);

        $owner->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'owner_id_no' => $request->owner_id_no,
        ]);

        return redirect()->route('admin_owners_index')->with('success', 'Owner updated successfully.');
    }

    /**
     * Remove the specified owner from storage.
     */
    public function destroy(Owner $owner): RedirectResponse
    {
        $owner->delete();
        return redirect()->route('admin_owners_index')->with('success', 'Owner deleted successfully.');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:2048',
        ]);

        try {
            $import = new OwnerImport();
            Excel::import($import, $request->file('file'));

            $message = "Import completed. Inserted: {$import->inserted}, Skipped: {$import->skipped}";

            if (!empty($import->skippedPhones)) {
                $message .= ". Skipped phones: " . implode(', ', $import->skippedPhones);
            }

            return back()->with('success', $message);
        } catch (\Exception $e) {
            return back()->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

}
