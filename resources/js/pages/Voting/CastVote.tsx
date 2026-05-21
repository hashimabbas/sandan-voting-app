// resources/js/Pages/Voting/CastVote.tsx
"use client";

import { Head, useForm, usePage, router } from "@inertiajs/react";
import React, { useState } from "react";
import { route } from 'ziggy-js';
import { 
    ShieldCheck, 
    CheckCircle2, 
    Scale, 
    ArrowRight,
    Loader2,
    Building2,
    Info,
    LogOut,
    Languages,
    User,
    ClipboardList,
    AlertCircle,
    Gavel,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { cn } from "@/lib/utils";
import AppLogo from "@/components/app-logo";

interface Candidate {
    id: number;
    name: string;
    photo: string | null;
}

interface Voter {
    id: number;
    name: string;
    number_of_units: number;
    units: {
        unit_name: string;
        building_name: string;
    }[]
}

interface Election {
    id: number;
    title: string;
}

interface CastVoteProps {
    voter: Voter;
    election: Election;
    candidates: Candidate[];
}

const translations = {
    ar: {
        welcome: "مرحباً بك،",
        secureSession: "جلسة تصويت آمنة",
        activeSession: "جلسة نشطة",
        votingPower: "قوة التصويت",
        votes: "أصوات",
        properties: "العقارات المملوكة",
        distributeVotes: "قم بتوزيع أصواتك",
        remaining: "المتبقي:",
        confirmVote: "تأكيد وإرسال التصويت",
        endSession: "إنهاء الجلسة",
        instructions: "تعليمات التصويت",
        requirements: "متطلبات التصويت",
        terms: "شروط التصويت",
        howToVote: "طريقة التصويت",
        instructionDetails: "يرجى توزيع أصواتك على المرشحين المفضلين لديك. يمكنك تخصيص كل أصواتك لمرشح واحد أو توزيعها على عدة مرشحين.",
        requirementDetails: "يجب أن تكون صاحب العقار المسجل لإتمام عملية التصويت. يتم التحقق من هويتك عبر النظام.",
        termsDetails: "بإرسالك للتصويت، فإنك تقر بصحة البيانات وتوافق على شروط العملية الانتخابية.",
        howToVoteDetails: "استخدم زري (+) و (-) بجانب اسم كل مرشح لتحديد عدد الأصوات التي ترغب في منحها له.",
        warningTitle: "تنبيه",
        warningMessage: "لقد قمت بتوزيع {allocated} أصوات فقط من أصل {total}. هل تريد الاستمرار وتجاهل الأصوات المتبقية؟",
        noVotesError: "يرجى توزيع صوت واحد على الأقل للمتابعة.",
        candidate: "المرشح",
        units: "وحدات",
        back: "رجوع",
        selectLanguage: "اختر اللغة",
        english: "English",
        arabic: "العربية"
    },
    en: {
        welcome: "Welcome,",
        secureSession: "Secure Ballot Entry",
        activeSession: "Active Session",
        votingPower: "Voting Power",
        votes: "Votes",
        properties: "Your Properties",
        distributeVotes: "Distribute Your Votes",
        remaining: "Remaining:",
        confirmVote: "Confirm & Cast Vote",
        endSession: "End Session",
        instructions: "Voting Instructions",
        requirements: "Voting Requirements",
        terms: "Terms & Conditions",
        howToVote: "How to Vote",
        instructionDetails: "Please distribute your votes among your preferred candidates. You can allocate all your votes to one candidate or spread them across multiple candidates.",
        requirementDetails: "You must be the registered property owner to complete the voting process. Your identity is verified through the system.",
        termsDetails: "By casting your vote, you acknowledge the accuracy of the data and agree to the election terms.",
        howToVoteDetails: "Use the (+) and (-) buttons next to each candidate's name to set the number of votes you wish to allocate.",
        warningTitle: "Warning",
        warningMessage: "You have only distributed {allocated} votes out of {total}. Do you want to continue and ignore the remaining votes?",
        noVotesError: "Please distribute at least one vote to continue.",
        candidate: "Candidate",
        units: "Units",
        back: "Back",
        selectLanguage: "Select Language",
        english: "English",
        arabic: "العربية"
    }
};

export default function CastVote() {
    const { voter, election, candidates } = usePage<CastVoteProps>().props;
    const [allocations, setAllocations] = useState<Record<number, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lang, setLang] = useState<'ar' | 'en'>('ar');
    const [showInstructions, setShowInstructions] = useState(false);

    const t = translations[lang];

    const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0);
    const remainingVotes = voter.number_of_units - totalAllocated;

    const updateAllocation = (candidateId: number, delta: number) => {
        const current = allocations[candidateId] || 0;
        const next = current + delta;
        
        if (next < 0) return;
        if (delta > 0 && remainingVotes <= 0) return;
        
        setAllocations({
            ...allocations,
            [candidateId]: next
        });
    };

    const handleVote = () => {
        if (totalAllocated === 0) {
            alert(t.noVotesError);
            return;
        }
        if (totalAllocated < voter.number_of_units) {
            const msg = t.warningMessage
                .replace('{allocated}', totalAllocated.toString())
                .replace('{total}', voter.number_of_units.toString());
            if (!confirm(msg)) {
                return;
            }
        }
        
        const voteData = Object.entries(allocations)
            .filter(([_, count]) => count > 0)
            .map(([id, count]) => ({
                candidate_id: parseInt(id),
                count: count
            }));

        setIsSubmitting(true);
        router.post(route('vote_cast_vote'), { votes: voteData }, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleLogout = () => {
        router.post(route('vote_logout'));
    };

    return (
        <div className={cn(
            "min-h-screen bg-[#f8fafc] text-slate-600 font-sans pb-40 transition-all duration-500",
            lang === 'ar' ? "text-right" : "text-left"
        )} dir={lang === 'ar' ? "rtl" : "ltr"}>
            <Head title={`${t.votingPower}: ${election.title}`} />

            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-50/50 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-6 space-y-8">
                
                {/* Modern Header */}
                <nav className="flex justify-between items-center bg-white/80 backdrop-blur-md border border-slate-200/50 p-4 rounded-3xl shadow-sm">
                    <div className="flex items-center gap-4">
                        <AppLogo size="sm" />
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{t.activeSession}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button 
                            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all border border-slate-200 text-sm font-bold"
                        >
                            <Languages className="w-4 h-4" />
                            <span className="hidden sm:inline">{lang === 'ar' ? 'English' : 'العربية'}</span>
                        </button>
                        
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 transition-all border border-red-100 text-sm font-bold"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">{t.endSession}</span>
                        </button>
                    </div>
                </nav>

                {/* Personalized Welcome Section */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-emerald-500/5 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative p-8 md:p-12 rounded-[3rem] bg-white border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none select-none">
                            <User className="w-64 h-64 text-indigo-600" />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-[11px] font-black uppercase tracking-[0.2em]">
                                    <ShieldCheck className="w-4 h-4" /> {t.secureSession}
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                    <span className="text-slate-400 font-medium block text-xl md:text-2xl mb-1">{t.welcome}</span>
                                    {voter.name}
                                </h1>
                                <p className="text-lg font-semibold text-slate-500 max-w-xl">
                                    {election.title}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-50/50 p-2 rounded-[2rem] border border-slate-100">
                                <div className="flex items-center gap-4 px-6 py-4 bg-white rounded-[1.5rem] shadow-sm border border-slate-200/50">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                        <Scale className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col min-w-[120px]">
                                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">{t.votingPower}</span>
                                        <span className="text-xl font-black text-slate-900">{voter.number_of_units} {t.votes}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 px-6 py-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">{t.properties}</span>
                                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                                            {voter.units.slice(0, 2).map((u, i) => (
                                                <span key={i} className="text-xs font-bold text-slate-700">
                                                    {u.unit_name}{i < Math.min(voter.units.length, 2) - 1 ? ',' : ''}
                                                </span>
                                            ))}
                                            {voter.units.length > 2 && (
                                                <span className="text-[10px] font-black text-indigo-500">+{voter.units.length - 2}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions Section - Static & Highly Visible */}
                <div className="space-y-4">
                    <div className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 text-indigo-900">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <Info className="w-5 h-5 text-indigo-600" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">{t.instructions}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { icon: Gavel, title: t.howToVote, details: t.howToVoteDetails, color: "indigo" },
                            { icon: ClipboardList, title: t.instructions, details: t.instructionDetails, color: "indigo" },
                            { icon: AlertCircle, title: t.requirements, details: t.requirementDetails, color: "emerald" },
                            { icon: ShieldCheck, title: t.terms, details: t.termsDetails, color: "slate" },
                        ].map((item, i) => (
                            <div key={i} className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
                                    item.color === 'indigo' ? "bg-indigo-50 text-indigo-600" : 
                                    item.color === 'emerald' ? "bg-emerald-50 text-emerald-600" : 
                                    "bg-slate-50 text-slate-600"
                                )}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                    {item.details}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Candidates Section */}
                <div className="space-y-8 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{t.distributeVotes}</h2>
                            <p className="text-slate-400 font-medium">{election.title}</p>
                        </div>
                        <div className="flex items-center gap-3 self-start sm:self-center">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.remaining}</span>
                                <div className={cn(
                                    "flex items-center gap-2 px-5 py-2 rounded-2xl font-black text-lg transition-all shadow-sm",
                                    remainingVotes > 0 
                                        ? "bg-amber-100 text-amber-600 border border-amber-200" 
                                        : "bg-emerald-500 text-white shadow-emerald-200 shadow-lg"
                                )}>
                                    {remainingVotes} {t.votes}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {candidates.map((candidate) => {
                            const count = allocations[candidate.id] || 0;
                            const isSelected = count > 0;
                            
                            return (
                                <div
                                    key={candidate.id}
                                    className={cn(
                                        "group relative p-1 rounded-[3.5rem] transition-all duration-500",
                                        isSelected 
                                            ? "bg-gradient-to-br from-indigo-500 to-emerald-500 shadow-2xl shadow-indigo-200 scale-[1.02]" 
                                            : "bg-transparent"
                                    )}
                                >
                                    <div className="bg-white p-8 rounded-[3.4rem] h-full flex flex-col items-center text-center space-y-6">
                                        <div className="relative">
                                            <div className={cn(
                                                "w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 transition-all duration-500",
                                                isSelected ? "border-indigo-100 shadow-xl" : "border-slate-50"
                                            )}>
                                                {candidate.photo ? (
                                                    <img src={candidate.photo} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-4xl font-black text-slate-200 uppercase">
                                                        {candidate.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                                    <CheckCircle2 className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-2 flex-grow">
                                            <h3 className={cn(
                                                "text-2xl font-black tracking-tight",
                                                isSelected ? "text-indigo-600" : "text-slate-900"
                                            )}>
                                                {candidate.name}
                                            </h3>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.candidate}</p>
                                        </div>
                                        
                                        {/* Counter Controls */}
                                        <div className="flex items-center justify-between w-full bg-slate-50 p-2 rounded-[2rem] border border-slate-100">
                                            <button 
                                                type="button"
                                                onClick={() => updateAllocation(candidate.id, -1)}
                                                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white hover:bg-slate-100 active:scale-95 text-slate-900 flex items-center justify-center text-2xl font-black transition-all shadow-sm border border-slate-200/50 disabled:opacity-30"
                                                disabled={count <= 0}
                                            >
                                                -
                                            </button>
                                            
                                            <div className="flex flex-col items-center flex-1 mx-2">
                                                <input 
                                                    type="number"
                                                    value={count === 0 ? '' : count}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        const currentOtherAllocations = totalAllocated - (allocations[candidate.id] || 0);
                                                        const maxAllowed = voter.number_of_units - currentOtherAllocations;
                                                        
                                                        let nextVal = Math.max(0, val);
                                                        if (nextVal > maxAllowed) nextVal = maxAllowed;
                                                        
                                                        setAllocations({
                                                            ...allocations,
                                                            [candidate.id]: nextVal
                                                        });
                                                    }}
                                                    placeholder="0"
                                                    className="w-full bg-transparent border-none text-center text-2xl font-black text-slate-900 focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.votes}</span>
                                            </div>
                                            
                                            <button 
                                                type="button"
                                                onClick={() => updateAllocation(candidate.id, 1)}
                                                disabled={remainingVotes <= 0}
                                                className={cn(
                                                    "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl font-black transition-all shadow-lg active:scale-95 disabled:opacity-30",
                                                    isSelected 
                                                        ? "bg-indigo-600 text-white shadow-indigo-200" 
                                                        : "bg-white text-slate-900 border border-slate-200/50 shadow-sm"
                                                )}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-0 inset-x-0 p-6 z-50">
                <div className="max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-xl p-4 md:p-6 rounded-[2.5rem] shadow-2xl shadow-slate-900/40 border border-white/10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6 divide-x divide-slate-800 rtl:divide-x-reverse">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.votingPower}</span>
                                <span className="text-white font-black text-xl">{voter.number_of_units}</span>
                            </div>
                            <div className="flex flex-col px-6">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.remaining}</span>
                                <span className={cn(
                                    "font-black text-xl transition-colors",
                                    remainingVotes > 0 ? "text-amber-400" : "text-emerald-400"
                                )}>
                                    {remainingVotes}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleVote}
                            disabled={isSubmitting || totalAllocated === 0}
                            className={cn(
                                "w-full md:w-auto flex items-center justify-center gap-4 px-12 py-5 rounded-3xl transition-all font-black text-lg shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
                                totalAllocated > 0 
                                    ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20" 
                                    : "bg-slate-800 text-slate-500"
                            )}
                        >
                            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <>{t.confirmVote} <ArrowRight className={cn("w-6 h-6 transition-transform", lang === 'ar' ? "rotate-180" : "")} /></>}
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;300;400;500;700;900&family=Cairo:wght@100;300;400;500;700;900&display=swap');
                
                :root {
                    --font-outfit: 'Outfit', sans-serif;
                    --font-cairo: 'Cairo', sans-serif;
                }

                .font-sans {
                    font-family: ${lang === 'ar' ? 'var(--font-cairo)' : 'var(--font-outfit)'};
                }

                @keyframes pulse-soft {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .animate-pulse-soft {
                    animation: pulse-soft 3s infinite ease-in-out;
                }

                /* Custom scrollbar */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: #f1f5f9;
                }
                ::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}} />
        </div>
    );
}
