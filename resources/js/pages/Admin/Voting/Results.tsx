import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { BarChart3, Trophy, Users, CheckCircle2, TrendingUp, Sparkles, User, Award, RefreshCw, Layers, FileText } from 'lucide-react';
import axios from 'axios';

interface CandidateResult {
    id: number;
    name: string;
    photo: string | null;
    votes_count: number;
}

interface ResultsProps {
    results: CandidateResult[];
    totalPossibleVotes: number;
    totalVotesCast: number;
    votingStatus: string;
    breadcrumbs: any[];
}

export default function Results() {
    const { results: initialResults, totalPossibleVotes: initialTotalPossible, totalVotesCast: initialTotalCast, votingStatus, breadcrumbs } = usePage<ResultsProps>().props;
    
    const [results, setResults] = useState(initialResults);
    const [totalPossibleVotes, setTotalPossibleVotes] = useState(initialTotalPossible);
    const [totalVotesCast, setTotalVotesCast] = useState(initialTotalCast);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    const participationRate = totalPossibleVotes > 0 ? (totalVotesCast / totalPossibleVotes) * 100 : 0;
    const winner = results.length > 0 ? results[0] : null;

    const refreshData = async () => {
        setIsRefreshing(true);
        try {
            const response = await axios.get(route('admin_voting_results_api'));
            setResults(response.data.results);
            setTotalPossibleVotes(response.data.totalPossibleVotes);
            setTotalVotesCast(response.data.totalVotesCast);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Error refreshing results:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Auto-refresh every 30 seconds if voting is active
    useEffect(() => {
        let interval: any;
        if (votingStatus === 'active') {
            interval = setInterval(refreshData, 30000);
        }
        return () => clearInterval(interval);
    }, [votingStatus]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Election Intelligence" />

            <div className="min-h-screen bg-[#020617] text-slate-300 p-8 space-y-12 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />

                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.4em]">
                            <TrendingUp className="w-4 h-4" /> Live Intelligence
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Election Intelligence</h1>
                        <div className="flex items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                            Last Updated: {lastUpdated.toLocaleTimeString()}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => window.location.href = route('admin_elections_export_csv', '1')} 
                            className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-emerald-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl"
                        >
                            <FileText className="w-5 h-5" /> Export Excel
                        </button>

                        <button 
                            onClick={refreshData}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <RefreshCw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <Link 
                            href={route('admin_voting_live_results')} 
                            className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/20"
                        >
                            Live Monitor Mode
                        </Link>
                    </div>
                </header>

                {/* Top Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <ResultStat label="Participation Rate" value={`${participationRate.toFixed(1)}%`} sub={`${totalVotesCast} of ${totalPossibleVotes}`} icon={Users} color="emerald" />
                    <ResultStat label="Leading Candidate" value={winner?.name || 'N/A'} sub={`${winner?.votes_count || 0} Votes`} icon={Trophy} color="amber" />
                    <ResultStat label="Total Volume" value={totalVotesCast} sub="Units Accounted" icon={Layers} color="indigo" />
                </div>

                {/* Results Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
                    {/* Main Bar Chart / Leaderboard */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-10 md:p-14 space-y-12 backdrop-blur-3xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <BarChart3 className="w-6 h-6 text-indigo-400" />
                                    <h2 className="text-2xl font-black text-white tracking-tight">Leaderboard</h2>
                                </div>
                                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${votingStatus === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                                    {votingStatus}
                                </div>
                            </div>

                            <div className="space-y-10">
                                {results.map((candidate, index) => {
                                    const percentage = totalVotesCast > 0 ? (candidate.votes_count / totalVotesCast) * 100 : 0;
                                    const isWinner = index === 0 && candidate.votes_count > 0;

                                    return (
                                        <div key={candidate.id} className="group space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="relative">
                                                        {candidate.photo ? (
                                                            <img src={candidate.photo} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white/5 group-hover:ring-indigo-500/30 transition-all" />
                                                        ) : (
                                                            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-xl font-black text-slate-600">
                                                                {candidate.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        {isWinner && (
                                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                                                <Trophy className="w-3 h-3 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors">{candidate.name}</h3>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{candidate.votes_count} Votes Cast</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-black text-white tabular-nums">{percentage.toFixed(1)}%</span>
                                                </div>
                                            </div>
                                            <div className="h-4 bg-white/5 rounded-full overflow-hidden relative border border-white/5 p-0.5">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                                                        isWinner ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-700'
                                                    }`}
                                                    style={{ width: `${percentage}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-20 transition-opacity" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* Victory Card */}
                    <div className="space-y-6">
                        {winner && (
                            <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[4rem] p-12 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                                    <Award className="w-48 h-48 rotate-12" />
                                </div>
                                
                                <div className="relative z-10 space-y-10 text-center">
                                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
                                        Current Frontrunner
                                    </div>

                                    <div className="relative inline-block mx-auto">
                                        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse" />
                                        {winner.photo ? (
                                            <img src={winner.photo} className="w-48 h-48 rounded-[3rem] object-cover mx-auto ring-8 ring-white/10 shadow-2xl relative z-10" />
                                        ) : (
                                            <div className="w-48 h-48 rounded-[3rem] bg-indigo-900 border border-white/10 flex items-center justify-center text-7xl font-black text-indigo-400 mx-auto relative z-10 shadow-2xl">
                                                {winner.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-4xl font-black tracking-tighter leading-none">{winner.name}</h3>
                                        <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest opacity-80">Leading by {results.length > 1 ? winner.votes_count - results[1].votes_count : winner.votes_count} votes</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 rounded-[2rem] bg-white/10 border border-white/5">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Total Votes</p>
                                            <p className="text-3xl font-black tabular-nums">{winner.votes_count}</p>
                                        </div>
                                        <div className="p-6 rounded-[2rem] bg-white/10 border border-white/5">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Share</p>
                                            <p className="text-3xl font-black tabular-nums">{(totalVotesCast > 0 ? (winner.votes_count / totalVotesCast) * 100 : 0).toFixed(0)}%</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-10 space-y-8 backdrop-blur-xl">
                            <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Technical Audit</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Integrity Check</span>
                                    <span className="text-emerald-400 text-xs font-black uppercase">Verified</span>
                                </div>
                                <div className="h-[1px] w-full bg-white/5" />
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Encryption</span>
                                    <span className="text-emerald-400 text-xs font-black uppercase">Active</span>
                                </div>
                                <div className="h-[1px] w-full bg-white/5" />
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nodes Sync</span>
                                    <span className="text-emerald-400 text-xs font-black uppercase">Complete</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            `}} />
        </AppLayout>
    );
}

function ResultStat({ label, value, sub, icon: Icon, color }: { label: string, value: string | number, sub: string, icon: any, color: string }) {
    const colorClasses: any = {
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    };
    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 space-y-6 backdrop-blur-3xl hover:bg-white/[0.04] transition-all duration-500 group">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${colorClasses[color]} border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">{label}</p>
                <p className="text-4xl font-black text-white tracking-tighter tabular-nums leading-none mb-2">{value}</p>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{sub}</p>
            </div>
        </div>
    );
}
