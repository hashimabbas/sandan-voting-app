import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/pagination';
import { type BreadcrumbItem, type Owner, type OwnersReportProps } from '@/types';
import { route } from 'ziggy-js';
import { Filter, XCircle, Download } from 'lucide-react';

export default function OwnersReport() {
    const { owners, filters, breadcrumbs, flash, can } = usePage<OwnersReportProps>().props;

    // Local state for filter form inputs
    const [filterData, setFilterData] = useState({
        search: filters.search || '',
        has_units: filters.has_units || 'all',
        balance_status: filters.balance_status || 'all',
    });

    const handleChange = (name: string, value: string) => {
        setFilterData(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        router.get(route('admin_reports_owners_index'), filterData, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setFilterData({
            search: '',
            has_units: 'all',
            balance_status: 'all',
        });
        router.get(route('admin_reports_owners_index'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleExport = () => {
        const queryParams = new URLSearchParams(filterData as Record<string, string>).toString();
        window.location.href = route('admin_reports_owners_export') + (queryParams ? `?${queryParams}` : '');
    };

    const formatNum = (v: unknown, digits = 3) => {
        const n = Number(v ?? 0);
        return Number.isNaN(n) ? (0).toFixed(digits) : n.toFixed(digits);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Owners Report" />

            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                <h2 className="text-3xl font-bold text-gray-800">👥 Owners Report</h2>
                <p className="text-gray-600">Overview and detailed list of all property owners.</p>

                {flash.success && (<div className="rounded-md bg-green-100 border border-green-300 p-3 text-green-700 shadow-sm"> ✅ {flash.success} </div>)}
                {flash.error && (<div className="rounded-md bg-red-100 border border-red-300 p-3 text-red-700 shadow-sm"> ❌ {flash.error} </div>)}
                {flash.info && (<div className="rounded-md bg-blue-100 border border-blue-300 p-3 text-blue-700 shadow-sm"> ℹ️ {flash.info} </div>)}

                {/* Filter Section */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <Filter className="h-5 w-5" /> Filter Owners
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <Label htmlFor="search">Search Name/Phone/ID</Label>
                            <Input
                                id="search"
                                type="text"
                                value={filterData.search}
                                onChange={(e) => handleChange('search', e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                placeholder="Owner name, phone, ID no..."
                            />
                        </div>

                        {/* Has Units */}
                        <div>
                            <Label htmlFor="has_units">Has Units?</Label>
                            <Select
                                onValueChange={(value) => handleChange('has_units', value)}
                                value={filterData.has_units}
                            >
                                <SelectTrigger id="has_units">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
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
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="has_balance">Has Outstanding Balance</SelectItem>
                                    <SelectItem value="no_balance">No Outstanding Balance</SelectItem>
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

                {/* Owners Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">Filtered Owners</h3>
                    {owners.data.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border">
                            <Table>
                                <TableHeader className="bg-gray-100">
                                    <TableRow>
                                        <TableHead className="font-semibold text-gray-700">Name</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Phone</TableHead>
                                        <TableHead className="font-semibold text-gray-700">ID No.</TableHead>
                                        <TableHead className="font-semibold text-right">Units Owned</TableHead>
                                        <TableHead className="font-semibold text-right">Total Balance</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Registered On</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {owners.data.map((owner) => (
                                        <TableRow key={owner.id} className="hover:bg-gray-50 transition">
                                            <TableCell className="font-medium text-gray-800">{owner.name}</TableCell>
                                            <TableCell>{owner.phone}</TableCell>
                                            <TableCell>{owner.owner_id_no || 'N/A'}</TableCell>
                                            <TableCell className="text-right">{owner.units_count}</TableCell>
                                            <TableCell className={`font-semibold text-right ${Number(owner.total_balance ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {formatNum(owner.total_balance)}
                                            </TableCell>
                                            <TableCell>{new Date(owner.created_at || '').toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No owners found matching the criteria.</p>
                    )}

                    {owners.last_page > 1 && (
                        <div className="flex justify-center pt-4">
                            <Pagination links={owners.links} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
