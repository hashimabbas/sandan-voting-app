// resources/js/Pages/Owner/Dashboard.tsx

// import AppLayoutOwner from '@/layouts/app/app-layout-owner';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarDays, CheckCircle, Clock } from 'lucide-react'; // Added icons
import { route } from 'ziggy-js';
import { cn } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';

// New interface for Active Elections relevant to the owner
interface OwnerActiveElection {
    id: number;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string;
    status: 'pending' | 'active' | 'completed' | 'archived';
    has_voted: boolean; // Indicates if *this owner* has voted for *this election*
}

interface OwnerDashboardProps {
    breadcrumbs: BreadcrumbItem[];
    activeElections: OwnerActiveElection[]; // List of elections the owner can vote in
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function OwnerDashboard() {
    const { activeElections, flash } = usePage<OwnerDashboardProps>().props;

    const getStatusBadgeClass = (status: OwnerActiveElection['status']) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'archived': return 'bg-gray-100 text-gray-800';
            case 'pending':
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Owner Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <h2 className="text-3xl font-bold text-gray-800">Hello, {usePage().props.auth.user.name}!</h2>
                <p className="text-gray-600">Welcome to your owner dashboard. Here you can find important updates and participation opportunities.</p>

                {/* Flash Messages */}
                {flash.success && (<div className="rounded-md bg-green-100 border border-green-300 p-3 text-green-700 shadow-sm"> ✅ {flash.success} </div>)}
                {flash.error && (<div className="rounded-md bg-red-100 border border-red-300 p-3 text-red-700 shadow-sm"> ❌ {flash.error} </div>)}
                {flash.info && (<div className="rounded-md bg-blue-100 border border-blue-300 p-3 text-blue-700 shadow-sm"> ℹ️ {flash.info} </div>)}

                {/* Elections for Owners Section */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-indigo-600" /> Your Elections
                    </h3>
                    <p className="text-gray-600">Participate in available community elections.</p>

                    {activeElections.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeElections.map((election) => (
                                <div key={election.id} className="rounded-xl border p-4 shadow-sm bg-gray-50 flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">{election.title}</h4>
                                        <p className="text-sm text-gray-600 mb-2">{election.description}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                            <Clock className="h-4 w-4" />
                                            <span>{new Date(election.start_time).toLocaleDateString()} - {new Date(election.end_time).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        {election.has_voted ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" /> Voted
                                            </span>
                                        ) : (
                                            <Link href={route('owner_voting_index', { election_id: election.id })}>
                                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                                    Vote Now
                                                </Button>
                                            </Link>
                                        )}
                                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold", getStatusBadgeClass(election.status))}>
                                            {election.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No elections available for you to vote in at this time.</p>
                    )}
                </div>

                {/* Placeholder Content (Original Dashboard Items) */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">Your other dashboard content here</div>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">More widgets</div>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:dark:stroke-neutral-100/20" /> */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">Analytics</div>
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" /> */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">Main content area</div>
                </div>
            </div>
        </AppLayout>
    );
}
