import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Button } from "@/components/ui/button";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin/dashboard' },
];

export default function Dashboard() {
    const { stats = {}, recentPayments = [], trend = [] } = usePage<{
        stats: any;
        recentPayments: any[];
        trend: { month: string; charges: number; received: number }[];
    }>().props;

    const [chartType, setChartType] = useState<'line' | 'bar'>('line');

    const formatNum = (v: unknown, digits = 3) => {
        const n = Number(v ?? 0);
        return Number.isNaN(n) ? (0).toFixed(digits) : n.toFixed(digits);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 bg-white text-slate-900">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard label="Total Owners" value={stats.owners_count ?? 0} />
                    <StatCard label="Total Units" value={stats.units_count ?? 0} />
                    <StatCard label="Total Charges" value={formatNum(stats.total_charges)} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard label="Total Received" value={formatNum(stats.total_received)} />
                    <StatCard label="Outstanding Balance" value={formatNum(stats.total_balance)} />
                </div>

                {/* Monthly Trends Chart with Toggle */}
                <div className="rounded-xl border p-4 shadow-sm border-slate-200">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Monthly Trends</h2>
                        <div className="flex gap-2">
                            <Button
                                variant={chartType === 'line' ? 'default' : 'outline'}
                                onClick={() => setChartType('line')}
                            >
                                Line
                            </Button>
                            <Button
                                variant={chartType === 'bar' ? 'default' : 'outline'}
                                onClick={() => setChartType('bar')}
                            >
                                Bar
                            </Button>
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'line' ? (
                                <LineChart data={trend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="charges" stroke="#6366f1" strokeWidth={2} />
                                    <Line type="monotone" dataKey="received" stroke="#10b981" strokeWidth={2} />
                                </LineChart>
                            ) : (
                                <BarChart data={trend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
                                    <Legend />
                                    <Bar dataKey="charges" fill="#6366f1" />
                                    <Bar dataKey="received" fill="#10b981" />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Payments */}
                <div className="rounded-xl border p-4 shadow-sm border-slate-200">
                    <h2 className="mb-4 text-lg font-semibold">Recent Payments</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-500">
                                    <th className="p-2">Date</th>
                                    <th className="p-2">Owner</th>
                                    <th className="p-2">Unit</th>
                                    <th className="p-2">Method</th>
                                    <th className="p-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPayments.length > 0 ? (
                                    recentPayments.map((p) => (
                                        <tr key={p.id} className="border-t border-slate-100">
                                            <td className="p-2">{p.date}</td>
                                            <td className="p-2">{p.owner}</td>
                                            <td className="p-2">{p.unit}</td>
                                            <td className="p-2">{p.method}</td>
                                            <td className="p-2 text-right font-medium">{formatNum(p.amount)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-slate-500">
                                            No recent payments.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-xl border p-4 shadow-sm border-slate-200 bg-white">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-semibold text-slate-900">{value}</p>
        </div>
    );
}
