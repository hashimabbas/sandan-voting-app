// resources/js/Pages/Owner/Voting/Inactive.tsx
"use client";

import { Head, Link, usePage } from '@inertiajs/react';
import AppSidebarOwnerLayout from '@/layouts/app/app-sidebar-layout-owner';
import { type BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OwnerVotingInactiveProps {
    status: string;
    electionTitle: string; // NEW: Pass election title
    breadcrumbs: BreadcrumbItem[];
}

export default function OwnerVotingInactive() {
    const { status, electionTitle, breadcrumbs } = usePage<OwnerVotingInactiveProps>().props;

    return (
        <AppSidebarOwnerLayout breadcrumbs={breadcrumbs}>
            <Head title={`Voting Inactive: ${electionTitle}`} />

            <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center bg-gray-50">
                <Ban className="h-24 w-24 text-red-500 mb-6" />
                <h2 className="text-4xl font-bold text-gray-800 mb-4">Voting for "{electionTitle}" is Currently Inactive</h2>
                <p className="text-lg text-gray-600 max-w-xl">
                    The voting system for this election is currently <span className="font-bold text-red-600">{status.replace(/_/g, ' ')}</span>. Please check back later.
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
