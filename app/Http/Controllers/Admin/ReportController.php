<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Owner;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\PaymentsExport;
use App\Exports\UnitsExport;
use App\Exports\OwnersExport;
use Illuminate\Support\Facades\Log;  // For logging potential errors
use Illuminate\Support\Facades\Auth; // For authorization

class ReportController extends Controller
{
    /**
     * Constructor for authorization middleware.
     */
    public function __construct()
    {
        $this->middleware('permission:viewReports')->only(['paymentsIndex', 'unitsIndex', 'ownersIndex']);
        $this->middleware('permission:exportReports')->only(['exportPayments', 'exportUnits', 'exportOwners']);
    }

    /**
     * Display the payments report page.
     */
    public function paymentsIndex(Request $request): Response
    {
        $query = Payment::with(['owner', 'unit'])
                        ->latest('payment_date'); // Order by payment date descending

        // --- Filtering Logic ---
        if ($request->filled('start_date')) {
            $query->whereDate('payment_date', '>=', $request->input('start_date'));
        }
        if ($request->filled('end_date')) {
            $query->whereDate('payment_date', '<=', $request->input('end_date'));
        }
        if ($request->filled('method') && $request->input('method') !== 'all') {
            $query->where('method', $request->input('method'));
        }
        if ($request->filled('owner_id') && $request->input('owner_id') !== 'all') {
            $query->where('owner_id', $request->input('owner_id'));
        }
        if ($request->filled('unit_code')) {
            // Find unit by code and then filter payments by unit_id
            $unit = \App\Models\Unit::where('unit_code', 'like', '%' . $request->input('unit_code') . '%')->first();
            if ($unit) {
                $query->where('unit_id', $unit->id);
            } else {
                // If unit_code doesn't match any unit, return no payments
                $query->whereNull('unit_id');
            }
        }
        // --- End Filtering Logic ---

        $payments = $query->paginate(10)->withQueryString(); // Paginate results

        // Get all owners for the filter dropdown
        $owners = Owner::select('id', 'name', 'phone')->get();

        // Get unique payment methods for the filter dropdown
        $paymentMethods = Payment::select('method')->distinct()->pluck('method');

        return Inertia::render('Admin/Report/Payments', [
            'payments' => $payments,
            'owners' => $owners,
            'paymentMethods' => $paymentMethods,
            'filters' => $request->only(['start_date', 'end_date', 'method', 'owner_id', 'unit_code']), // Pass current filters back
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Reports', 'url' => '#'], // Placeholder for main reports page
                ['label' => 'Payments Report', 'url' => route('admin_reports_payments_index')],
            ],
        ]);
    }

    /**
     * Export payments report to Excel/CSV.
     */
    public function exportPayments(Request $request)
    {
        // Authorization check
        $this->authorize('exportReports');

        $query = Payment::with(['owner', 'unit'])
                        ->latest('payment_date');

        // Replicate filtering logic from paymentsIndex
        if ($request->filled('start_date')) {
            $query->whereDate('payment_date', '>=', $request->input('start_date'));
        }
        if ($request->filled('end_date')) {
            $query->whereDate('payment_date', '<=', $request->input('end_date'));
        }
        if ($request->filled('method') && $request->input('method') !== 'all') {
            $query->where('method', $request->input('method'));
        }
        if ($request->filled('owner_id') && $request->input('owner_id') !== 'all') {
            $query->where('owner_id', $request->input('owner_id'));
        }
        if ($request->filled('unit_code')) {
            $unit = \App\Models\Unit::where('unit_code', 'like', '%' . $request->input('unit_code') . '%')->first();
            if ($unit) {
                $query->where('unit_id', $unit->id);
            } else {
                $query->whereNull('unit_id');
            }
        }

        try {
            $paymentsToExport = $query->get(); // Get all filtered payments (no pagination)
            return Excel::download(new PaymentsExport($paymentsToExport), 'payments-report-' . \Carbon\Carbon::now()->format('Y-m-d_H-i-s') . '.xlsx');
        } catch (\Exception $e) {
            Log::error('Error exporting payments report: ' . $e->getMessage(), ['user_id' => Auth::id(), 'filters' => $request->all(), 'exception' => $e]);
            return back()->with('error', '❌ Failed to generate export file. An unexpected error occurred.');
        }
    }

      /**
     * Display the units report page.
     */
    public function unitsIndex(Request $request): Response
    {
        $this->authorize('viewReports'); // Explicit authorization check

        $query = Unit::with('owner')->latest('created_at');

        // --- Filtering Logic ---
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('unit_code', 'like', "%{$search}%")
                  ->orWhereHas('owner', function ($oq) use ($search) {
                      $oq->where('name', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }
        if ($request->filled('owner_id') && $request->input('owner_id') !== 'all') {
            $query->where('owner_id', $request->input('owner_id'));
        }
        if ($request->filled('balance_status') && $request->input('balance_status') !== 'all') {
            if ($request->input('balance_status') === 'has_balance') {
                $query->where('balance', '>', 0);
            } elseif ($request->input('balance_status') === 'paid_in_full') {
                $query->where('balance', '<=', 0); // Include negative balances as paid in full/overpaid
            }
        }
        // --- End Filtering Logic ---

        $units = $query->paginate(10)->withQueryString();
        $owners = Owner::select('id', 'name', 'phone')->get();

        // Calculate total charges, received, balance for filtered units
        $totalChargesSum = $query->sum('total');
        $totalReceivedSum = $query->sum('received');
        $totalBalanceSum = $query->sum('balance');

        return Inertia::render('Admin/Report/Units', [
            'units' => $units,
            'owners' => $owners,
            'totalChargesSum' => $totalChargesSum,
            'totalReceivedSum' => $totalReceivedSum,
            'totalBalanceSum' => $totalBalanceSum,
            'filters' => $request->only(['search', 'owner_id', 'balance_status']),
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Reports', 'url' => '#'],
                ['label' => 'Units Report', 'url' => route('admin_reports_units_index')],
            ],
        ]);
    }

    /**
     * Export units report to Excel/CSV.
     */
    public function exportUnits(Request $request)
    {
        $this->authorize('exportReports'); // Explicit authorization check

        $query = Unit::with('owner')->latest('created_at');

        // Replicate filtering logic from unitsIndex
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('unit_code', 'like', "%{$search}%")
                  ->orWhereHas('owner', function ($oq) use ($search) {
                      $oq->where('name', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }
        if ($request->filled('owner_id') && $request->input('owner_id') !== 'all') {
            $query->where('owner_id', $request->input('owner_id'));
        }
        if ($request->filled('balance_status') && $request->input('balance_status') !== 'all') {
            if ($request->input('balance_status') === 'has_balance') {
                $query->where('balance', '>', 0);
            } elseif ($request->input('balance_status') === 'paid_in_full') {
                $query->where('balance', '<=', 0);
            }
        }

        try {
            $unitsToExport = $query->get();
            return Excel::download(new UnitsExport($unitsToExport), 'units-report-' . \Carbon\Carbon::now()->format('Y-m-d_H-i-s') . '.xlsx');
        } catch (\Exception $e) {
            Log::error('Error exporting units report: ' . $e->getMessage(), ['user_id' => Auth::id(), 'filters' => $request->all(), 'exception' => $e]);
            return back()->with('error', '❌ Failed to generate export file. An unexpected error occurred.');
        }
    }


    /**
     * Display the owners report page.
     */
    public function ownersIndex(Request $request): Response
    {
        $this->authorize('viewReports'); // Explicit authorization check

        $query = Owner::withCount('units')->withSum('units as total_balance', 'balance')->latest('created_at');

        // --- Filtering Logic ---
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('owner_id_no', 'like', "%{$search}%");
            });
        }
        if ($request->filled('has_units') && $request->input('has_units') !== 'all') {
            if ($request->input('has_units') === 'yes') {
                $query->has('units');
            } elseif ($request->input('has_units') === 'no') {
                $query->doesntHave('units');
            }
        }
        if ($request->filled('balance_status') && $request->input('balance_status') !== 'all') {
            if ($request->input('balance_status') === 'has_balance') {
                // Filter owners who have at least one unit with a positive balance
                $query->whereHas('units', function ($uq) {
                    $uq->where('balance', '>', 0);
                });
            } elseif ($request->input('balance_status') === 'no_balance') {
                // Filter owners where all their units have zero or negative balance
                // This is a bit complex: find owners who *don't* have units with >0 balance
                $query->whereDoesntHave('units', function ($uq) {
                    $uq->where('balance', '>', 0);
                });
            }
        }
        // --- End Filtering Logic ---

        $owners = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Report/Owners', [
            'owners' => $owners,
            'filters' => $request->only(['search', 'has_units', 'balance_status']),
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Reports', 'url' => '#'],
                ['label' => 'Owners Report', 'url' => route('admin_reports_owners_index')],
            ],
        ]);
    }

    /**
     * Export owners report to Excel/CSV.
     */
    public function exportOwners(Request $request)
    {
        $this->authorize('exportReports'); // Explicit authorization check

        $query = Owner::withCount('units')->withSum('units as total_balance', 'balance')->latest('created_at');

        // Replicate filtering logic from ownersIndex
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('owner_id_no', 'like', "%{$search}%");
            });
        }
        if ($request->filled('has_units') && $request->input('has_units') !== 'all') {
            if ($request->input('has_units') === 'yes') {
                $query->has('units');
            } elseif ($request->input('has_units') === 'no') {
                $query->doesntHave('units');
            }
        }
        if ($request->filled('balance_status') && $request->input('balance_status') !== 'all') {
            if ($request->input('balance_status') === 'has_balance') {
                $query->whereHas('units', function ($uq) {
                    $uq->where('balance', '>', 0);
                });
            } elseif ($request->input('balance_status') === 'no_balance') {
                $query->whereDoesntHave('units', function ($uq) {
                    $uq->where('balance', '>', 0);
                });
            }
        }

        try {
            $ownersToExport = $query->get();
            return Excel::download(new OwnersExport($ownersToExport), 'owners-report-' . \Carbon\Carbon::now()->format('Y-m-d_H-i-s') . '.xlsx');
        } catch (\Exception $e) {
            Log::error('Error exporting owners report: ' . $e->getMessage(), ['user_id' => Auth::id(), 'filters' => $request->all(), 'exception' => $e]);
            return back()->with('error', '❌ Failed to generate export file. An unexpected error occurred.');
        }
    }
}
