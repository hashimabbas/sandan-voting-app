// resources/js/Pages/Voting/VoterResults.tsx
"use client";

import { Head, useForm, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import { route } from 'ziggy-js';
import AppLogo from "@/components/app-logo";
import { 
    CheckCircle, 
    BarChart3, 
    LogOut, 
    ShieldCheck, 
    Layers,
    Info,
    Trophy,
    Star,
    Crown,
    Sparkles,
    Languages
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface Voter {
    id: number;
    name: string;
}

interface Election {
    id: number;
    title: string;
    show_results: boolean;
    status: 'pending' | 'active' | 'completed' | 'archived';
}

interface VoteDetail {
    candidate_id: number;
    candidate_name: string;
    candidate_photo: string | null;
    count: number;
}

interface OverallResult {
    candidate_id: number;
    candidate_name: string;
    candidate_photo: string | null;
    votes: number;
    percentage: number;
}

interface VoterResultsProps {
    voter: Voter;
    election: Election;
    myVotes: VoteDetail[];
    showResults: boolean;
    overallResults: OverallResult[] | null;
    flash: {
        success?: string;
    };
}

const translations = {
    ar: {
        officialWinner: "تم إعلان الفائز الرسمي:",
        votingReceipt: "إيصال التصويت:",
        voteCastSuccess: "تم تسجيل تصويتك بنجاح!",
        voiceHeard: "تم سماع صوتك. جاري التوجيه للنتائج...",
        electionConcluded: "انتهت الانتخابات",
        winnerAnnounced: "تم إعلان الفائز الرسمي",
        electedWith: "تم انتخابه بنسبة",
        totalWeight: "إجمالي الوزن",
        electionCycle: "دورة الانتخابات",
        secureBallot: "تم توثيق الاقتراع بنجاح",
        thankYou: "شكراً لك،",
        yourChoices: "تم تشفير اختياراتك لـ",
        securelyStored: "وحفظها بنجاح في السجل الآمن.",
        closeSession: "إنهاء الجلسة",
        yourSelections: "اختياراتك",
        verifiedCandidate: "مرشح معتمد",
        weight: "الوزن",
        privacyNotice: "لضمان الخصوصية، هذا العرض لمرة واحدة. يرجى إنهاء الجلسة بعد التحقق من اختياراتك.",
        finalDistribution: "التوزيع النهائي للأصوات",
        publicTrends: "الاتجاهات العامة",
        finalAudit: "التدقيق النهائي",
        liveFeed: "بث مباشر",
        awaitingRelease: "في انتظار النشر",
        embargoActive: "حظر النشر نشط",
        collectiveHidden: "يتم إخفاء النتائج الجماعية حتى انتهاء الانتخابات أو قيام المسؤول بتفعيل الرؤية العامة.",
        closePortal: "إغلاق البوابة",
        ofTotalWeight: "من إجمالي الوزن."
    },
    en: {
        officialWinner: "Official Winner Announced:",
        votingReceipt: "Voting Receipt:",
        voteCastSuccess: "Vote Cast Successfully!",
        voiceHeard: "Your voice has been heard. Redirecting to results...",
        electionConcluded: "Election Concluded",
        winnerAnnounced: "OFFICIAL WINNER ANNOUNCED",
        electedWith: "Has been elected with",
        totalWeight: "Total Weight",
        electionCycle: "Election Cycle",
        secureBallot: "Secure Ballot Finalized",
        thankYou: "Thank You,",
        yourChoices: "Your choices for",
        securelyStored: "have been successfully encrypted and stored in the secure registry.",
        closeSession: "Close Session",
        yourSelections: "Your Selections",
        verifiedCandidate: "Verified Candidate",
        weight: "Weight",
        privacyNotice: "To ensure privacy, this is a one-time view. Please exit the session after verifying your selections.",
        finalDistribution: "Final Vote Distribution",
        publicTrends: "Public Trends",
        finalAudit: "Final Audit",
        liveFeed: "Live Feed",
        awaitingRelease: "Awaiting Release",
        embargoActive: "Embargo Active",
        collectiveHidden: "Collective results are hidden until the election concludes or the administrator enables public visibility.",
        closePortal: "Close Portal",
        ofTotalWeight: "of the total weight."
    }
};

export default function VoterResults() {
    const { voter, election, myVotes, showResults, overallResults, flash } = usePage<VoterResultsProps>().props;
    const { post } = useForm();
    const [lang, setLang] = useState<'ar' | 'en'>('ar');
    const [celebrate, setCelebrate] = useState(false);
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
    const [confetti, setConfetti] = useState<any[]>([]);

    const t = translations[lang];
    const isRtl = lang === 'ar';
    const isCompleted = election.status === 'completed';
    const winner = (isCompleted && overallResults && overallResults.length > 0) ? overallResults[0] : null;

    useEffect(() => {
        if (isCompleted || flash?.success) {
            setCelebrate(true);
            if (flash?.success) {
                setShowSuccessOverlay(true);
                setTimeout(() => setShowSuccessOverlay(false), 4000);
            }
            const newConfetti = Array.from({ length: 60 }).map((_, i) => ({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * 5,
                duration: 3 + Math.random() * 4,
                size: 5 + Math.random() * 10,
                color: ['#fbbf24', '#f59e0b', '#10b981', '#6366f1', '#f472b6'][Math.floor(Math.random() * 5)]
            }));
            setConfetti(newConfetti);
        }
    }, [isCompleted, flash?.success]);

    const handleLogout = () => {
        post(route('vote_logout'));
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-600 font-sans selection:bg-indigo-500/10 pb-40 relative overflow-x-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
            <Head title={isCompleted ? `${t.officialWinner} ${election.title}` : `${t.votingReceipt} ${election.title}`} />
            
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
            </div>

            {celebrate && (
                <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
                    {confetti.map((c) => (
                        <div 
                            key={c.id} 
                            className="absolute top-[-20px] animate-celebrate-fall"
                            style={{ 
                                left: `${c.left}%`, 
                                animationDelay: `${c.delay}s`,
                                animationDuration: `${c.duration}s`,
                                width: `${c.size}px`,
                                height: `${c.size}px`,
                                backgroundColor: c.color,
                                borderRadius: Math.random() > 0.5 ? '50%' : '0%'
                            }} 
                        />
                    ))}
                </div>
            )}

            {showSuccessOverlay && (
                <div className="fixed inset-0 z-[110] bg-white flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                        <CheckCircle className="w-32 h-32 text-emerald-500 relative z-10 animate-bounce-subtle" />
                    </div>
                    <div className="mt-12 text-center space-y-4 relative z-10 px-6">
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">
                            {t.voteCastSuccess}
                        </h2>
                        <p className="text-xl text-slate-400 font-medium tracking-tight">
                            {t.voiceHeard}
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 pt-16 space-y-12">
                <div className="flex justify-between items-center">
                    <AppLogo size="md" />
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm font-bold text-xs"
                        >
                            <Languages className="w-4 h-4" />
                            {lang === 'ar' ? 'English' : 'العربية'}
                        </button>
                        {isCompleted && (
                            <div className="hidden md:flex items-center gap-3 px-6 py-3 rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/20 animate-bounce-subtle">
                                <Trophy className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.electionConcluded}</span>
                            </div>
                        )}
                    </div>
                </div>

                {isCompleted && winner && (
                    <section className="relative group p-1 md:p-2 rounded-[4rem] bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 shadow-2xl shadow-amber-500/30 animate-in zoom-in duration-1000">
                        <div className="bg-white rounded-[3.8rem] p-8 md:p-20 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                                <Trophy className="w-96 h-96 text-amber-600 -rotate-12" />
                            </div>
                            <div className="absolute bottom-0 left-0 p-12 opacity-[0.03] pointer-events-none">
                                <Crown className="w-64 h-64 text-amber-600 rotate-12" />
                            </div>

                            <div className="flex flex-col items-center text-center space-y-8 relative z-10">
                                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-xs font-black uppercase tracking-[0.4em] animate-pulse">
                                    <Star className="w-4 h-4 fill-amber-500" /> {t.winnerAnnounced} <Star className="w-4 h-4 fill-amber-500" />
                                </div>
                                
                                <div className="relative">
                                    <div className="w-48 h-48 md:w-64 md:h-64 rounded-[3rem] overflow-hidden border-8 border-amber-50 shadow-2xl relative z-10 mx-auto transform transition-transform group-hover:scale-105 duration-700">
                                        {winner.candidate_photo ? (
                                            <img src={winner.candidate_photo} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-amber-50 flex items-center justify-center text-6xl font-black text-amber-200">
                                                {winner.candidate_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl z-20 border-4 border-amber-100">
                                        <Trophy className="w-12 h-12 text-amber-500" />
                                    </div>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full flex justify-center">
                                        <Sparkles className="w-20 h-20 text-amber-400 animate-pulse" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                                        {winner.candidate_name}
                                    </h2>
                                    <p className="text-xl md:text-2xl text-slate-400 font-medium italic">
                                        {t.electedWith} <span className="text-amber-600 font-black">{winner.percentage}%</span> {t.ofTotalWeight}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-8 w-full max-w-lg pt-10">
                                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                                        <span className="block text-3xl font-black text-slate-900 leading-none mb-2">{winner.votes}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.totalWeight}</span>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                                        <span className="block text-3xl font-black text-slate-900 leading-none mb-2">{election.title.split(' ')[0]}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.electionCycle}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {!isCompleted && (
                    <header className="relative p-8 md:p-16 rounded-[3rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                            <CheckCircle className="w-64 h-64 text-emerald-600 -rotate-12" />
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-[0.3em]">
                                    <ShieldCheck className="w-4 h-4" /> {t.secureBallot}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                                    {t.thankYou} <span className="text-emerald-600">{voter.name.split(' ')[0]}</span>
                                </h1>
                                <p className="text-lg text-slate-500 max-w-2xl leading-relaxed font-medium">
                                    {t.yourChoices} <span className="text-slate-900 font-black">{election.title}</span> {t.securelyStored}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={handleLogout}
                                    className="group flex items-center gap-4 px-8 py-5 rounded-3xl bg-slate-900 hover:bg-slate-800 transition-all text-white shadow-xl shadow-slate-900/10"
                                >
                                    {isRtl ? <span className="font-black uppercase tracking-widest text-xs">{t.closeSession}</span> : <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />}
                                    {isRtl ? <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform rotate-180" /> : <span className="font-black uppercase tracking-widest text-xs">{t.closeSession}</span>}
                                </button>
                            </div>
                        </div>
                    </header>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-5 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <Layers className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.yourSelections}</h2>
                        </div>

                        <div className="space-y-3">
                            {myVotes.map((vote) => (
                                <div key={vote.candidate_id} className="group relative p-6 rounded-3xl bg-white border border-slate-100 hover:border-emerald-200 transition-all duration-300 shadow-sm hover:shadow-md">
                                    <div className="flex items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            {vote.candidate_photo ? (
                                                <img src={vote.candidate_photo} className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-xl font-black text-slate-300">
                                                    {vote.candidate_name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">{vote.candidate_name}</h3>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{t.verifiedCandidate}</p>
                                            </div>
                                        </div>
                                        <div className={cn("text-center", isRtl ? "text-left" : "text-right")}>
                                            <div className="text-3xl font-black text-slate-900 tabular-nums">{vote.count}</div>
                                            <div className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{t.weight}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-start gap-4">
                            <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-indigo-700/70 leading-relaxed font-medium">
                                {t.privacyNotice}
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-7 space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                    {isCompleted ? t.finalDistribution : t.publicTrends}
                                </h2>
                            </div>
                            {isCompleted ? (
                                <div className="px-4 py-2 rounded-full bg-slate-900 text-white">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t.finalAudit}</span>
                                </div>
                            ) : (
                                showResults ? (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 border border-emerald-200">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{t.liveFeed}</span>
                                    </div>
                                ) : (
                                    <div className="px-4 py-2 rounded-full bg-slate-100 border border-slate-200">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.awaitingRelease}</span>
                                    </div>
                                )
                            )}
                        </div>

                        { (showResults || isCompleted) && overallResults ? (
                            <div className="p-6 md:p-12 rounded-[3rem] bg-white border border-slate-200 shadow-lg space-y-10">
                                {overallResults.map((result, idx) => (
                                    <div key={result.candidate_id} className="space-y-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <span className="text-slate-300 font-black text-lg italic w-6">{idx + 1}.</span>
                                                <h3 className="text-lg font-bold text-slate-900">{result.candidate_name}</h3>
                                            </div>
                                            <div className="flex items-center gap-4 text-right">
                                                <span className="text-slate-400 font-bold text-xs">{result.votes}</span>
                                                <span className={cn(
                                                    "font-black text-xl",
                                                    idx === 0 && isCompleted ? "text-amber-600" : "text-emerald-600"
                                                )}>{result.percentage}%</span>
                                            </div>
                                        </div>
                                        <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={cn(
                                                    "absolute top-0 h-full rounded-full transition-all duration-1000 ease-out",
                                                    isRtl ? "right-0" : "left-0",
                                                    idx === 0 && isCompleted 
                                                        ? "bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]" 
                                                        : "bg-gradient-to-r from-emerald-500 to-teal-400"
                                                )}
                                                style={{ width: `${result.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 md:p-20 rounded-[3rem] bg-white border border-slate-100 border-dashed flex flex-col items-center justify-center text-center gap-6">
                                <ShieldCheck className="w-12 h-12 text-slate-200" />
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">{t.embargoActive}</h3>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium leading-relaxed">
                                        {t.collectiveHidden}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isCompleted && (
                <div className={cn("fixed bottom-12 z-50", isRtl ? "left-12" : "right-12")}>
                    <button 
                        onClick={handleLogout}
                        className="p-6 rounded-full bg-slate-900 text-white shadow-2xl hover:scale-110 transition-transform flex items-center gap-3 font-black text-xs uppercase tracking-widest"
                    >
                        {isRtl ? <span className="font-black uppercase tracking-widest text-xs">{t.closePortal}</span> : <LogOut className="w-6 h-6" />}
                        {isRtl ? <LogOut className="w-6 h-6 rotate-180" /> : <span className="font-black uppercase tracking-widest text-xs">{t.closePortal}</span>}
                    </button>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes celebrate-fall {
                    0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
                }
                .animate-celebrate-fall {
                    animation-name: celebrate-fall;
                    animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    animation-iteration-count: infinite;
                }
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 3s infinite ease-in-out;
                }
            `}} />
        </div>
    );
}
