import React, { useEffect } from 'react';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Loader2, ArrowLeft, Camera, UserPlus, Sparkles, ShieldCheck, Info } from 'lucide-react';

interface ElectionShort {
    id: number;
    title: string;
}

interface AdminCandidateCreateProps {
    elections: ElectionShort[];
    selectedElectionId?: number | null;
    breadcrumbs: BreadcrumbItem[];
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
}

export default function AdminCandidateCreate() {
    const { elections, selectedElectionId, breadcrumbs, flash } = usePage<AdminCandidateCreateProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        election_id: selectedElectionId ? selectedElectionId.toString() : (elections[0]?.id.toString() || ''),
        name: '',
        phone: '',
        description: '',
        photo: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin_candidates_store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Onboard New Candidate" />

            <div className="min-h-screen bg-[#020617] text-slate-300 p-8 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

                <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                    {/* Flash Messages */}
                    <div className="col-span-full space-y-4">
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

                    {/* Left Side: Context */}
                    <div className="lg:col-span-2 space-y-8">
                        <Link 
                            href={route('admin_candidates_index')}
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group text-xs font-black uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Registry
                        </Link>

                        <div className="space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                                <UserPlus className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Onboard New Candidate</h1>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Initialize a professional profile within the secure voting matrix. All data is verified against system protocols.
                            </p>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                            <div className="flex items-center gap-3 text-emerald-400">
                                <ShieldCheck className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Protocol Verified</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Candidates must meet all professional criteria for the selected election node. Modification after activation is restricted.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 md:p-14 space-y-10 backdrop-blur-3xl shadow-2xl shadow-black/50">
                            <div className="space-y-8">
                                {/* Election Select */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Target Election</label>
                                    <Select onValueChange={(v) => setData('election_id', v)} value={data.election_id}>
                                        <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-2xl h-16 px-6 text-white focus:ring-2 focus:ring-indigo-500/20 transition-all">
                                            <SelectValue placeholder="Select Election Node" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                                            {elections.map(e => (
                                                <SelectItem key={e.id} value={e.id.toString()}>{e.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.election_id && <p className="text-red-400 text-[10px] font-bold uppercase ml-2">{errors.election_id}</p>}
                                </div>

                                {/* Full Name */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Candidate Full Name</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-700"
                                        placeholder="e.g. Dr. Alexander Thorne"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <p className="text-red-400 text-[10px] font-bold uppercase ml-2">{errors.name}</p>}
                                </div>

                                {/* Grid: Phone & Photo */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Contact Protocol</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-700 font-mono"
                                            placeholder="+968 XXXX XXXX"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Visual ID (Photo)</label>
                                        <label className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 px-6 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all group/file">
                                            <span className="text-slate-500 group-hover:text-slate-300 transition-colors truncate max-w-[120px]">
                                                {data.photo ? data.photo.name : 'Upload JPEG/PNG'}
                                            </span>
                                            <Camera className="w-5 h-5 text-indigo-400" />
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                onChange={(e) => setData('photo', e.target.files?.[0] || null)}
                                                accept="image/*"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Professional Summary</label>
                                    <textarea 
                                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-700 min-h-[120px] resize-none"
                                        placeholder="Outline the candidate's core mission and professional history..."
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full py-6 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/20"
                            >
                                {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Register Candidate <Sparkles className="w-5 h-5" /></>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
