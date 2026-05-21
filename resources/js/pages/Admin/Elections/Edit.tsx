import React from 'react';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { type BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Loader2, ArrowLeft, Calendar, FileText, Settings2, Sparkles, ShieldCheck, Clock, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ElectionData {
    id: number;
    title: string;
    description: string | null;
    start_time: string | null;
    end_time: string | null;
    status: 'pending' | 'active' | 'completed' | 'archived';
    is_public: boolean;
    show_results: boolean;
}

interface AdminElectionEditProps {
    election: ElectionData;
    breadcrumbs: BreadcrumbItem[];
}

export default function AdminElectionEdit() {
    const { election, breadcrumbs } = usePage<AdminElectionEditProps>().props;
    const { data, setData, put, processing, errors } = useForm({
        title: election.title,
        description: election.description || '',
        start_time: election.start_time ? new Date(election.start_time).toISOString().slice(0, 16) : '',
        end_time: election.end_time ? new Date(election.end_time).toISOString().slice(0, 16) : '',
        status: election.status,
        is_public: election.is_public,
        show_results: election.show_results,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin_elections_update', election.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Assembly: ${election.title}`} />

            <div className="min-h-screen bg-[#020617] text-slate-300 p-8 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

                <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                    {/* Left Side: Context */}
                    <div className="lg:col-span-2 space-y-8">
                        <Link 
                            href={route('admin_elections_index')}
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group text-xs font-black uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Matrix
                        </Link>

                        <div className="space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                                <Settings2 className="w-8 h-8 text-white" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Modify Configuration</h1>
                                <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest leading-none">{election.title}</p>
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Update the core parameters for this assembly. Changes will propagate across the Sandan Real Estate voting network instantly.
                            </p>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                            <div className="flex items-center gap-3 text-emerald-400">
                                <ShieldCheck className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Protocol Verified</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Modification during an active cycle is monitored and logged in the system audit trail.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 md:p-14 space-y-10 backdrop-blur-3xl shadow-2xl shadow-black/50">
                            <div className="space-y-8">
                                {/* Title */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2 flex items-center gap-2">
                                        <FileText className="w-3 h-3" /> Assembly Identity
                                    </label>
                                    <input 
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                    {errors.title && <p className="text-red-400 text-[10px] font-bold uppercase ml-2">{errors.title}</p>}
                                </div>

                                {/* Timeline Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2 flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> Activation Date
                                        </label>
                                        <input 
                                            type="datetime-local"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all [color-scheme:dark]"
                                            value={data.start_time}
                                            onChange={(e) => setData('start_time', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2 flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-red-400" /> Termination Date
                                        </label>
                                        <input 
                                            type="datetime-local"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all [color-scheme:dark]"
                                            value={data.end_time}
                                            onChange={(e) => setData('end_time', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Status & Visibility */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2 flex items-center gap-2">
                                            <Settings2 className="w-3 h-3" /> Operation Status
                                        </label>
                                        <Select onValueChange={(v: any) => setData('status', v)} value={data.status}>
                                            <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-2xl h-16 px-6 text-white focus:ring-2 focus:ring-indigo-500/20 transition-all">
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="active">Active (Immediate)</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-4 flex flex-col justify-center pt-6">
                                        <label className="flex items-center gap-4 cursor-pointer group">
                                            <Checkbox 
                                                id="is_public" 
                                                checked={data.is_public} 
                                                onCheckedChange={(v) => setData('is_public', v as boolean)}
                                                className="w-6 h-6 border-white/10 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-white uppercase tracking-widest group-hover:text-emerald-400 transition-colors">Public Directory</span>
                                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Visible to external nodes</span>
                                            </div>
                                        </label>
                                        
                                        <label className="flex items-center gap-4 cursor-pointer group">
                                            <Checkbox 
                                                id="show_results" 
                                                checked={data.show_results} 
                                                onCheckedChange={(v) => setData('show_results', v as boolean)}
                                                className="w-6 h-6 border-white/10 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-white uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Live Results</span>
                                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Voters can see results after voting</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Meeting Agenda / Overview</label>
                                    <textarea 
                                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[140px] resize-none"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing}
                                className="w-full py-6 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20"
                            >
                                {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Commit Changes <Save className="w-5 h-5" /></>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
