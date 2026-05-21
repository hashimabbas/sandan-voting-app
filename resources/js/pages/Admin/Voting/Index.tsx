import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    CalendarCheck, 
    Users, 
    UserRoundCheck, 
    ArrowRight, 
    ShieldAlert, 
    Activity, 
    Database, 
    ChevronRight,
    BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
    label: string;
    url: string;
}

interface VotingIndexProps {
    breadcrumbs: BreadcrumbItem[];
    stats: {
        activeElections: number;
        totalVoters: number;
        totalCandidates: number;
        pendingUnits: number;
    };
}

export default function VotingIndex() {
    const props = usePage().props as any;
    
    // Safety check and mapping props from controller
    const stats = {
        activeElections: props.stats?.activeElections ?? (props.votingStatus === 'active' ? 1 : 0),
        totalVoters: props.stats?.totalVoters ?? props.totalVoters ?? 0,
        totalCandidates: props.stats?.totalCandidates ?? props.totalCandidates ?? 0,
        pendingUnits: props.stats?.pendingUnits ?? props.untransferredCount ?? 0,
    };

    const breadcrumbs = props.breadcrumbs ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Voting Management" />

            <div className="min-h-screen bg-slate-50 text-slate-600 p-8 space-y-12 selection:bg-indigo-500/10 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

                <header className="space-y-4 relative z-10">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black uppercase tracking-[0.3em]">
                        <Activity className="w-4 h-4" /> Operations Center
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">Voting Systems Control</h1>
                    <p className="text-slate-400 font-medium italic max-w-2xl">Complete management of voter registries, candidates, and administrative proxy sessions.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                    <StatBox label="Active Elections" value={stats.activeElections} icon={<CalendarCheck className="text-indigo-500" />} color="indigo" />
                    <StatBox label="Total Voters" value={stats.totalVoters} icon={<Users className="text-emerald-500" />} color="emerald" />
                    <StatBox label="Total Candidates" value={stats.totalCandidates} icon={<UserRoundCheck className="text-amber-500" />} color="amber" />
                    <StatBox label="Pending Units" value={stats.pendingUnits} icon={<ShieldAlert className="text-rose-500" />} color="rose" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                    {/* Main Navigation Grid */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <NavCard 
                            title="Voter Registry" 
                            desc="Manage property owners, their unit assignments and voting eligibility status." 
                            href={route('admin_voters_index')} 
                            icon={<Users className="w-8 h-8" />}
                            color="emerald"
                        />
                        <NavCard 
                            title="Candidate Database" 
                            desc="Maintain and update professional profiles of individuals running for election." 
                            href={route('admin_candidates_index')} 
                            icon={<UserRoundCheck className="w-8 h-8" />}
                            color="amber"
                        />
                        <NavCard 
                            title="Proxy Override Terminal" 
                            desc="Cast administrative votes for untransferred units or administrative properties." 
                            href={route('admin_voting_untransferred')} 
                            icon={<ShieldAlert className="w-8 h-8" />}
                            color="rose"
                        />
                        <NavCard 
                            title="Results & Analytics" 
                            desc="Monitor live participation rates and election outcome distributions." 
                            href={route('admin_elections_index')} 
                            icon={<BarChart3 className="w-8 h-8" />}
                            color="indigo"
                        />
                    </div>

                    {/* Quick Info Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="p-10 rounded-[3rem] bg-slate-900 text-white shadow-2xl space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                <Database className="w-32 h-32 text-indigo-400 -rotate-12" />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <h3 className="text-2xl font-black tracking-tight">Data Integrity</h3>
                                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                                    All ballots are cryptographically sealed upon submission. Modified or tampered votes are automatically flagged by the core engine.
                                </p>
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                            {i}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Security Nodes: Online</span>
                            </div>
                        </div>

                        <div className="p-8 rounded-[3rem] bg-white border border-slate-200 shadow-sm flex items-center justify-between group cursor-pointer hover:border-indigo-200 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-sm">Recent Audit Log</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">View System Activity</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function StatBox({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
    return (
        <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className="flex flex-col gap-6">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm", `bg-${color}-50`)}>
                    {icon}
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
                </div>
            </div>
        </div>
    );
}

function NavCard({ title, desc, href, icon, color }: { title: string; desc: string; href: string; icon: React.ReactNode; color: string }) {
    return (
        <Link href={href} className="group relative p-10 rounded-[3.5rem] bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 overflow-hidden">
            <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm", `bg-${color}-50 text-${color}-600`)}>
                    {icon}
                </div>
                <div className="space-y-3">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">{title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">{desc}</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 group-hover:text-indigo-600 transition-colors">
                    Manage Module <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                </div>
            </div>
        </Link>
    );
}
