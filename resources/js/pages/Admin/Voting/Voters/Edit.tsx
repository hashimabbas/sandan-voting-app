import React from 'react';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { type BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Loader2, ArrowLeft, User, Building, Phone, CreditCard, Activity, Sparkles, ShieldCheck, Save, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ElectionShort {
    id: number;
    title: string;
}

interface Voter {
    id: number;
    election_id: number;
    voter_id_no: string;
    name: string;
    phone: string;
    number_of_units: number;
    has_voted: boolean;
    created_at: string;
}

interface AdminVoterEditProps {
    voter: Voter;
    elections: ElectionShort[];
    breadcrumbs: BreadcrumbItem[];
}

export default function AdminVoterEdit() {
    const { voter, elections, breadcrumbs } = usePage<AdminVoterEditProps>().props;
    const { data, setData, put, processing, errors } = useForm({
        election_id: voter.election_id.toString(),
        voter_id_no: voter.voter_id_no,
        name: voter.name,
        phone: voter.phone,
        number_of_units: voter.number_of_units.toString(),
        has_voted: voter.has_voted,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin_voters_update', voter.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modify Node: ${voter.name}`} />

            <div className="min-h-screen bg-[#020617] text-slate-300 p-8 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

                <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                    {/* Left Side: Context */}
                    <div className="lg:col-span-2 space-y-8">
                        <Link 
                            href={route('admin_voters_index', { election_id: data.election_id })}
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors group text-xs font-black uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Registry
                        </Link>

                        <div className="space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Modify Node</h1>
                                <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest leading-none">Ownership Certificate #{voter.id}</p>
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Update the legal identity and unit weight distribution for this shareholder. All changes are immutable once committed to the active assembly node.
                            </p>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                            <div className="flex items-center gap-3 text-emerald-400">
                                <ShieldCheck className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Ownership Verified</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                This node is currently associated with <b>{voter.number_of_units}</b> units in the Sandan Property System.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 md:p-14 space-y-8 backdrop-blur-3xl shadow-2xl shadow-black/50">
                            <div className="space-y-6">
                                {/* Assembly Selection */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2 flex items-center gap-2">
                                        <Globe className="w-3 h-3" /> Target Assembly Node
                                    </label>
                                    <Select onValueChange={(v) => setData('election_id', v)} value={data.election_id}>
                                        <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-2xl h-16 px-6 text-white focus:ring-2 focus:ring-indigo-500/20 transition-all">
                                            <SelectValue placeholder="Assign Assembly" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                                            {elections.map(e => (
                                                <SelectItem key={e.id} value={e.id.toString()}>{e.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Identity Data */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2 flex items-center gap-2">
                                            <User className="w-3 h-3" /> Shareholder Name
                                        </label>
                                        <input 
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2 flex items-center gap-2">
                                            <CreditCard className="w-3 h-3" /> Identity No (Civil ID)
                                        </label>
                                        <input 
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            value={data.voter_id_no}
                                            onChange={(e) => setData('voter_id_no', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Contact & Weight */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2 flex items-center gap-2">
                                            <Phone className="w-3 h-3" /> Registry Phone
                                        </label>
                                        <input 
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2 flex items-center gap-2">
                                            <Building className="w-3 h-3 text-emerald-400" /> Unit Weight Count
                                        </label>
                                        <input 
                                            type="number"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 px-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            value={data.number_of_units}
                                            onChange={(e) => setData('number_of_units', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Participation Status */}
                                <div className="pt-4">
                                    <label className="flex items-center gap-4 cursor-pointer group bg-white/5 border border-white/10 p-6 rounded-2xl transition-all hover:bg-white/10">
                                        <Checkbox 
                                            id="has_voted" 
                                            checked={data.has_voted} 
                                            onCheckedChange={(v) => setData('has_voted', v as boolean)}
                                            className="w-6 h-6 border-white/10 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-white uppercase tracking-widest group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                                                Participation Override <Activity className="w-3 h-3" />
                                            </span>
                                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Manually toggle vote submission state</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Link 
                                    href={route('admin_voters_index', { election_id: data.election_id })}
                                    className="flex-1 h-16 rounded-2xl border border-white/10 flex items-center justify-center text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-all"
                                >
                                    Abort
                                </Link>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="flex-[2] h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/20"
                                >
                                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Commit Node Config <Save className="w-4 h-4" /></>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
