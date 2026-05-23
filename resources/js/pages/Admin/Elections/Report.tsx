import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { Trophy, Users, CheckCircle, Calendar, ShieldCheck, Printer, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Election {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    status: string;
}

interface Result {
    id: number;
    name: string;
    votes_count: number;
}

interface VoteEntry {
    candidate_name: string;
    unit_name: string;
    count: number;
}

interface VoterLog {
    name: string;
    phone: string;
    weight: number;
    votes: VoteEntry[];
}

interface ReportProps {
    election: Election;
    results: Result[];
    totalPossibleVotes: number;
    totalVotesCast: number;
    voters: VoterLog[];
    generated_at: string;
}

export default function Report() {
    const { election, results, totalPossibleVotes, totalVotesCast, voters, generated_at } = usePage<ReportProps>().props;

    const participationRate = totalPossibleVotes > 0 ? ((totalVotesCast / totalPossibleVotes) * 100).toFixed(2) : "0";
    const winner = results.length > 0 ? results[0] : null;

    useEffect(() => {
        // Auto trigger print dialog
        setTimeout(() => {
            // window.print();
        }, 1000);
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900 p-8 md:p-16 max-w-[1000px] mx-auto print:p-0 print:m-0 print:max-w-none font-sans">
            <Head title={`Official Report: ${election.title}`} />

            {/* Print Button (Hidden on Print) */}
            <div className="fixed top-8 right-8 print:hidden z-50 flex gap-4">
                <button 
                    onClick={() => window.location.href = route('admin_elections_export_csv', election.id)}
                    className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-slate-50 shadow-2xl"
                >
                    <FileText className="w-5 h-5 text-emerald-600" /> Export Excel
                </button>
                <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-2xl"
                >
                    <Printer className="w-5 h-5" /> Print / Save as PDF
                </button>
            </div>

            {/* Report Header */}
            <header className="border-b-4 border-slate-900 pb-12 mb-12 flex justify-between items-start">
                <div className="space-y-6">
                    <AppLogo size="lg" />
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter uppercase">Official Election Report</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Certified Result Certificate</p>
                    </div>
                </div>
                <div className="text-right space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black uppercase">
                        Ref: EL-{election.id}-{new Date().getFullYear()}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generated: {generated_at}</p>
                </div>
            </header>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-8 mb-16">
                <div className="space-y-8">
                    <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Election Metadata</h3>
                        <div className="space-y-2">
                            <p className="text-2xl font-black text-slate-900">{election.title}</p>
                            <p className="text-sm text-slate-500 italic">{election.description}</p>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-4">
                                <Calendar className="w-4 h-4" />
                                {new Date(election.start_time).toLocaleDateString()} - {new Date(election.end_time).toLocaleDateString()}
                            </div>
                        </div>
                    </section>

                    <section className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-6">
                        <div className="flex items-center gap-3 text-amber-600">
                            <Trophy className="w-6 h-6" />
                            <h3 className="font-black text-xs uppercase tracking-widest">Certified Winner</h3>
                        </div>
                        {winner && (
                            <div className="space-y-2">
                                <p className="text-3xl font-black text-slate-900">{winner.name}</p>
                                <p className="text-sm font-bold text-slate-500">
                                    Total Weight: <span className="text-slate-900">{winner.votes_count}</span>
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Participation Analytics</h3>
                    <StatRow label="Total Registered Weight" value={totalPossibleVotes} />
                    <StatRow label="Total Votes Cast" value={totalVotesCast} />
                    <StatRow label="Participation Rate" value={`${participationRate}%`} highlight />
                    <StatRow label="Election Status" value={election.status.toUpperCase()} />
                </div>
            </div>

            {/* Candidates Table */}
            <section className="mb-16">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Candidate Results Distribution</h3>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-900 text-left">
                            <th className="py-4 font-black text-[10px] uppercase tracking-widest">Candidate Name</th>
                            <th className="py-4 font-black text-[10px] uppercase tracking-widest text-right">Total Votes (Weight)</th>
                            <th className="py-4 font-black text-[10px] uppercase tracking-widest text-right">Percentage Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((r, idx) => (
                            <tr key={r.id} className={cn("border-b border-slate-100", idx === 0 && "bg-slate-50/50")}>
                                <td className="py-4 font-bold text-slate-900">{r.name}</td>
                                <td className="py-4 font-bold text-slate-900 text-right">{r.votes_count}</td>
                                <td className="py-4 font-black text-slate-900 text-right">
                                    {totalVotesCast > 0 ? ((r.votes_count / totalVotesCast) * 100).toFixed(2) : 0}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Voter Log (Page Break) */}
            <section className="page-break-before">
                <div className="flex items-center justify-between mb-8 border-b-2 border-slate-100 pb-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Verified Participation Log</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{voters.length} Verified Submissions</span>
                </div>
                <table className="w-full border-collapse text-[10px]">
                    <thead>
                        <tr className="bg-slate-50 text-left">
                            <th className="p-3 font-black uppercase tracking-widest">Voter Name</th>
                            <th className="p-3 font-black uppercase tracking-widest">Contact</th>
                            <th className="p-3 font-black uppercase tracking-widest">Weight</th>
                            <th className="p-3 font-black uppercase tracking-widest">Allocation Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {voters.map((v, i) => (
                            <tr key={i} className="border-b border-slate-50">
                                <td className="p-3 font-bold">{v.name}</td>
                                <td className="p-3 text-slate-500">{v.phone}</td>
                                <td className="p-3 font-bold">{v.weight}</td>
                                <td className="p-3">
                                    <div className="flex flex-wrap gap-2">
                                        {v.votes.map((vt, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                                                {vt.count > 1 ? (
                                                    <>
                                                        <span className="font-black text-slate-400">{vt.unit_name ? 'Multiple Units' : 'N/A'}</span>
                                                        <span className="font-black text-amber-600">×{vt.count}</span>
                                                    </>
                                                ) : (
                                                    <span className="font-black text-slate-400">#{vt.unit_name}</span>
                                                )}
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span className="font-bold text-slate-900">{vt.candidate_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Footer / Certification */}
            <footer className="mt-32 pt-12 border-t-2 border-slate-100 flex justify-between items-end">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 text-emerald-600">
                        <ShieldCheck className="w-8 h-8" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest">System Integrity Verified</p>
                            <p className="text-xs font-bold text-slate-400">Cryptographically Sealed Result</p>
                        </div>
                    </div>
                </div>
                <div className="text-right space-y-12">
                    <div className="space-y-2">
                        <div className="w-48 h-[1px] bg-slate-900 ml-auto" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Authorized Signature</p>
                    </div>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .page-break-before { page-break-before: always; }
                    body { -webkit-print-color-adjust: exact; }
                }
                .page-break-before { margin-top: 4rem; }
            `}} />
        </div>
    );
}

function StatRow({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
    return (
        <div className={cn(
            "flex justify-between items-center p-4 rounded-2xl border transition-all",
            highlight ? "bg-indigo-600 border-indigo-600 text-white shadow-xl" : "bg-white border-slate-100 text-slate-900"
        )}>
            <span className={cn("text-[10px] font-black uppercase tracking-widest", highlight ? "text-indigo-100" : "text-slate-400")}>{label}</span>
            <span className="text-xl font-black tracking-tight">{value}</span>
        </div>
    );
}
