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

// Owner interface (relation)
interface Owner {
    id: number;
    name: string;
    owner_id_no: string;
    phone: string;
}

// Unit interface
interface Unit {
    id: number;
    unit_code: string;
    y2020: number;
    y2021: number;
    y2022: number;
    y2023: number;
    y2024: number;
    y2025: number;
    y2026: number;
    total: number;
    received: number;
    balance: number;
    owner: Owner; // 🔑 relation
}

// Props
interface UnitIndexProps {
    units: {
        data: Unit[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    breadcrumbs: BreadcrumbItem[];
}

export default function UnitIndex({ units, breadcrumbs }: UnitIndexProps) {
    const { flash } = usePage<PageProps>().props;
    const [search, setSearch] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleImportRentAdjustment = () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        // Corrected route to units.import.rent-adjustments
        router.post(('/admin/units/import/rent-adjustments'), formData, {
            onSuccess: () => {
                setFile(null); // reset file input after success
            },
            onError: (errors) => {
                console.error("Rent Adjustment Import Error:", errors);
            },
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Units" />

            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                {/* Page Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h2 className="text-3xl font-bold text-gray-800">🏠 Units Dashboard</h2>

                    <div className="flex gap-2 items-center">
                        <input
                            type="file"
                            accept=".xls,.xlsx"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="block text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
                        />
                        <Button onClick={handleImportRentAdjustment} disabled={!file}>
                            Import Rent Adjustments XLS
                        </Button>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="🔍 Search by unit or owner..."
                            className="w-64 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary transition"
                        />
                        {search && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                onClick={() => setSearch("")}
                            >
                                Reset
                            </Button>
                        )}
                        <Button asChild className="rounded-lg shadow-md bg-primary text-white">
                            <Link href="/admin/unit/create" className="flex items-center gap-2">
                                <PlusCircle className="h-5 w-5" />
                                Add New Unit
                            </Link>
                        </Button>
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

                {/* Units Table */}
                <div className="overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                    <Table>
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead className="font-semibold text-gray-700">Unit</TableHead>
                                <TableHead className="font-semibold text-gray-700">Owner</TableHead>
                                <TableHead className="font-semibold text-gray-700">ID No.</TableHead>
                                <TableHead className="font-semibold text-gray-700">Contact No.</TableHead>
                                <TableHead>2020</TableHead>
                                <TableHead>2021</TableHead>
                                <TableHead>2022</TableHead>
                                <TableHead>2023</TableHead>
                                <TableHead>2024</TableHead>
                                <TableHead>2025</TableHead>
                                <TableHead>2026</TableHead>
                                <TableHead className="font-semibold">Total</TableHead>
                                <TableHead className="font-semibold">Received</TableHead>
                                <TableHead className="font-semibold">Balance</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {units.data.length > 0 ? (
                                units.data.map((unit) => (
                                    <TableRow key={unit.id} className="hover:bg-gray-50 transition">
                                        <TableCell>{unit.unit_code}</TableCell>
                                        <TableCell className="font-medium text-gray-800">
                                            {unit.owner?.name ?? "—"}
                                        </TableCell>
                                        <TableCell>{unit.owner?.owner_id_no ?? "—"}</TableCell>
                                        <TableCell>{unit.owner?.phone ?? "—"}</TableCell>
                                        <TableCell>{Number(unit.y2020 ?? 0).toFixed(3)}</TableCell>
                                        <TableCell>{Number(unit.y2021 ?? 0).toFixed(3)}</TableCell>
                                        <TableCell>{Number(unit.y2022 ?? 0).toFixed(3)}</TableCell>
                                        <TableCell>{Number(unit.y2023 ?? 0).toFixed(3)}</TableCell>
                                        <TableCell>{Number(unit.y2024 ?? 0).toFixed(3)}</TableCell>
                                        <TableCell>{Number(unit.y2025 ?? 0).toFixed(3)}</TableCell>
                                        <TableCell>{Number(unit.y2026 ?? 0).toFixed(3)}</TableCell>
                                        <TableCell className="font-semibold">{Number(unit.total ?? 0).toFixed(3)}</TableCell>
                                        <TableCell className="text-green-600 font-semibold">
                                            {Number(unit.received ?? 0).toFixed(3)}
                                        </TableCell>
                                        <TableCell
                                            className={`font-semibold ${unit.balance > 0 ? "text-red-600" : "text-green-600"
                                                }`}
                                        >
                                            {Number(unit.balance ?? 0).toFixed(3)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/unit/${unit.id}/edit`}>
                                                    <Button size="sm" variant="outline" className="rounded-md">
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="rounded-md"
                                                    onClick={() => {
                                                        if (confirm("Are you sure you want to delete this unit?")) {
                                                            void router.delete(`/admin/unit/${unit.id}`);
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
                                    <TableCell colSpan={15} className="text-center py-6 text-gray-500">
                                        No units found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center pt-4">
                    <Pagination links={units.links} />
                </div>
            </div>
        </AppLayout>
    );
}
