<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Imports\AdjustedRentImport;
use App\Models\Unit;
use App\Models\Owner;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Http\RedirectResponse;
use App\Imports\RentAdjustmentImport;
use App\Imports\RentReceivableImport;
use Maatwebsite\Excel\Facades\Excel;

class UnitController extends Controller
{
    public function index()
    {
        $units = Unit::with('owner')->orderBy('created_at', 'desc')->paginate(10);

        $stats = [
            'total' => Unit::count(),
            'today' => Unit::whereDate('created_at', Carbon::today())->count(),
            'thisMonth' => Unit::whereMonth('created_at', Carbon::now()->month)->count(),
        ];

        return Inertia::render('Admin/Unit/Index', [
            'units' => $units,
            'stats' => $stats,
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Units', 'url' => route('admin_units_index')],
            ],
        ]);
    }

    public function create()
    {
        $owners = Owner::select('owner_id_no', 'name', 'phone')->get();

        return Inertia::render('Admin/Unit/Create', [
            'owners' => $owners,
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Units', 'url' => route('admin_units_index')],
                ['label' => 'Create', 'url' => route('admin_unit_create')],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_code'    => 'required|string|max:255',
            'owner_id_no'  => 'required|exists:owners,owner_id_no',
            'y2020'        => 'nullable|numeric',
            'y2021'        => 'nullable|numeric',
            'y2022'        => 'nullable|numeric',
            'y2023'        => 'nullable|numeric',
            'y2024'        => 'nullable|numeric',
            'y2025'        => 'nullable|numeric',
            'y2026'        => 'nullable|numeric',
            'received'     => 'nullable|numeric',
        ]);

        // Calculate totals
        $years = collect($validated)->only(['y2020','y2021','y2022','y2023','y2024','y2025','y2026'])->map(fn($v) => $v ?? 0);
        $validated['total'] = $years->sum();
        $validated['balance'] = $validated['total'] - ($validated['received'] ?? 0);

        Unit::create($validated);

        return redirect()->route('admin_units_index')->with('success', '✅ Unit created successfully!');
    }

    public function edit(Unit $unit)
    {
        $owners = Owner::select('owner_id_no', 'name', 'phone')->get();

        return Inertia::render('Admin/Unit/Edit', [
            'unit' => $unit->load('owner'),
            'owners' => $owners,
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Units', 'url' => route('admin_units_index')],
                ['label' => 'Edit', 'url' => route('admin_unit_edit', $unit->id)],
            ],
        ]);
    }

    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'unit_code'    => 'required|string|max:255',
            'owner_id_no'  => 'required|exists:owners,owner_id_no',
            'y2020'        => 'nullable|numeric',
            'y2021'        => 'nullable|numeric',
            'y2022'        => 'nullable|numeric',
            'y2023'        => 'nullable|numeric',
            'y2024'        => 'nullable|numeric',
            'y2025'        => 'nullable|numeric',
            'y2026'        => 'nullable|numeric',
            'received'     => 'nullable|numeric',
        ]);

        // Recalculate totals
        $years = collect($validated)->only(['y2020','y2021','y2022','y2023','y2024','y2025','y2026'])->map(fn($v) => $v ?? 0);
        $validated['total'] = $years->sum();
        $validated['balance'] = $validated['total'] - ($validated['received'] ?? 0);

        $unit->update($validated);

        return redirect()->route('admin_units_index')->with('success', '✅ Unit updated successfully!');
    }

    public function destroy(Unit $unit)
    {
        $unit->delete();

        return redirect()->route('admin_units_index')->with('success', '🗑️ Unit deleted successfully!');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xls,xlsx|max:2048',
        ]);

        try {
            $spreadsheet = IOFactory::load($request->file('file')->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            foreach (array_slice($rows, 1) as $row) {
                if (!isset($row[0]) || empty($row[0])) continue;

                $unit_code   = $row[0];
                $owner_id_no = $row[1]; // must match existing owner_id_no

                $data = [
                    'unit_code'   => $unit_code,
                    'owner_id_no' => $owner_id_no,
                    'y2020'       => $row[2] ?? 0,
                    'y2021'       => $row[3] ?? 0,
                    'y2022'       => $row[4] ?? 0,
                    'y2023'       => $row[5] ?? 0,
                    'y2024'       => $row[6] ?? 0,
                    'y2025'       => $row[7] ?? 0,
                    'y2026'       => $row[8] ?? 0,
                    'received'    => $row[9] ?? 0,
                ];

                $years = collect($data)->only(['y2020','y2021','y2022','y2023','y2024','y2025','y2026'])->map(fn($v) => $v ?? 0);
                $data['total'] = $years->sum();
                $data['balance'] = $data['total'] - ($data['received'] ?? 0);

                Unit::updateOrCreate(['unit_code' => $unit_code], $data);
            }

            return redirect()->route('admin_units_index')->with('success', '✅ Units imported successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', '❌ Error importing file: '.$e->getMessage());
        }
    }

    public function importRentAdjustments(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xls,xlsx',
        ]);

        try {
            Excel::import(new AdjustedRentImport, $request->file('file'));

            return redirect()->back()->with('success', 'Rent adjustments imported successfully.');
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Import failed: ' . $e->getMessage());
        }
    }
     /**
     * Import Rent + Receivable data from a specific Excel file.
     */
    public function importRentReceivable(Request $request): RedirectResponse
    {
        $this->authorize('import-units');

        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:20480',
        ]);

        try {
            $import = new RentReceivableImport();
            Excel::import($import, $request->file('file'));

            // --- NEW: Updated success message to reflect tenant counts ---
            $message = "Rent & Receivable Import completed: Units Inserted: {$import->unitsInserted}, Units Updated: {$import->unitsUpdated}, Tenants Inserted: {$import->tenantsInserted}, Tenants Updated: {$import->tenantsUpdated}, Owners Matched for Units: {$import->ownersMatchedForUnits}, Owners Not Found for Units: {$import->ownersNotFoundForUnits}, Skipped Rows: {$import->skippedRows}";
            // --- END NEW ---

            if (!empty($import->errors)) {
                $errorMessage = " Some rows had errors. Check logs for details.";
                Log::error('RentReceivable Import Errors:', ['errors' => $import->errors]);
                return redirect()->route('admin_units_index')->with('error', $message . $errorMessage);
            }

            return redirect()->route('admin_units_index')->with('success', $message);

        } catch (\Exception $e) {
            Log::error('RentReceivable Import Failed: ' . $e->getMessage(), ['exception' => $e]);
            return back()->with('error', '❌ Rent & Receivable import failed: ' . $e->getMessage());
        }
    }
}
