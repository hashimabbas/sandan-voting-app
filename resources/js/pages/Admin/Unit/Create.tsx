import React, { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BreadcrumbItem } from "@/types";

interface Owner {
    id: number;
    name: string;
    owner_id_no: string;
}

interface CreateUnitProps {
    owners: Owner[];
    breadcrumbs: BreadcrumbItem[];
}



export default function CreateUnit({ owners, breadcrumbs }: CreateUnitProps) {
    const { data, setData, post, processing, errors } = useForm({
        owner_id_no: "",
        unit_code: "",
        y2020: 0,
        y2021: 0,
        y2022: 0,
        y2023: 0,
        y2024: 0,
        y2025: 0,
        y2026: 0,
        received: 0,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post("/admin/unit/create");
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Unit" />
            <div className="max-w-3xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold">Add New Unit</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Owner Dropdown */}
                    <div>
                        <Label>Owner</Label>
                        <Select
                            onValueChange={(value) => setData("owner_id_no", value)}
                            defaultValue={data.owner_id_no}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Owner" />
                            </SelectTrigger>
                            <SelectContent>
                                {owners.map((owner) => (
                                    <SelectItem key={owner.id} value={owner.owner_id_no}>
                                        {owner.name} — {owner.owner_id_no}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.owner_id_no && <p className="text-red-600 text-sm">{errors.owner_id_no}</p>}
                    </div>

                    {/* Unit Code */}
                    <div>
                        <Label>Unit Code</Label>
                        <Input
                            type="text"
                            value={data.unit_code}
                            onChange={(e) => setData("unit_code", e.target.value)}
                        />
                        {errors.unit_code && <p className="text-red-600 text-sm">{errors.unit_code}</p>}
                    </div>

                    {/* Years */}
                    <div className="grid grid-cols-2 gap-4">
                        {["y2020", "y2021", "y2022", "y2023", "y2024", "y2025", "y2026"].map((year) => (
                            <div key={year}>
                                <Label>{year.toUpperCase()}</Label>
                                <Input
                                    type="number"
                                    step="0.001"
                                    value={data[year as keyof typeof data] as number}
                                    onChange={(e) => setData(year as keyof typeof data, parseFloat(e.target.value))}
                                />
                                {errors[year as keyof typeof errors] && (
                                    <p className="text-red-600 text-sm">
                                        {errors[year as keyof typeof errors]}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Received */}
                    <div>
                        <Label>Received</Label>
                        <Input
                            type="number"
                            step="0.001"
                            value={data.received}
                            onChange={(e) => setData("received", parseFloat(e.target.value))}
                        />
                        {errors.received && <p className="text-red-600 text-sm">{errors.received}</p>}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2">
                        <Link href="/admin/units">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            Save
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
