import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/pagination';
import { type BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Filter, XCircle, Edit, Download } from 'lucide-react'; // Icons for filter/reset

// Interfaces for data received from backend
interface Payment {
    id: number;
    payment_date: string;
    amount: number | string;
    method: string;
    reference: string | null;
    owner: { name: string; phone: string; owner_id_no: string; } | null;
    unit: { unit_code: string; } | null;
}

interface OwnerFilter {
    id: number;
    name: string;
    phone: string;
}

interface PaymentsReportProps {
    payments: {
        data: Payment[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    totalPaymentsSum: number | string; // <--- NEW: Total sum from backend
    owners: OwnerFilter[];
    paymentMethods: string[];
    filters: {
        start_date?: string;
        end_date?: string;
        method?: string;
        owner_id?: string;
        unit_code?: string;
    };
    breadcrumbs: BreadcrumbItem[];
    flash: {
        success?: string;
        error?: string;
    };
    can: { // Permissions for current user
        viewReports: boolean;
        exportReports: boolean; // <--- NEW: Permission to export reports
    };
}

export default function PaymentsReport() {
    const { payments, totalPaymentsSum, owners, paymentMethods, filters, breadcrumbs, flash, can } = usePage<PaymentsReportProps>().props;

    // Local state for filter form inputs
    const [filterData, setFilterData] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        method: filters.method || 'all', // Default to 'all' for method
        owner_id: filters.owner_id || 'all', // Default to 'all' for owner
        unit_code: filters.unit_code || '',
    });

    // Handle filter input changes
    const handleChange = (name: string, value: string) => {
        setFilterData(prev => ({ ...prev, [name]: value }));
    };

    // Apply filters
    const applyFilters = () => {
        router.get(('/admin/reports/payments'), filterData, {
            preserveState: true,
            preserveScroll: true,
            replace: true, // Replace history state instead of pushing
        });
    };

    // Reset filters
    const resetFilters = () => {
        setFilterData({
            start_date: '',
            end_date: '',
            method: 'all',
            owner_id: 'all',
            unit_code: '',
        });
        // Redirect without filters to reset
        router.get(('/admin/reports/payments'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Handle export (GET request to download file)
    const handleExport = () => {
        const queryParams = new URLSearchParams(filterData as Record<string, string>).toString();
        window.location.href = route('admin_reports_payments_export') + (queryParams ? `?${queryParams}` : '');
    };
    // Helper for formatting numbers
    const formatNum = (v: unknown, digits = 3) => {
        const n = Number(v ?? 0);
        return Number.isNaN(n) ? (0).toFixed(digits) : n.toFixed(digits);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments Report" />

            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                <h2 className="text-3xl font-bold text-gray-800">📊 Payments Report</h2>
                <p className="text-gray-600">View and filter payment transactions.</p>

                {/* Flash Messages */}
                {flash.success && (
                    <div className="rounded-md bg-green-100 border border-green-300 p-3 text-green-700 shadow-sm">
                        ✅ {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="rounded-md bg-red-100 border border-red-300 p-3 text-red-700 shadow-sm">
                        ❌ {flash.error}
                    </div>
                )}

                {/* Filter Section */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <Filter className="h-5 w-5" /> Filter Payments
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Date Range */}
                        <div>
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={filterData.start_date}
                                onChange={(e) => handleChange('start_date', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={filterData.end_date}
                                onChange={(e) => handleChange('end_date', e.target.value)}
                            />
                        </div>

                        {/* Payment Method */}
                        <div>
                            <Label htmlFor="method">Method</Label>
                            <Select
                                onValueChange={(value) => handleChange('method', value)}
                                value={filterData.method}
                            >
                                <SelectTrigger id="method">
                                    <SelectValue placeholder="All Methods" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Methods</SelectItem>
                                    {paymentMethods.map(method => (
                                        <SelectItem key={method} value={method}>{method}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Owner */}
                        <div>
                            <Label htmlFor="owner_id">Owner</Label>
                            <Select
                                onValueChange={(value) => handleChange('owner_id', value)}
                                value={filterData.owner_id}
                            >
                                <SelectTrigger id="owner_id">
                                    <SelectValue placeholder="All Owners" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Owners</SelectItem>
                                    {owners.map(owner => (
                                        <SelectItem key={owner.id} value={owner.id.toString()}>
                                            {owner.name} ({owner.phone})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Unit Code */}
                        <div>
                            <Label htmlFor="unit_code">Unit Code</Label>
                            <Input
                                id="unit_code"
                                type="text"
                                value={filterData.unit_code}
                                onChange={(e) => handleChange('unit_code', e.target.value)}
                                placeholder="e.g., 01/G0001"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={resetFilters} className="flex items-center gap-1">
                            <XCircle className="h-4 w-4" /> Reset Filters
                        </Button>
                        <Button type="button" onClick={applyFilters} className="flex items-center gap-1">
                            <Filter className="h-4 w-4" /> Apply Filters
                        </Button>
                        {can.exportReports && ( // <--- Conditional rendering for export button
                            <Button type="button" onClick={handleExport} className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
                                <Download className="h-4 w-4" /> Export to Excel
                            </Button>
                        )}
                    </div>
                </div>


                {/* Total Sums Display */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex justify-between items-center text-lg font-semibold text-gray-800">
                    <span>Total Payments for Current Filters:</span>
                    <span>{formatNum(totalPaymentsSum)} OMR</span>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">All Payments</h3>
                    {payments.data.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border">
                            <Table>
                                <TableHeader className="bg-gray-100">
                                    <TableRow>
                                        <TableHead className="font-semibold text-gray-700">Date</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Owner</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Unit</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Method</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Reference</TableHead>
                                        <TableHead className="font-semibold text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.data.map((payment) => (
                                        <TableRow key={payment.id} className="hover:bg-gray-50 transition">
                                            <TableCell>{payment.payment_date}</TableCell>
                                            <TableCell>{payment.owner?.name} ({payment.owner?.phone})</TableCell>
                                            <TableCell>{payment.unit?.unit_code}</TableCell>
                                            <TableCell>{payment.method}</TableCell>
                                            <TableCell>{payment.reference || 'N/A'}</TableCell>
                                            <TableCell className="text-right font-medium">{formatNum(payment.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No payments found matching the criteria.</p>
                    )}

                    {payments.last_page > 1 && (
                        <div className="flex justify-center pt-4">
                            <Pagination links={payments.links} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
