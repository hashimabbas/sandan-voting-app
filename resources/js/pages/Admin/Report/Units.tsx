import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/pagination';
import { type BreadcrumbItem, type Unit, type OwnerShort, type UnitsReportProps } from '@/types';
import { route } from 'ziggy-js';
import { Filter, XCircle, Download } from 'lucide-react';

export default function UnitsReport() {
    const { units, owners, totalChargesSum, totalReceivedSum, totalBalanceSum, filters, breadcrumbs, flash, can } = usePage<UnitsReportProps>().props;

    // Local state for filter form inputs
    const [filterData, setFilterData] = useState({
        search: filters.search || '',
        owner_id: filters.owner_id || 'all',
        balance_status: filters.balance_status || 'all',
    });

    const handleChange = (name: string, value: string) => {
        setFilterData(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        router.get(route('admin_reports_units_index'), filterData, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setFilterData({
            search: '',
            owner_id: 'all',
            balance_status: 'all',
        });
        router.get(route('admin_reports_units_index'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleExport = () => {
        const queryParams = new URLSearchParams(filterData as Record<string, string>).toString();
        window.location.href = route('admin_reports_units_export') + (queryParams ? `?${queryParams}` : '');
    };

    const formatNum = (v: unknown, digits = 3) => {
        const n = Number(v ?? 0);
        return Number.isNaN(n) ? (0).toFixed(digits) : n.toFixed(digits);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Units Report" />

            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                <h2 className="text-3xl font-bold text-gray-800">🏠 Units Report</h2>
                <p className="text-gray-600">Overview and detailed list of all property units.</p>

                {flash.success && (<div className="rounded-md bg-green-100 border border-green-300 p-3 text-green-700 shadow-sm"> ✅ {flash.success} </div>)}
                {flash.error && (<div className="rounded-md bg-red-100 border border-red-300 p-3 text-red-700 shadow-sm"> ❌ {flash.error} </div>)}
                {flash.info && (<div className="rounded-md bg-blue-100 border border-blue-300 p-3 text-blue-700 shadow-sm"> ℹ️ {flash.info} </div>)}

                {/* Filter Section */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <Filter className="h-5 w-5" /> Filter Units
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <Label htmlFor="search">Search Unit/Owner</Label>
                            <Input
                                id="search"
                                type="text"
                                value={filterData.search}
                                onChange={(e) => handleChange('search', e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                placeholder="Unit code, owner name/phone..."
                            />
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

                        {/* Balance Status */}
                        <div>
                            <Label htmlFor="balance_status">Balance Status</Label>
                            <Select
                                onValueChange={(value) => handleChange('balance_status', value)}
                                value={filterData.balance_status}
                            >
                                <SelectTrigger id="balance_status">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="has_balance">Has Outstanding Balance</SelectItem>
                                    <SelectItem value="paid_in_full">Paid in Full / Overpaid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={resetFilters} className="flex items-center gap-1">
                            <XCircle className="h-4 w-4" /> Reset Filters
                        </Button>
                        <Button type="button" onClick={applyFilters} className="flex items-center gap-1">
                            <Filter className="h-4 w-4" /> Apply Filters
                        </Button>
                        {can.exportReports && (
                            <Button type="button" onClick={handleExport} className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
                                <Download className="h-4 w-4" /> Export to Excel
                            </Button>
                        )}
                    </div>
                </div>

                {/* Total Sums Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex justify-between items-center text-lg font-semibold text-gray-800">
                        <span>Total Claims:</span>
                        <span>{formatNum(totalChargesSum)} OMR</span>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex justify-between items-center text-lg font-semibold text-gray-800">
                        <span>Total Received:</span>
                        <span>{formatNum(totalReceivedSum)} OMR</span>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex justify-between items-center text-lg font-semibold text-gray-800">
                        <span>Total Balance:</span>
                        <span>{formatNum(totalBalanceSum)} OMR</span>
                    </div>
                </div>


                {/* Units Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Filtered Units</h3>
                    {units.data.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border">
                            <Table>
                                <TableHeader className="bg-gray-100">
                                    <TableRow>
                                        <TableHead className="font-semibold text-gray-700">Unit Code</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Owner</TableHead>
                                        <TableHead>2020</TableHead>
                                        <TableHead>2021</TableHead>
                                        <TableHead>2022</TableHead>
                                        <TableHead>2023</TableHead>
                                        <TableHead>2024</TableHead>
                                        <TableHead>2025</TableHead>
                                        <TableHead>2026</TableHead>
                                        <TableHead className="font-semibold text-right">Total Claims</TableHead>
                                        <TableHead className="font-semibold text-right">Received</TableHead>
                                        <TableHead className="font-semibold text-right">Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {units.data.map((unit) => (
                                        <TableRow key={unit.id} className="hover:bg-gray-50 transition">
                                            <TableCell className="font-medium text-gray-800">{unit.unit_code}</TableCell>
                                            <TableCell>{unit.owner?.name} ({unit.owner?.phone})</TableCell>
                                            <TableCell>{formatNum(unit.y2020)}</TableCell>
                                            <TableCell>{formatNum(unit.y2021)}</TableCell>
                                            <TableCell>{formatNum(unit.y2022)}</TableCell>
                                            <TableCell>{formatNum(unit.y2023)}</TableCell>
                                            <TableCell>{formatNum(unit.y2024)}</TableCell>
                                            <TableCell>{formatNum(unit.y2025)}</TableCell>
                                            <TableCell>{formatNum(unit.y2026)}</TableCell>
                                            <TableCell className="font-semibold text-right">{formatNum(unit.total)}</TableCell>
                                            <TableCell className="text-green-600 font-semibold text-right">{formatNum(unit.received)}</TableCell>
                                            <TableCell className={`font-semibold text-right ${Number(unit.balance ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {formatNum(unit.balance)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No units found matching the criteria.</p>
                    )}

                    {units.last_page > 1 && (
                        <div className="flex justify-center pt-4">
                            <Pagination links={units.links} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
