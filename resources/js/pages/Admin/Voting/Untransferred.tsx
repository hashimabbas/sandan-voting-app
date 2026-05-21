import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { ShieldAlert, Search, CheckCircle, Loader2, ArrowRight, Building2, User, Info, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Candidate {
    id: number;
    name: string;
}

interface Vote {
    id: number;
    candidate: Candidate;
}

interface Unit {
    id: number;
    unit_name: string;
    ownership_status: string;
    building: { name: string };
    votes: Vote[];
}

interface UntransferredProps {
    units: Unit[];
    candidates: Candidate[];
    flash: { success?: string; error?: string };
}

export default function Untransferred() {
    const { units, candidates, flash } = usePage<UntransferredProps>().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredUnits = units.filter(u => 
        u.unit_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.building.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const unvotedFilteredUnits = filteredUnits.filter(u => !(u.votes && u.votes.length > 0));

    const toggleUnit = (id: number) => {
        setSelectedUnitIds(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        if (selectedUnitIds.length === unvotedFilteredUnits.length && unvotedFilteredUnits.length > 0) {
            setSelectedUnitIds([]);
        } else {
            setSelectedUnitIds(unvotedFilteredUnits.map(u => u.id));
        }
    };

    const handleAdminVote = () => {
        if (selectedUnitIds.length === 0 || !selectedCandidate) return;
        
        setIsSubmitting(true);
        router.post(route('admin_voting_cast_admin_vote'), {
            unit_ids: selectedUnitIds,
            candidate_id: selectedCandidate,
        }, {
            onSuccess: () => {
                setSelectedUnitIds([]);
                setSelectedCandidate(null);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Dashboard', url: route('admin_dashboard') }, { label: 'Voting System', url: route('admin_voting_index') }, { label: 'Proxy Terminal', url: '#' }]}>
            <Head title="Admin Proxy Terminal" />

            <div className="min-h-screen bg-slate-50 text-slate-600 p-8 space-y-12 relative overflow-hidden font-sans">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

                <header className="space-y-4 relative z-10">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-[0.3em]">
                        <ShieldAlert className="w-4 h-4" /> Administrative Override
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">Proxy Vote Terminal</h1>
                    <p className="text-slate-400 font-medium text-lg">Manual vote allocation for unassigned properties and administrative units.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                    {/* Units List */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative group flex-1 w-full">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="Filter properties or locations..."
                                    className="w-full bg-white border border-slate-200 rounded-[1.5rem] py-5 pl-16 pr-6 text-slate-900 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500/50 transition-all placeholder:text-slate-300 font-bold"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={handleSelectAll}
                                className="whitespace-nowrap px-6 py-4 rounded-[1.5rem] bg-white border border-slate-200 text-slate-600 hover:border-red-500 hover:text-red-600 font-black text-sm uppercase tracking-widest transition-all shadow-sm"
                            >
                                {selectedUnitIds.length === unvotedFilteredUnits.length && unvotedFilteredUnits.length > 0 ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredUnits.map((u) => {
                                const hasVoted = u.votes && u.votes.length > 0;
                                const candidateName = hasVoted ? u.votes[0].candidate?.name : null;

                                return (
                                    <div key={u.id} className="relative group/card">
                                        <button
                                            disabled={hasVoted}
                                            onClick={() => toggleUnit(u.id)}
                                            className={cn(
                                                "w-full p-6 rounded-[2.5rem] border transition-all duration-300 text-left flex flex-col gap-4 group h-full shadow-sm",
                                                hasVoted 
                                                    ? "bg-slate-50 border-emerald-100 opacity-60 cursor-not-allowed" 
                                                    : (selectedUnitIds.includes(u.id) 
                                                        ? 'bg-white border-red-500 ring-4 ring-red-500/5 shadow-xl shadow-red-500/10' 
                                                        : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md')
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                                                    hasVoted ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                                                )}>
                                                    {hasVoted ? <CheckCircle className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    hasVoted ? "text-emerald-600" : "text-slate-400"
                                                )}>
                                                    {hasVoted ? "Authenticated" : u.ownership_status}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className={cn(
                                                    "text-xl font-black tracking-tight transition-colors",
                                                    hasVoted ? "text-slate-400" : (selectedUnitIds.includes(u.id) ? 'text-slate-900' : 'text-slate-700')
                                                )}>
                                                    {u.unit_name}
                                                </h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.building.name}</p>
                                            </div>
                                        </button>

                                        {/* Hover Indicator */}
                                        {hasVoted && (
                                            <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-all duration-300 pointer-events-none flex items-center justify-center">
                                                <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 transform translate-y-4 group-hover/card:translate-y-0 transition-transform font-bold text-xs">
                                                    <User className="w-4 h-4" />
                                                    Allocated to: {candidateName}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Control Panel */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className={cn(
                            "p-10 rounded-[3.5rem] border bg-white shadow-2xl transition-all duration-700 space-y-10 sticky top-8",
                            selectedUnitIds.length > 0 
                                ? 'border-slate-200 shadow-slate-200/50' 
                                : 'opacity-40 grayscale pointer-events-none border-slate-100'
                        )}>
                            <div className="space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-6">
                                    <Terminal className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Override Console</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Selected Nodes: <span className="text-red-600">{selectedUnitIds.length > 0 ? `${selectedUnitIds.length} Units` : '---'}</span></p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Assign to Candidate</label>
                                <div className="space-y-3">
                                    {candidates.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => setSelectedCandidate(c.id)}
                                            className={cn(
                                                "w-full p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group/cand",
                                                selectedCandidate === c.id 
                                                    ? 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/10' 
                                                    : 'bg-slate-50 border-slate-50 hover:border-slate-200'
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm",
                                                    selectedCandidate === c.id ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300'
                                                )}>
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <span className={cn(
                                                    "font-bold transition-colors",
                                                    selectedCandidate === c.id ? 'text-slate-900' : 'text-slate-400 group-hover/cand:text-slate-600'
                                                )}>{c.name}</span>
                                            </div>
                                            {selectedCandidate === c.id && <CheckCircle className="w-5 h-5 text-emerald-500 animate-in zoom-in duration-300" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleAdminVote}
                                disabled={selectedUnitIds.length === 0 || !selectedCandidate || isSubmitting}
                                className={cn(
                                    "w-full py-6 rounded-3xl font-black text-xl transition-all duration-300 flex items-center justify-center gap-3",
                                    selectedUnitIds.length === 0 || !selectedCandidate || isSubmitting
                                        ? 'bg-slate-100 text-slate-300'
                                        : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-2xl shadow-slate-900/10 hover:shadow-emerald-500/20 active:scale-[0.98]'
                                )}
                            >
                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Finalize Override ({selectedUnitIds.length}) <ArrowRight className="w-5 h-5" /></>}
                            </button>

                            {selectedUnitIds.length > 0 && (
                                <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Info className="w-3 h-3" /> System audit log will be generated.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </AppLayout>
    );
}
