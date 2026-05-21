import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { PlusCircle, Search, Edit, Trash2, UserRoundCheck, Filter, Sparkles, Phone, Calendar, Info, ArrowUpRight } from 'lucide-react';

interface ElectionShort {
    id: number;
    title: string;
}

interface Candidate {
    id: number;
    election_id: number;
    name: string;
    phone: string | null;
    description: string | null;
    photo: string | null;
    created_at: string;
}

interface AdminCandidateIndexProps {
    candidates: {
        data: Candidate[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    elections: ElectionShort[];
    filters: {
        search?: string;
        election_id?: string;
    };
    breadcrumbs: BreadcrumbItem[];
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
    can: {
        viewCandidates: boolean;
        createCandidates: boolean;
        editCandidates: boolean;
        deleteCandidates: boolean;
    };
}

export default function AdminCandidateIndex() {
    const { candidates, elections, filters, breadcrumbs, flash, can } = usePage<AdminCandidateIndexProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedElectionId, setSelectedElectionId] = useState<string>(filters.election_id?.toString() || '');

    const handleFilter = () => {
        router.get(route('admin_candidates_index'), { search, election_id: selectedElectionId }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (id: number, candidateName: string) => {
        if (confirm(`Are you sure you want to delete candidate "${candidateName}"?`)) {
            router.delete(route('admin_candidates_destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Candidate Directory" />

            <div className="min-h-screen bg-[#020617] text-slate-300 p-8 space-y-12 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

                {/* Flash Messages */}
                <div className="relative z-10 max-w-4xl mx-auto space-y-4">
                    {flash.success && (
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <Sparkles className="w-5 h-5 shrink-0" />
                            <p className="text-xs font-black uppercase tracking-widest">{flash.success}</p>
                        </div>
                    )}
                    {flash.error && (
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                            <Info className="w-5 h-5 shrink-0" />
                            <p className="text-xs font-black uppercase tracking-widest">{flash.error}</p>
                        </div>
                    )}
                </div>

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.4em]">
                            <UserRoundCheck className="w-4 h-4" /> Professional Registry
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">Candidate Directory</h1>
                        <p className="text-slate-500 font-medium max-w-xl">Curate and manage the profiles of individuals participating in the upcoming democratic selection process.</p>
                    </div>

                    {can.createCandidates && (
                        <Link 
                            href={route('admin_candidates_create', { election_id: selectedElectionId })}
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/20 group"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span>Add Candidate</span>
                            <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                    )}
                </header>

                {/* Filters */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search by name or credentials..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            />
                        </div>
                        <div className="relative group">
                            <Select onValueChange={(v) => setSelectedElectionId(v)} value={selectedElectionId}>
                                <SelectTrigger className="h-full bg-white/5 border-white/10 rounded-2xl py-5 px-6 text-white focus:ring-2 focus:ring-indigo-500/20 transition-all">
                                    <SelectValue placeholder="All Active Elections" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                                    <SelectItem value="all">All Elections</SelectItem>
                                    {elections.map(e => (
                                        <SelectItem key={e.id} value={e.id.toString()}>{e.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <button 
                        onClick={handleFilter}
                        className="w-full h-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                        Apply Filters
                    </button>
                </div>

                {/* Candidate Grid */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                    {candidates.data.map((candidate) => (
                        <div 
                            key={candidate.id}
                            className="group bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 space-y-8 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-700 relative overflow-hidden"
                        >
                            {/* Card Background Glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                            {/* Candidate Photo */}
                            <div className="relative">
                                {candidate.photo ? (
                                    <img 
                                        src={candidate.photo} 
                                        alt={candidate.name} 
                                        className="w-full aspect-[4/5] object-cover rounded-[2rem] grayscale group-hover:grayscale-0 transition-all duration-1000 scale-[1.02] group-hover:scale-100 shadow-2xl"
                                    />
                                ) : (
                                    <div className="w-full aspect-[4/5] bg-slate-800 rounded-[2rem] flex items-center justify-center text-7xl font-black text-slate-700 uppercase group-hover:text-indigo-500 transition-colors">
                                        {candidate.name.charAt(0)}
                                    </div>
                                )}
                                
                                {/* Floating Badge */}
                                <div className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-[10px] font-black text-white uppercase tracking-widest shadow-2xl">
                                    {elections.find(e => e.id === candidate.election_id)?.title || 'Global'}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tighter group-hover:text-indigo-400 transition-colors">{candidate.name}</h3>
                                    <div className="flex items-center gap-2 mt-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                        <Phone className="w-3 h-3" /> {candidate.phone || 'No direct contact'}
                                    </div>
                                </div>

                                <p className="text-slate-500 text-sm font-medium line-clamp-2 min-h-[40px]">
                                    {candidate.description || 'No additional professional summary provided for this candidate.'}
                                </p>

                                <div className="pt-4 flex items-center justify-between border-t border-white/5">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-tighter">{new Date(candidate.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {can.editCandidates && (
                                            <Link 
                                                href={route('admin_candidates_edit', candidate.id)}
                                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-xl"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                        )}
                                        {can.deleteCandidates && (
                                            <button 
                                                onClick={() => handleDelete(candidate.id, candidate.name)}
                                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:bg-red-600 hover:text-white transition-all shadow-xl"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {candidates.data.length === 0 && (
                        <div className="col-span-full py-40 text-center bg-white/[0.01] border border-white/5 border-dashed rounded-[4rem]">
                            <Sparkles className="w-16 h-16 text-indigo-500/20 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-white tracking-tight">Registry Empty</h3>
                            <p className="text-slate-600 font-medium uppercase tracking-[0.2em] text-[10px] mt-2">Standing by for new candidate data</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {candidates.last_page > 1 && (
                    <div className="relative z-10 flex justify-center py-12">
                        <Pagination links={candidates.links} />
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            `}} />
        </AppLayout>
    );
}
