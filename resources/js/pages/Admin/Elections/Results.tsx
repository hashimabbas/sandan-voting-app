import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import OmaniEmblem from '@/components/omani-emblem';
import {
    Trophy,
    Users,
    Building2,
    CheckCircle,
    Eye,
    EyeOff,
    ExternalLink,
    Download,
    FileText,
    Printer,
    LayoutDashboard,
    FileSpreadsheet,
    Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
    label: string;
    url: string;
}

interface Election {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'active' | 'completed' | 'archived';
    start_time: string | null;
    end_time: string | null;
    show_results: boolean;
}

interface CandidateResult {
    id: number;
    name: string;
    photo: string | null;
    votes_count: number;
}

interface VoteEntry {
    candidate_name: string;
    unit_name: string;
    count: number;
}

interface VoterLogEntry {
    name: string;
    phone: string;
    weight: number;
    votes: VoteEntry[];
}

interface AdminElectionResultsProps {
    election: Election;
    results: CandidateResult[];
    totalPossibleVotes: number;
    totalVotesCast: number;
    transferredWeight: number;
    untransferredCount: number;
    voters: VoterLogEntry[];
    generated_at: string;
    breadcrumbs: BreadcrumbItem[];
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
}

function toHijri(date: Date): string {
    try {
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    } catch {
        return '';
    }
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ar-OM', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

export default function Results() {
    const { election, results, totalPossibleVotes, totalVotesCast, transferredWeight, untransferredCount, voters, generated_at, breadcrumbs, flash } =
        usePage<AdminElectionResultsProps>().props;
    const [showDashboard, setShowDashboard] = useState(false);

    const participationRate = totalPossibleVotes > 0 ? ((totalVotesCast / totalPossibleVotes) * 100).toFixed(2) : "0";
    const isCompleted = election.status === 'completed';
    const winner = results.length > 0 ? results[0] : null;
    const now = new Date();
    const docRef = `م.ع/${election.id}/${now.getFullYear()}`;

    const toggleResultsVisibility = () => {
        router.post(route('admin_elections_toggle_results', election.id));
    };

    if (showDashboard) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={`Analysis: ${election.title}`} />
                <div className="min-h-screen bg-slate-50 text-slate-600 p-8 space-y-10 font-sans" dir="ltr">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{election.title}</h1>
                            <p className="text-slate-400 font-medium">Election Results Dashboard</p>
                        </div>
                        <button
                            onClick={() => setShowDashboard(false)}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                        >
                            <FileSpreadsheet className="w-4 h-4" /> عرض التقرير الرسمي
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Official Winner</p>
                            <p className="text-2xl font-black text-slate-900">{winner?.name || 'N/A'}</p>
                            <p className="text-sm text-slate-500">{winner?.votes_count || 0} votes</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Votes Cast</p>
                            <p className="text-2xl font-black text-slate-900">{totalVotesCast.toLocaleString()}</p>
                            <p className="text-sm text-slate-500">{participationRate}% turnout</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Eligibility</p>
                            <p className="text-2xl font-black text-slate-900">{totalPossibleVotes.toLocaleString()}</p>
                            <p className="text-sm text-slate-500">Registered weight</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Election Status</p>
                            <p className="text-2xl font-black text-slate-900">{election.status.toUpperCase()}</p>
                            <p className="text-sm text-slate-500">Current stage</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-6">Results Breakdown</h3>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="py-3 font-bold text-sm text-slate-500">#</th>
                                    <th className="py-3 font-bold text-sm text-slate-500">Candidate</th>
                                    <th className="py-3 font-bold text-sm text-slate-500 text-right">Votes</th>
                                    <th className="py-3 font-bold text-sm text-slate-500 text-right">Share</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r, i) => (
                                    <tr key={r.id} className="border-b border-slate-50">
                                        <td className="py-3 font-bold text-slate-300">{i + 1}</td>
                                        <td className="py-3 font-bold text-slate-900">{r.name}</td>
                                        <td className="py-3 font-bold text-slate-900 text-right">{r.votes_count}</td>
                                        <td className="py-3 font-bold text-slate-900 text-right">
                                            {totalVotesCast > 0 ? ((r.votes_count / totalVotesCast) * 100).toFixed(2) : 0}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Official Report: ${election.title}`} />

            {/* Admin Action Bar - Screen Only */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 print:hidden z-50 flex items-center gap-3 px-6 py-4 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl">
                <button
                    onClick={() => setShowDashboard(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>

                <div className="w-px h-6 bg-slate-200" />

                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                    <Printer className="w-4 h-4" /> Print / PDF
                </button>

                <button
                    onClick={() => window.open(route('admin_elections_report', election.id), '_blank')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all"
                >
                    <Download className="w-4 h-4" /> Detailed Report
                </button>

                <button
                    onClick={() => window.location.href = route('admin_elections_export_csv', election.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all"
                >
                    <FileText className="w-4 h-4" /> CSV
                </button>

                <div className="w-px h-6 bg-slate-200" />

                <button
                    onClick={toggleResultsVisibility}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                        election.show_results
                            ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                    )}
                >
                    {election.show_results ? <><Eye className="w-4 h-4" /> Public</> : <><EyeOff className="w-4 h-4" /> Hidden</>}
                </button>

                <Link
                    href={route('admin_elections_live_results', election.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-all"
                >
                    <ExternalLink className="w-4 h-4" /> Live
                </Link>
            </div>

            {/* ===== GOVERNMENT DOCUMENT ===== */}
            <div className="min-h-screen bg-white print:min-h-0" dir="rtl">
                <div className="max-w-[210mm] mx-auto px-8 py-12 md:py-16 print:max-w-none print:w-full print:px-0 print:py-0">

                    {/* --- Document Header --- */}
                    <div className="border-b-2 border-slate-900 pb-8 mb-10 print:border-b print:border-slate-900">
                        <div className="flex items-center justify-between">
                            {/* Right: Association Name */}
                            <div className="flex items-center gap-4">
                                <OmaniEmblem size="lg" />
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">جمعية ملاك مدينة سندان الصناعية</h1>
                                    <p className="text-sm text-slate-600 font-medium mt-0.5">Sandan Industrial City Owners Association</p>
                                    <p className="text-xs text-slate-400 mt-0.5">– تقرير نتائج التصويت الإلكتروني –</p>
                                </div>
                            </div>
                            {/* Left: Reference + Date */}
                            <div className="text-left">
                                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-left">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Ref</p>
                                    <p className="text-sm font-bold text-slate-900">{docRef}</p>
                                </div>
                                <div className="mt-2 text-left">
                                    <p className="text-xs text-slate-600">{formatDate(now)} م</p>
                                    <p className="text-xs text-slate-500">{toHijri(now)} هـ</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Document Title --- */}
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">محضر فرز الأصوات وإعلان النتائج</h2>
                        <div className="w-32 h-1 bg-slate-900 mx-auto mt-3" />
                        <p className="text-sm text-slate-500 mt-3">Vote Counting Minutes & Results Declaration</p>
                    </div>

                    {/* --- Election Metadata --- */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-10">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr>
                                    <td className="py-1.5 pl-4 text-slate-500 font-medium w-40">عنوان الانتخابات</td>
                                    <td className="py-1.5 font-bold text-slate-900">{election.title}</td>
                                </tr>
                                {election.description && (
                                    <tr>
                                        <td className="py-1.5 pl-4 text-slate-500 font-medium w-40">الوصف</td>
                                        <td className="py-1.5 text-slate-700">{election.description}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="py-1.5 pl-4 text-slate-500 font-medium w-40">تاريخ البدء</td>
                                    <td className="py-1.5 font-bold text-slate-900">
                                        {election.start_time ? formatDate(new Date(election.start_time)) : '—'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 pl-4 text-slate-500 font-medium w-40">تاريخ الانتهاء</td>
                                    <td className="py-1.5 font-bold text-slate-900">
                                        {election.end_time ? formatDate(new Date(election.end_time)) : '—'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-1.5 pl-4 text-slate-500 font-medium w-40">حالة الانتخابات</td>
                                    <td className="py-1.5">
                                        <span className={cn(
                                            "inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                            election.status === 'completed' && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                                            election.status === 'active' && "bg-blue-50 text-blue-700 border border-blue-200",
                                            election.status === 'pending' && "bg-amber-50 text-amber-700 border border-amber-200",
                                            election.status === 'archived' && "bg-slate-100 text-slate-600 border border-slate-200"
                                        )}>
                                            {election.status === 'completed' && 'مكتملة'}
                                            {election.status === 'active' && 'نشطة'}
                                            {election.status === 'pending' && 'معلقة'}
                                            {election.status === 'archived' && 'مؤرشفة'}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* --- Purpose of Voting --- */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-8 bg-slate-900 rounded-full" />
                            <h3 className="text-xl font-black text-slate-900">الهدف من التصويت</h3>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            تم إجراء عملية التصويت الإلكتروني الخاصة بـ <strong>{election.title}</strong> لغرض انتخاب أعضاء مجلس الإدارة / اعتماد القرارات المدرجة بجدول أعمال الجمعية العمومية.
                        </p>
                    </div>

                    {/* --- System Description --- */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-8 bg-slate-900 rounded-full" />
                            <h3 className="text-xl font-black text-slate-900">نظام التصويت الإلكتروني</h3>
                        </div>
                        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                            <p>
                                <strong>آلية التحقق</strong><br />
                                اعتمد النظام على آلية تحقق متعددة العوامل، بحيث يشترط إدخال عاملين تحقق على الأقل من البيانات المعتمدة مسبقًا للمالك (رقم الوحدة، الرقم المدني، رقم الهاتف).
                            </p>
                            <p>
                                <strong>أهلية التصويت</strong><br />
                                اقتصر التصويت على الوحدات المحولة ملكيتها (Transferred Ownership) وفق السجلات المعتمدة.
                            </p>
                            <p>
                                <strong>منع التكرار</strong><br />
                                لا يسمح النظام بتجاوز الوزن التصويتي المخصص لكل مالك أو التصويت المتكرر لنفس الحصة العقارية.
                            </p>
                            <p>
                                <strong>التحكم الزمني</strong><br />
                                تم تفعيل التصويت خلال فترة زمنية محددة مسبقًا، ويمنع النظام الإدلاء بالأصوات خارج المدة المعتمدة.
                            </p>
                            <p>
                                <strong>السجلات</strong><br />
                                يحتفظ النظام بسجلات إلكترونية كاملة لعمليات التصويت تشمل وقت الإدلاء بالصوت، بيانات الوحدة، والعملية الانتخابية المرتبطة.
                            </p>
                        </div>
                    </div>

                    {/* --- Voting Methodology --- */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-8 bg-slate-900 rounded-full" />
                            <h3 className="text-xl font-black text-slate-900">منهجية احتساب الأصوات</h3>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                            تم احتساب القوة التصويتية لكل مالك وفق عدد الوحدات العقارية المسجلة باسمه والمعتمدة ضمن سجل الناخبين، بحيث يمثل كل حق ملكية صوتًا مستقلاً. يُحتسب الوزن التصويتي بناءً على إجمالي عدد الوحدات المملوكة لكل ناخب، ولا يُسمح بتجاوز هذا الوزن.
                        </p>
                    </div>

                    {/* --- Official Statistics --- */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-8 bg-slate-900 rounded-full" />
                            <h3 className="text-xl font-black text-slate-900">الإحصائيات الرسمية</h3>
                        </div>

                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="py-3 px-4 font-bold text-right">البيان</th>
                                    <th className="py-3 px-4 font-bold text-center">العدد</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-100">
                                    <td className="py-3 px-4 text-slate-700">إجمالي الوزن التصويتي</td>
                                    <td className="py-3 px-4 text-center font-bold text-slate-900">{totalPossibleVotes.toLocaleString()}</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="py-3 px-4 pr-10 text-slate-500 text-xs">— الوحدات المنقولة (أصوات المالكين)</td>
                                    <td className="py-3 px-4 text-center font-bold text-slate-700">{transferredWeight.toLocaleString()}</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="py-3 px-4 pr-10 text-slate-500 text-xs">— الوحدات غير المحولة (تصويت إداري)</td>
                                    <td className="py-3 px-4 text-center font-bold text-slate-700">{untransferredCount.toLocaleString()}</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="py-3 px-4 text-slate-700">إجمالي الأصوات المصوتة</td>
                                    <td className="py-3 px-4 text-center font-bold text-slate-900">{totalVotesCast.toLocaleString()}</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="py-3 px-4 text-slate-700">عدد المشاركين</td>
                                    <td className="py-3 px-4 text-center font-bold text-slate-900">{voters.length.toLocaleString()}</td>
                                </tr>
                                <tr className="bg-emerald-50">
                                    <td className="py-3 px-4 font-bold text-emerald-700">نسبة المشاركة</td>
                                    <td className="py-3 px-4 text-center font-bold text-emerald-700">{participationRate}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* --- Final Results Section --- */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1 h-8 bg-slate-900 rounded-full" />
                            <h3 className="text-xl font-black text-slate-900">النتائج النهائية</h3>
                        </div>

                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="py-3 px-4 font-bold text-center w-12">#</th>
                                    <th className="py-3 px-4 font-bold text-right">المرشح</th>
                                    <th className="py-3 px-4 font-bold text-center">عدد الأصوات</th>
                                    <th className="py-3 px-4 font-bold text-center">النسبة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r, i) => {
                                    const pct = totalVotesCast > 0 ? ((r.votes_count / totalVotesCast) * 100) : 0;
                                    const isWinner = i === 0;
                                    return (
                                        <tr
                                            key={r.id}
                                            className={cn(
                                                "border-b border-slate-100 transition-colors",
                                                isWinner && "bg-amber-50/50"
                                            )}
                                        >
                                            <td className="py-3 px-4 text-center font-bold text-slate-400">{i + 1}</td>
                                            <td className={cn(
                                                "py-3 px-4 font-bold",
                                                isWinner ? "text-amber-700" : "text-slate-900"
                                            )}>
                                                {isWinner && <Crown className="w-4 h-4 inline ml-1.5 text-amber-500" />}
                                                {r.name}
                                            </td>
                                            <td className="py-3 px-4 text-center font-bold text-slate-900">{r.votes_count.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-center font-bold text-slate-900">{pct.toFixed(2)}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                            وبناءً على النتائج النهائية المعتمدة، فقد فاز المرشحون الأعلى حصولًا على الأصوات وفق النظام الأساسي للجمعية.
                        </p>
                    </div>

                    {/* --- Winner Declaration --- */}
                    {winner && (
                        <div className="border-2 border-amber-400 bg-amber-50/30 rounded-xl p-6 mb-10 text-center">
                            <Crown className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 mb-1">يعلن فوز</p>
                            <h4 className="text-3xl font-black text-slate-900 mb-2">{winner.name}</h4>
                            <p className="text-slate-600">
                                بإجمالي <span className="font-bold text-slate-900">{winner.votes_count.toLocaleString()}</span> صوت
                                {totalVotesCast > 0 && (
                                    <> بنسبة <span className="font-bold text-slate-900">
                                        {((winner.votes_count / totalVotesCast) * 100).toFixed(2)}%
                                    </span></>
                                )}
                            </p>
                        </div>
                    )}

                    {/* --- System Integrity Report --- */}
                    <div className="page-break-before mb-10 pt-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-8 bg-slate-900 rounded-full" />
                            <h3 className="text-xl font-black text-slate-900">تقرير سلامة النظام</h3>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
                            <p className="text-sm text-emerald-800 leading-relaxed">
                                تم إجراء مراجعة لسجلات النظام الإلكتروني بعد انتهاء التصويت، وتبين ما يلي:
                            </p>
                            <ul className="mt-3 space-y-2 text-sm text-emerald-700">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>عدم تسجيل حالات تصويت مكرر.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>الالتزام بالأوزان التصويتية المحددة لكل مالك.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>منع التصويت خارج الفترة الزمنية المحددة.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>حفظ سجل إلكتروني كامل لجميع العمليات.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>تطابق إجمالي الأصوات مع الوزن التصويتي المحتسب.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* --- Voter Participation Log (Appendix) --- */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1 h-8 bg-slate-900 rounded-full" />
                            <h3 className="text-xl font-black text-slate-900">ملحق تدقيقي: سجل المشاركة</h3>
                            <span className="mr-auto text-xs text-slate-400 font-medium">
                                إجمالي المشاركين: {voters.length}
                            </span>
                        </div>

                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="py-2.5 px-3 font-bold text-slate-600 text-right">#</th>
                                    <th className="py-2.5 px-3 font-bold text-slate-600 text-right">المالك</th>
                                    <th className="py-2.5 px-3 font-bold text-slate-600 text-right">رقم التواصل</th>
                                    <th className="py-2.5 px-3 font-bold text-slate-600 text-center">عدد الأصوات</th>
                                    <th className="py-2.5 px-3 font-bold text-slate-600 text-right">الوحدة ← المرشح</th>
                                </tr>
                            </thead>
                            <tbody>
                                {voters.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-400">
                                            لا توجد مشاركات مسجلة
                                        </td>
                                    </tr>
                                )}
                                {voters.map((v, i) => (
                                    <tr key={i} className="border-b border-slate-50">
                                        <td className="py-2.5 px-3 text-slate-400 font-bold">{i + 1}</td>
                                        <td className="py-2.5 px-3 font-bold text-slate-900">{v.name}</td>
                                        <td className="py-2.5 px-3 text-slate-500" dir="ltr">{v.phone}</td>
                                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">{v.weight}</td>
                                        <td className="py-2.5 px-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                {v.votes.map((vt, idx) => (
                                                    <span key={idx} className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-[10px]">
                                                        {vt.count > 1 ? (
                                                            <>
                                                                <span className="font-bold text-slate-400" title={vt.unit_name}>الوحدات المملوكة</span>
                                                                <span className="text-amber-600 font-black">×{vt.count}</span>
                                                            </>
                                                        ) : (
                                                            <span className="font-bold text-slate-400">{vt.unit_name}</span>
                                                        )}
                                                        <span className="text-slate-300">←</span>
                                                        <span className="font-bold text-slate-900">{vt.candidate_name}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* --- System Integrity Note (Admin Voting) --- */}
                    <div className="mb-10 p-5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 leading-relaxed">
                        <p className="font-bold mb-1">تنويه بخصوص الوحدات غير المحولة:</p>
                        <p>
                            تُحتسب الأصوات الخاصة بالوحدات غير المحولة بموجب التوكيل الإداري الممنوح لإدارة الجمعية وفق
            
                            النظام الأساسي، ويُمارَس هذا الحق حصرًا في الحدود التي لا تتعارض مع حقوق الملاك المنقولين. وقد تم
                            تضمين هذه الأصوات في الوزن التصويتي الإجمالي، وهي مُدرجة في سجل المشاركة أعلاه تحت اسم
                            "إدارة سندان".
                        </p>
                    </div>

                    {/* --- Certification Footer --- */}
                    <div className="mt-20 pt-10 border-t-2 border-slate-200">
                        <div className="flex justify-between items-end">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">اعتماد النتائج</p>
                                        <p className="text-xs text-slate-500">Results Certified</p>
                                    </div>
                                </div>
                                <div className="space-y-1 text-xs text-slate-400">
                                    <p>تاريخ التوليد: {formatDate(now)} م / {toHijri(now)} هـ</p>
                                    <p>رقم المرجع: {docRef}</p>
                                    <p className="text-[10px] mt-2">تم اعتماد آلية تحقق متعددة العوامل تعتمد على بيانات المالك المسجلة مسبقًا في سجل الناخبين المعتمد، وتشمل بيانات الوحدة والرقم المدني ورقم الهاتف المسجل، مع منع تكرار التصويت وربط كل صوت بسجل انتخابي فريد.</p>
                                </div>
                            </div>

                            <div className="text-left space-y-8">
                                <div className="space-y-2">
                                    <div className="w-52 h-[1px] bg-slate-900 mr-auto" />
                                    <p className="text-xs font-bold text-slate-900">التوقيع والختم</p>
                                    <p className="text-[10px] text-slate-500">Signature & Official Stamp</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400">—— انتهى المحضر ——</p>
                                    <p className="text-[10px] text-slate-400">— End of Minutes —</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    /* Define A4 dimensions and clean page margins */
                    @page {
                        size: A4 portrait;
                        margin: 15mm 15mm;
                    }
                    
                    /* Hide UI Chrome like sidebars, headers, action bars, buttons, and trigger elements */
                    [data-sidebar="sidebar"],
                    .sidebar,
                    header,
                    aside,
                    nav,
                    button,
                    .print\\:hidden {
                        display: none !important;
                        height: 0 !important;
                        width: 0 !important;
                        overflow: hidden !important;
                        visibility: hidden !important;
                    }

                    /* Reset all main layout scrollbars, constraints, flex structures, and heights */
                    html, 
                    body, 
                    #app, 
                    [data-sidebar="wrapper"],
                    [data-sidebar="inset"],
                    main,
                    .overflow-x-hidden {
                        overflow: visible !important;
                        overflow-x: visible !important;
                        overflow-y: visible !important;
                        height: auto !important;
                        min-height: auto !important;
                        max-height: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        background: white !important;
                        width: 100% !important;
                        position: static !important;
                        display: block !important;
                    }

                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    /* Clean content heights */
                    .min-h-screen {
                        min-height: 0 !important;
                        height: auto !important;
                        overflow: visible !important;
                    }

                    /* Force page breaks at designated points */
                    .page-break-before {
                        page-break-before: always !important;
                        break-before: always !important;
                        padding-top: 0 !important;
                        margin-top: 0 !important;
                        border-top: none !important;
                    }

                    /* Keep tables, rows, cards, and warnings whole - do not break them halfway across pages */
                    tr, 
                    table, 
                    .bg-slate-50, 
                    .bg-amber-50, 
                    .bg-emerald-50, 
                    .border, 
                    .border-2, 
                    .rounded-xl {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    /* Repeat table headers when tables span multiple pages for easier reading */
                    thead {
                        display: table-header-group !important;
                    }

                    /* Hide any browser scrollbars on body/containers */
                    ::-webkit-scrollbar {
                        display: none !important;
                    }
                    body {
                        scrollbar-width: none !important;
                    }
                    
                    .print\\:border-b {
                        border-bottom-width: 1px !important;
                    }
                }
            `}} />
        </AppLayout>
    );
}
