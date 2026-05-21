import React, { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/pagination";
import type { BreadcrumbItem } from "@/types";
import type { PageProps } from "@/types/inertia";

interface Owner {
    id: number;
    name: string;
    phone: string;
    owner_id_no: string | null;
    created_at: string;
}

interface OwnerIndexProps {
    owners: {
        data: Owner[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    breadcrumbs: BreadcrumbItem[];
    stats?: {
        total: number;
        today: number;
        thisMonth: number;
    };
}

export default function OwnerIndex({ owners, breadcrumbs, stats }: OwnerIndexProps) {
    const { flash } = usePage<PageProps>().props;
    const [search, setSearch] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return alert("Please choose a file first!");

        const formData = new FormData();
        formData.append("file", file);

        router.post(("/admin/owner/import"), formData, {
            forceFormData: true,
            onSuccess: () => {
                setFile(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Owners" />

            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                {/* Page Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h2 className="text-3xl font-bold text-gray-800">👤 Owners Dashboard</h2>

                    <div className="flex gap-2 items-center">
                        {/* Search Input */}
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="🔍 Search by name or phone..."
                            className="w-64 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary transition"
                        />

                        {search && (
                            <Button type="button" variant="outline" size="sm" className="rounded-lg">
                                Reset
                            </Button>
                        )}

                        {/* Import Form */}
                        <form onSubmit={handleImport} className="flex items-center gap-2">
                            <input
                                type="file"
                                accept=".xls,.xlsx,.csv"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="text-sm border rounded-lg px-2 py-1"
                            />
                            <Button type="submit" size="sm" variant="outline">
                                📥 Import
                            </Button>
                        </form>

                        {/* Add New Owner */}
                        <Button asChild className="rounded-lg shadow-md bg-primary text-white">
                            <Link href="/admin/owner/create" className="flex items-center gap-2">
                                <PlusCircle className="h-5 w-5" />
                                Add New Owner
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-xl bg-white p-5 shadow-md border border-gray-200">
                        <p className="text-sm text-gray-500">Total Owners</p>
                        <p className="text-2xl font-bold text-gray-800">
                            {stats?.total ?? owners.total}
                        </p>
                    </div>
                    <div className="rounded-xl bg-white p-5 shadow-md border border-gray-200">
                        <p className="text-sm text-gray-500">Registered Today</p>
                        <p className="text-2xl font-bold text-green-600">{stats?.today ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-white p-5 shadow-md border border-gray-200">
                        <p className="text-sm text-gray-500">This Month</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {stats?.thisMonth ?? 0}
                        </p>
                    </div>
                </div>

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

                {/* Owners Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    <Table>
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead className="font-semibold text-gray-700">Name</TableHead>
                                <TableHead className="font-semibold text-gray-700">Phone</TableHead>
                                <TableHead className="font-semibold text-gray-700">ID No.</TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                    Registered On
                                </TableHead>
                                <TableHead className="text-right font-semibold text-gray-700">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {owners.data.length > 0 ? (
                                owners.data.map((owner) => (
                                    <TableRow
                                        key={owner.id}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <TableCell className="py-3 font-medium text-gray-800">
                                            {owner.name}
                                        </TableCell>
                                        <TableCell>{owner.phone}</TableCell>
                                        <TableCell>{owner.owner_id_no || "-"}</TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {new Date(owner.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/owner/${owner.id}/edit`}>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="rounded-md"
                                                    >
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="rounded-md"
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                "Are you sure you want to delete this owner?"
                                                            )
                                                        ) {
                                                            void router.delete(
                                                                `/admin/owner/${owner.id}`
                                                            );
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-6 text-gray-500"
                                    >
                                        No owners found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center pt-4">
                    <Pagination links={owners.links} />
                </div>
            </div>
        </AppLayout>
    );
}
