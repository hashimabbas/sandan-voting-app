import React from 'react';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Loader2, ArrowLeft, Camera, Edit3, Sparkles, ShieldCheck, Trash2, User, Info } from 'lucide-react';

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
}

interface AdminCandidateEditProps {
    candidate: Candidate;
    elections: ElectionShort[];
    breadcrumbs: BreadcrumbItem[];
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
}

export default function AdminCandidateEdit() {
    const { candidate, elections, breadcrumbs, flash } = usePage<AdminCandidateEditProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        _method: 'POST', // Keep as POST for multipart handling in Laravel
        election_id: candidate.election_id.toString(),
        name: candidate.name,
        phone: candidate.phone || '',
        description: candidate.description || '',
        photo: null as File | null,
        remove_photo: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Since we are uploading files, we use POST with _method spoofing if needed, 
        // but the controller expects POST for candidates update as per route definition.
        post(route('admin_candidates_update', candidate.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modify ${candidate.name}`} />

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
                    
                    {/* Left Side: Context & Preview */}
                    <div className="lg:col-span-2 space-y-8">
                        <Link 
                            href={route('admin_candidates_index')}
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group text-xs font-black uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Registry
                        </Link>

                        <div className="space-y-6">
                            <div className="relative group/photo inline-block">
                                {candidate.photo && !data.remove_photo ? (
                                    <img src={candidate.photo} className="w-40 h-40 rounded-[2.5rem] object-cover ring-8 ring-white/5 shadow-2xl group-hover/photo:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-40 h-40 rounded-[2.5rem] bg-slate-800 flex items-center justify-center text-5xl font-black text-slate-700 ring-8 ring-white/5">
                                        <User className="w-16 h-16" />
                                    </div>
                                )}
                                {candidate.photo && !data.remove_photo && (
                                    <button 
                                        type="button"
                                        onClick={() => setData('remove_photo', true)}
                                        className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl opacity-0 group-hover/photo:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            
                            <div className="space-y-2">
                                <h1 className="text-3xl font-black text-white tracking-tighter leading-none">Modify Profile</h1>
                                <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest">{candidate.name}</p>
                            </div>
                            
                            <p className="text-slate-500 font-medium leading-relaxed text-sm">
                                Re-configure candidate parameters. All modifications are logged in the system audit trail.
                            </p>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                            <div className="flex items-center gap-3 text-indigo-400">
                                <ShieldCheck className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Profile Integrity</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Modification of core identity data is restricted during active mission status.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 md:p-14 space-y-10 backdrop-blur-3xl shadow-2xl shadow-black/50">
                            <div className="space-y-8">
                                {/* Election Select */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Assigned Election Node</label>
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
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Identity Signature</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-700"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <p className="text-red-400 text-[10px] font-bold uppercase ml-2">{errors.name}</p>}
                                </div>

                                {/* Grid: Phone & Photo */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Communication Link</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-700 font-mono"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Update Visual ID</label>
                                        <label className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 px-6 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all group/file">
                                            <span className="text-slate-500 group-hover:text-slate-300 transition-colors truncate max-w-[120px]">
                                                {data.photo ? data.photo.name : 'New JPEG/PNG'}
                                            </span>
                                            <Camera className="w-5 h-5 text-indigo-400" />
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                onChange={(e) => {
                                                    setData('photo', e.target.files?.[0] || null);
                                                    setData('remove_photo', false);
                                                }}
                                                accept="image/*"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Profile Intel</label>
                                    <textarea 
                                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-700 min-h-[120px] resize-none"
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
                                {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Commit Changes <Sparkles className="w-5 h-5" /></>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
