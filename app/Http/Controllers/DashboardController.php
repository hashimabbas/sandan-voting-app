<?php

namespace App\Http\Controllers;

use App\Models\Owner;
use App\Models\Unit;
use App\Models\Payment;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'owners_count'   => Owner::count(),
            'units_count'    => Unit::count(),
            'total_charges'  => (float) Unit::sum('total') ?? 0.000,
            'total_received' => (float) Unit::sum('received') ?? 0.000,
            'total_balance'  => (float) Unit::sum('balance') ?? 0.000,
        ];

        $recentPayments = Payment::with(['owner', 'unit'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id'     => $payment->id,
                    'amount' => (float) $payment->amount,
                    'method' => $payment->method,
                    'date'   => $payment->payment_date?->format('Y-m-d') ?? 'N/A',
                    'owner'  => $payment->owner->name ?? 'N/A',
                    'unit'   => $payment->unit->unit_code ?? 'N/A',
                ];
            });

        // Monthly trend: charges vs received
        $charges = Unit::select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(total) as charges')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $received = Payment::select(
                DB::raw('DATE_FORMAT(payment_date, "%Y-%m") as month'),
                DB::raw('SUM(amount) as received')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $months = $charges->keys()->merge($received->keys())->unique()->sort();

        $trend = $months->map(function ($month) use ($charges, $received) {
            return [
                'month'    => $month,
                'charges'  => (float) optional($charges->get($month))->charges ?? 0,
                'received' => (float) optional($received->get($month))->received ?? 0,
            ];
        })->values();

        return Inertia::render('Admin/Dashboard', [
            'stats'          => $stats,
            'recentPayments' => $recentPayments,
            'trend'          => $trend,
        ]);
    }
}
