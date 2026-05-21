// resources/js/Pages/Admin/Elections/LiveResults.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { 
    Activity, 
    TrendingUp, 
    Users, 
    Timer, 
    ShieldCheck, 
    BarChart3,
    Trophy,
    Target,
    Zap
} from 'lucide-react';
import AppLogo from '@/components/app-logo';

interface Election {
    id: number;
    title: string;
    status: 'pending' | 'active' | 'completed' | 'archived';
    start_time: string | null;
    end_time: string | null;
}

interface CandidateResult {
    id: number;
    name: string;
    photo: string | null;
    votes_count: number;
}

interface AdminElectionLiveVotingResultsProps {
    election: Election;
    results: CandidateResult[];
    totalPossibleVotes: number;
    totalVotesCast: number;
}

export default function AdminElectionLiveVotingResults() {
    const { election: initialElection, results: initialResults, totalPossibleVotes: initialTotalPossibleVotes, totalVotesCast: initialTotalVotesCast } = usePage<AdminElectionLiveVotingResultsProps>().props;

    const [election, setElection] = useState<Election>(initialElection);
    const [results, setResults] = useState<CandidateResult[]>(initialResults || []);
    const [totalPossibleVotes, setTotalPossibleVotes] = useState<number>(initialTotalPossibleVotes || 0);
    const [totalVotesCast, setTotalVotesCast] = useState<number>(initialTotalVotesCast || 0);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [animatePulse, setAnimatePulse] = useState(false);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const fetchData = async () => {
            try {
                const response = await axios.get(route('api_elections_results', election.id));
                const data = response.data;
                const sortedResults = (data.results || []).sort((a: CandidateResult, b: CandidateResult) => b.votes_count - a.votes_count);

                setResults(sortedResults);
                setTotalPossibleVotes(Number(data.totalPossibleVotes || 0));
                setTotalVotesCast(Number(data.totalVotesCast || 0));
                setLastUpdated(new Date().toLocaleTimeString());
                
                setAnimatePulse(true);
                setTimeout(() => setAnimatePulse(false), 1000);
            } catch (error) {
                console.error("Error fetching live data:", error);
            }
        };

        fetchData();
        if (election.status === 'active') {
            intervalId = setInterval(fetchData, 3000);
        }
        return () => clearInterval(intervalId);
    }, [election.status, election.id]);

    const calculatePercentage = (votes: number) => {
        if (totalVotesCast === 0) return 0;
        return (votes / totalVotesCast) * 100;
    };

    const maxVotes = results.length > 0 ? Math.max(...results.map(r => r.votes_count)) : 0;

    return (
        <div className="min-h-screen bg-white text-slate-600 flex flex-col selection:bg-indigo-500/10 overflow-hidden font-sans">
            <Head title={`LIVE MONITORING | ${election.title}`} />

            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-emerald-500/5 blur-[180px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] bg-indigo-500/5 blur-[180px] rounded-full" />
            </div>

            {/* Top Bar */}
            <header className="relative z-10 flex items-center justify-between px-12 py-8 border-b border-slate-100 bg-white/80 backdrop-blur-3xl shadow-sm">
                <div className="flex items-center gap-8">
                    <AppLogo size="md" />
                    <div className="h-10 w-[1px] bg-slate-100" />
                    <div>
                        <div className="flex items-center gap-4 mb-1">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{election.title}</h1>
                            <div className="px-4 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live Broadcast
                            </div>
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Strategic General Assembly Resolution Tracking</p>
                    </div>
                </div>

                <div className="flex items-center gap-12">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Freshness</p>
                        <p className={cn("text-2xl font-black tabular-nums transition-colors duration-500", animatePulse ? "text-emerald-600" : "text-slate-900")}>
                            {lastUpdated || 'SYNCING...'}
                        </p>
                    </div>
                    <div className="w-px h-12 bg-slate-100" />
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                            <Timer className="w-5 h-5 text-indigo-600" />
                            <span className="text-xl font-black text-slate-900 tabular-nums">00:00:00</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 flex-grow grid grid-cols-12 gap-0">
                {/* Left Side: Stats & Rankings */}
                <div className="col-span-12 lg:col-span-8 p-12 space-y-12 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-3 gap-8">
                        <LargeStatCard 
                            label="Participation Rate" 
                            value={`${((totalVotesCast / (totalPossibleVotes || 1)) * 100).toFixed(1)}%`}
                            icon={TrendingUp}
                            color="text-emerald-600"
                            bg="bg-emerald-50"
                        />
                        <LargeStatCard 
                            label="Verified Ballots" 
                            value={totalVotesCast.toLocaleString()}
                            icon={ShieldCheck}
                            color="text-indigo-600"
                            bg="bg-indigo-50"
                        />
                        <LargeStatCard 
                            label="Total Capacity" 
                            value={totalPossibleVotes.toLocaleString()}
                            icon={Users}
                            color="text-slate-600"
                            bg="bg-slate-50"
                        />
                    </div>

                    <div className="space-y-6">
                        {results.map((candidate, idx) => (
                            <div key={candidate.id} className="relative group">
                                <div className="absolute inset-0 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm transition-all group-hover:shadow-xl group-hover:border-indigo-100" />
                                <div className="relative p-8 flex items-center gap-8">
                                    {/* Rank */}
                                    <div className="w-16 text-center">
                                        <span className="text-4xl font-black text-slate-200 italic group-hover:text-indigo-100 transition-colors">#{idx + 1}</span>
                                    </div>

                                    {/* Candidate Photo */}
                                    <div className="relative">
                                        {candidate.photo ? (
                                            <img src={candidate.photo} className="w-24 h-24 rounded-[1.5rem] object-cover border-4 border-white shadow-lg" />
                                        ) : (
                                            <div className="w-24 h-24 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl font-black text-slate-200">
                                                {candidate.name.charAt(0)}
                                            </div>
                                        )}
                                        {idx === 0 && (
                                            <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                                                <Trophy className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Name & Bar */}
                                    <div className="flex-grow space-y-4">
                                        <div className="flex items-end justify-between">
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{candidate.name}</h3>
                                            <div className="text-right">
                                                <div className="text-4xl font-black text-slate-900 tabular-nums leading-none">{candidate.votes_count}</div>
                                                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">{calculatePercentage(candidate.votes_count).toFixed(1)}% Weight</div>
                                            </div>
                                        </div>
                                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                                style={{ 
                                                    width: `${results.length > 0 ? (candidate.votes_count / maxVotes) * 100 : 0}%`,
                                                    background: idx === 0 ? 'linear-gradient(90deg, #059669, #10b981)' : 'linear-gradient(90deg, #4338ca, #6366f1)'
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Visualizers & Audit */}
                <div className="col-span-12 lg:col-span-4 bg-slate-50/50 border-l border-slate-100 p-12 space-y-12 overflow-y-auto custom-scrollbar">
                    <div className="space-y-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <Zap className="w-5 h-5 text-amber-500" />
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Live Pulse Meter</h3>
                        </div>
                        <div className="aspect-square rounded-[3.5rem] bg-white border border-slate-100 flex items-center justify-center relative overflow-hidden shadow-xl shadow-slate-200/50">
                            {/* Circular Visualizer */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className={cn("w-[70%] h-[70%] rounded-full border-4 border-emerald-500/10 animate-ping", animatePulse && "animate-none scale-110 opacity-100")} />
                                <div className="w-[50%] h-[50%] rounded-full border-4 border-indigo-500/10 animate-ping" style={{ animationDelay: '0.5s' }} />
                            </div>
                            <div className="text-center relative z-10">
                                <span className="block text-8xl font-black text-slate-900 tracking-tighter tabular-nums leading-none mb-2">{totalVotesCast}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Signals Received</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Target className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Registry Status</h3>
                        </div>
                        <div className="p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Remaining Quota</span>
                                    <span>{totalPossibleVotes - totalVotesCast}</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-indigo-600 transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                                        style={{ width: `${100 - (calculatePercentage(totalVotesCast))}%` }}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
                                The current gap reflects registered property owners who have not yet participated in the resolution.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
}

function LargeStatCard({ label, value, icon: Icon, color, bg }: { label: string; value: string | number; icon: any; color: string; bg: string }) {
    return (
        <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", bg)}>
                    <Icon className={cn("w-5 h-5", color)} />
                </div>
            </div>
            <div className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{value}</div>
        </div>
    );
}
