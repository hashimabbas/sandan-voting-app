import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { type BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { 
    PlusCircle, Search, Edit, Trash2, Play, Pause, 
    RotateCcw, BarChart3, Maximize, Calendar, 
    Shield, Activity, ArrowUpRight, CheckCircle2,
    Clock, Archive, AlertCircle, QrCode
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ShareElectionModal from '@/components/share-election-modal';

interface Election {
    id: number;
    title: string;
    description: string | null;
    start_time: string | null;
    end_time: string | null;
    status: 'pending' | 'active' | 'completed' | 'archived';
    is_public: boolean;
    slug: string;
    created_at: string;
    updated_at: string;
}

interface AdminElectionIndexProps {
    elections: {
        data: Election[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
    breadcrumbs: BreadcrumbItem[];
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
    can: {
        createElections: boolean;
        editElections: boolean;
        deleteElections: boolean;
        manageVotingSystem: boolean;
        viewElectionLiveResults: boolean;
    };
}

export default function AdminElectionIndex() {
    const { elections, filters, breadcrumbs, flash, can } = usePage<AdminElectionIndexProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [isProcessingAction, setIsProcessingAction] = useState<number | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedElection, setSelectedElection] = useState<Election | null>(null);

    const handleSearch = () => {
        router.get(route('admin_elections_index'), { search }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleToggleStatus = (election: Election, action: 'activate' | 'deactivate' | 'complete' | 'archive') => {
        if (confirm(`Confirm status transition to: ${action.toUpperCase()} for assembly "${election.title}"?`)) {
            setIsProcessingAction(election.id);
            router.post(route('admin_elections_toggle_status', election.id), { action: action }, {
                preserveScroll: true,
                onFinish: () => setIsProcessingAction(null),
            });
        }
    };

    const handleResetVotes = (election: Election) => {
        if (confirm(`CRITICAL: Wipe all cast data for "${election.title}"? This cannot be reversed.`)) {
            setIsProcessingAction(election.id);
            router.post(route('admin_elections_reset_votes', election.id), {}, {
                preserveScroll: true,
                onFinish: () => setIsProcessingAction(null),
            });
        }
    };

    const handleShare = (election: Election) => {
        setSelectedElection(election);
        setIsShareModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assembly Matrix" />

            <div className="min-h-screen bg-[#020617] text-slate-300 p-8 space-y-12 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.4em]">
                            <Shield className="w-4 h-4" /> Assembly Governance Matrix
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">Voting Assemblies</h1>
                        <p className="text-slate-500 font-medium max-w-xl text-lg">Manage general meetings, property resolutions, and democratic cycles for the Sandan Real Estate ecosystem.</p>
                    </div>

                    {can.createElections && (
                        <Link 
                            href={route('admin_elections_create')}
                            className="inline-flex items-center gap-4 px-10 py-5 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/10 group"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span>New Assembly</span>
                            <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                    )}
                </header>

                {/* Flash Messages */}
                {(flash.success || flash.error || flash.info) && (
                    <div className="relative z-10 space-y-4 max-w-5xl mx-auto">
                        {flash.success && (
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="text-sm">{flash.success}</span>
                            </div>
                        )}
                        {flash.error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm">{flash.error}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Search / Analytics Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
                    <div className="lg:col-span-3 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Identify assembly by title, description or meeting code..."
                            className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 pl-16 pr-6 text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-700"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col justify-center items-center">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Cycles</span>
                            <span className="text-2xl font-black text-white leading-none">{elections.total}</span>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-6 flex flex-col justify-center items-center">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Active Now</span>
                            <span className="text-2xl font-black text-emerald-400 leading-none">{elections.data.filter(e => e.status === 'active').length}</span>
                        </div>
                    </div>
                </div>

                {/* Assembly Grid */}
                <div className="relative z-10 grid grid-cols-1 gap-6">
                    {elections.data.map((election) => (
                        <div 
                            key={election.id}
                            className={cn(
                                "group relative overflow-hidden bg-white/[0.02] border rounded-[2.5rem] p-8 transition-all duration-500 hover:bg-white/[0.04]",
                                election.status === 'active' ? "border-emerald-500/30 shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]" : "border-white/5"
                            )}
                        >
                            {/* Card Decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                                {/* Left Side: Info */}
                                <div className="flex items-start gap-6 max-w-2xl">
                                    <div className={cn(
                                        "w-20 h-20 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-2xl",
                                        election.status === 'active' ? "bg-emerald-600 shadow-emerald-500/20" : "bg-slate-800"
                                    )}>
                                        {election.status === 'active' ? <Activity className="w-10 h-10 text-white animate-pulse" /> : <Clock className="w-10 h-10 text-slate-500" />}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-black text-white tracking-tight">{election.title}</h3>
                                            <span className={cn(
                                                "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                election.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                                                election.status === 'completed' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                                                "bg-slate-500/10 text-slate-500 border-white/10"
                                            )}>
                                                {election.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 font-medium line-clamp-2 leading-relaxed">{election.description || 'No detailed strategic overview provided for this assembly cycle.'}</p>
                                        
                                        <div className="flex items-center gap-6 pt-2">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-tighter">
                                                    {election.start_time ? new Date(election.start_time).toLocaleDateString() : 'Unscheduled'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-tighter">
                                                    {election.is_public ? 'Public Access' : 'Private Registry'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Actions */}
                                <div className="flex items-center gap-3 flex-wrap justify-end">
                                    {/* Primary Controls */}
                                    <div className="flex items-center bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-2xl gap-2 shadow-2xl">
                                        {can.manageVotingSystem && election.status === 'pending' && (
                                            <Button
                                                onClick={() => handleToggleStatus(election, 'activate')}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-12 px-6"
                                                disabled={isProcessingAction === election.id}
                                            >
                                                <Play className="w-4 h-4 mr-2" /> Launch
                                            </Button>
                                        )}
                                        {can.manageVotingSystem && election.status === 'active' && (
                                            <Button
                                                onClick={() => handleToggleStatus(election, 'deactivate')}
                                                className="bg-red-600 hover:bg-red-500 text-white rounded-xl h-12 px-6"
                                                disabled={isProcessingAction === election.id}
                                            >
                                                <Pause className="w-4 h-4 mr-2" /> Suspend
                                            </Button>
                                        )}
                                        {can.manageVotingSystem && election.status !== 'completed' && election.status !== 'archived' && (
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleToggleStatus(election, 'complete')}
                                                className="text-slate-400 hover:text-white rounded-xl h-12"
                                                disabled={election.status === 'active'}
                                            >
                                                Finalize
                                            </Button>
                                        )}
                                        {can.manageVotingSystem && election.status === 'completed' && (
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleToggleStatus(election, 'archive')}
                                                className="text-slate-400 hover:text-white rounded-xl h-12"
                                            >
                                                <Archive className="w-4 h-4 mr-2" /> Archive
                                            </Button>
                                        )}
                                    </div>

                                    {/* Secondary Actions */}
                                    <div className="flex items-center gap-2">
                                        <Link href={route('admin_elections_results', election.id)}>
                                            <button className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-xl">
                                                <BarChart3 className="w-5 h-5" />
                                            </button>
                                        </Link>
                                        <Link href={route('admin_elections_live_results', election.id)} target="_blank">
                                            <button className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all shadow-xl">
                                                <Maximize className="w-5 h-5" />
                                            </button>
                                        </Link>
                                        <button 
                                            onClick={() => handleShare(election)}
                                            className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-all shadow-xl"
                                        >
                                            <QrCode className="w-5 h-5" />
                                        </button>
                                        {can.editElections && (
                                            <Link href={route('admin_elections_edit', election.id)}>
                                                <button className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white hover:text-black transition-all shadow-xl">
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                            </Link>
                                        )}
                                        {can.manageVotingSystem && (
                                            <button 
                                                onClick={() => handleResetVotes(election)}
                                                disabled={election.status === 'active'}
                                                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500 hover:bg-orange-600 hover:text-white transition-all shadow-xl disabled:opacity-20"
                                            >
                                                <RotateCcw className="w-5 h-5" />
                                            </button>
                                        )}
                                        {can.deleteElections && (
                                            <button 
                                                onClick={() => handleDelete(election.id, election.title)}
                                                disabled={election.status === 'active'}
                                                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-xl disabled:opacity-20"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {elections.data.length === 0 && (
                        <div className="py-40 text-center bg-white/[0.01] border border-white/5 border-dashed rounded-[4rem]">
                            <AlertCircle className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-white tracking-tight">No Assemblies Found</h3>
                            <p className="text-slate-600 font-medium uppercase tracking-[0.2em] text-[10px] mt-2">Standing by for meeting schedule data</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {elections.last_page > 1 && (
                    <div className="relative z-10 flex justify-center py-12">
                        <Pagination links={elections.links} />
                    </div>
                )}
            </div>

            {selectedElection && (
                <ShareElectionModal 
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    election={selectedElection}
                    votingUrl={`${window.location.origin}/vote?election_id=${selectedElection.id}`}
                />
            )}
        </AppLayout>
    );
}
