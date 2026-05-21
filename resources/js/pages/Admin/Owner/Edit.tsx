import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { LoaderCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Owner {
    id: number;
    name: string;
    phone: string;
    owner_id_no: string | null;
}

interface EditOwnerProps {
    owner: Owner;
    breadcrumbs: BreadcrumbItem[];
}

export default function EditOwner({ owner, breadcrumbs }: EditOwnerProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: owner.name,
        phone: owner.phone,
        owner_id_no: owner.owner_id_no || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/owner/${owner.id}/update`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Owner: ${owner.name}`} />

            <div className="mx-auto max-w-2xl p-6 space-y-8">
                {/* Page Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Edit Owner: {owner.name}
                    </h2>
                    <p className="text-gray-500">
                        Update the details below and save changes to the owner account.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-1">
                            <Label htmlFor="name" className="font-medium">Owner Name</Label>
                            <Input
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Full name"
                                className="px-4 py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-1">
                            <Label htmlFor="phone" className="font-medium">Phone Number</Label>
                            <Input
                                id="phone"
                                type="text"
                                name="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="+96812345678"
                                className="px-4 py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition"
                                required
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="grid gap-1">
                            <Label htmlFor="owner_id_no" className="font-medium">ID Number (Optional)</Label>
                            <Input
                                id="owner_id_no"
                                type="text"
                                name="owner_id_no"
                                value={data.owner_id_no}
                                onChange={(e) => setData('owner_id_no', e.target.value)}
                                placeholder="Owner ID Number"
                                className="px-4 py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition"
                            />
                            <InputError message={errors.owner_id_no} />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-dark text-white py-3 text-lg rounded-lg flex items-center justify-center gap-2 transition"
                            disabled={processing}
                        >
                            {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                            Update Owner Account
                        </Button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
