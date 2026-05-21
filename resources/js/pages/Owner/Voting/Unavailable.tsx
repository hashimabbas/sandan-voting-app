// resources/js/Pages/Owner/Voting/Unavailable.tsx
"use client";

import { Head, Link, usePage } from '@inertiajs/react';
import AppSidebarOwnerLayout from '@/layouts/app/app-sidebar-layout-owner';
import { type BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OwnerVotingUnavailableProps {
    message: string;
    electionTitle?: string; // NEW: Optional election title
    breadcrumbs: BreadcrumbItem[];
}

export default function OwnerVotingUnavailable() {
    const { message, electionTitle, breadcrumbs } = usePage<OwnerVotingUnavailableProps>().props;

    return (
        <AppSidebarOwnerLayout breadcrumbs={breadcrumbs}>
            <Head title={`Voting Unavailable: ${electionTitle || ''}`} />

            <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center bg-gray-50">
                <XCircle className="h-24 w-24 text-red-500 mb-6" />
                <h2 className="text-4xl font-bold text-gray-800 mb-4">Voting Unavailable {electionTitle ? `for "${electionTitle}"` : ''}</h2>
                <p className="text-lg text-gray-600 max-w-xl">
                    {message}
                </p>
                <p className="text-md text-gray-500 mt-2">
                    Please contact administration if you believe this is an error.
                </p>
                <Link href={route('owner_dashboard')} className="mt-8">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-6 py-3">
                        Go to Dashboard
                    </Button>
                </Link>
            </div>
        </AppSidebarOwnerLayout>
    );
}
