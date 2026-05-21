import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Vote as VoteIcon, Users, BarChart3, Lock, CheckCircle, 
    CalendarDays, Trophy, ArrowLeft, ArrowRight, ShieldCheck, 
    Fingerprint, Info, Mail, Phone, ExternalLink, Sparkles,
    ChevronDown, GraduationCap, Gavel, MousePointer2, Shield
} from 'lucide-react';
import { route } from 'ziggy-js';

interface ResultCandidate {
    id: number;
    name: string;
    photo: string | null;
    votes: number;
}

interface PublicElection {
    id: number;
    title: string;
    description: string | null;
    status: 'pending' | 'active' | 'completed' | 'archived';
    start_time: string | null;
    end_time: string | null;
    slug: string;
    show_results: boolean;
    results?: ResultCandidate[];
    winner?: ResultCandidate;
    total_votes?: number;
}

interface WelcomeProps {
    ongoing: PublicElection[];
    completed: PublicElection[];
    hasElections: boolean;
}

export default function Welcome({ ongoing, completed, hasElections }: WelcomeProps) {
    const [lang, setLang] = useState<'ar' | 'en'>('ar');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const t = {
        ar: {
            title: "نظام سندان للتصويت",
            brand: "سندان",
            heroTitle: "مستقبل التصويت الرقمي الآمن",
            heroDesc: "منصة ذكية تضمن النزاهة والشفافية الكاملة في عمليات التصويت المجتمعي. صوتك محفوظ، ونتائجك فورية.",
            ongoingElections: "الانتخابات الجارية",
            completedElections: "نتائج الانتخابات السابقة",
            noElections: "لا توجد انتخابات نشطة حالياً",
            noElectionsDesc: "شكراً لزيارتكم. يرجى المراجعة لاحقاً لمتابعة أي انتخابات قادمة.",
            startVoting: "ابدأ التصويت الآن",
            viewResults: "عرض النتائج",
            winnerLabel: "الفائز بالانتخابات",
            voteWeight: "الوزن التصويتي",
            howToVote: "كيفية التصويت",
            conditions: "شروط التصويت",
            step1Title: "التحقق من البيانات",
            step1Desc: "يتم التحقق من خلال مطابقة شرطين من ثلاثة: رقم الهوية، رقم الهاتف، أو اسم الوحدة.",
            step2Title: "اختيار المرشح",
            step2Desc: "تصفح قائمة المرشحين واطلع على سيرهم الذاتية قبل اتخاذ قرارك.",
            step3Title: "إرسال الصوت",
            step3Desc: "بمجرد تأكيد اختيارك، سيتم تسجيل صوتك مباشرة في النظام بشكل آمن ونزيه.",
            condition1: "يجب أن يكون المصوت مالكاً لوحدة عقارية مسجلة.",
            condition2: "لكل وحدة عقارية وزن تصويتي واحد.",
            condition3: "التصويت متاح فقط خلال الفترة الزمنية المحددة للانتخاب.",
            adminLogin: "بوابة المسؤولين",
            footer: "جميع الحقوق محفوظة © " + new Date().getFullYear(),
        },
        en: {
            title: "Sandan Voting System",
            brand: "Sandan",
            heroTitle: "The Future of Secure Digital Voting",
            heroDesc: "A smart platform ensuring integrity and full transparency in community voting processes. Your vote is secure, results are instant.",
            ongoingElections: "Ongoing Elections",
            completedElections: "Past Election Results",
            noElections: "No Active Elections Currently",
            noElectionsDesc: "Thank you for visiting. Please check back later for upcoming elections.",
            startVoting: "Start Voting Now",
            viewResults: "View Results",
            winnerLabel: "Election Winner",
            voteWeight: "Voting Weight",
            howToVote: "How to Vote",
            conditions: "Voting Conditions",
            step1Title: "Data Verification",
            step1Desc: "Verification is performed by matching 2 out of 3: ID number, phone number, or unit name.",
            step2Title: "Select Candidate",
            step2Desc: "Browse the candidates list and review their profiles before deciding.",
            step3Title: "Submit Vote",
            step3Desc: "Once your selection is confirmed, your vote will be registered directly and securely in the system.",
            condition1: "Voter must be a registered property owner.",
            condition2: "Each real estate unit has one voting weight.",
            condition3: "Voting is only available during the specified period.",
            adminLogin: "Admin Portal",
            footer: "All Rights Reserved © " + new Date().getFullYear(),
        }
    };

    const current = t[lang];
    const isRtl = lang === 'ar';

    return (
        <div className={`min-h-screen bg-[#FDFDFD] text-[#1A1C21] font-sans selection:bg-indigo-100 selection:text-indigo-700 ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <Head title={current.title} />

            {/* Premium Navigation */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/70 backdrop-blur-2xl border-b border-slate-100 py-3 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)]' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
                    <div className="flex items-center gap-4 group">
                        <img src="/logo-transparent.png" alt="Sandan Logo" className="h-10 md:h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
                        <div className="flex flex-col border-s border-slate-200 ps-4">
                            <span className="text-xl font-black tracking-tight text-slate-900 leading-none uppercase">{current.brand}</span>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-1.5 opacity-70">{isRtl ? 'نظام التصويت الذكي' : 'Smart Voting System'}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 md:gap-8">
                        <button 
                            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                            className="text-[11px] font-black text-slate-500 hover:text-indigo-600 transition-all uppercase tracking-widest px-3 py-1.5 rounded-full hover:bg-indigo-50"
                        >
                            {lang === 'ar' ? 'English' : 'العربية'}
                        </button>
                        <Link 
                            href={route('admin_login')}
                            className="hidden md:flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                        >
                            <Shield className="w-3.5 h-3.5" />
                            {current.adminLogin}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Immersive Hero Section */}
            <section className="relative pt-48 pb-32 overflow-hidden">
                {/* Abstract Background Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/40 to-transparent rounded-full blur-[120px] -z-10 animate-pulse-slow" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-50/40 to-transparent rounded-full blur-[100px] -z-10" />
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-px h-64 bg-gradient-to-b from-transparent via-slate-200 to-transparent -z-10 hidden md:block" />

                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex flex-col items-center text-center space-y-10">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in-up">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>{ongoing.length > 0 ? current.ongoingElections : current.noElections}</span>
                        </div>
                        
                        <div className="space-y-6 max-w-4xl mx-auto">
                            <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[1.05] tracking-tight animate-reveal">
                                {ongoing.length > 0 ? ongoing[0].title : (
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900">
                                        {current.heroTitle}
                                    </span>
                                )}
                            </h1>
                            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 leading-relaxed font-medium opacity-80 animate-fade-in-up delay-200">
                                {ongoing.length > 0 ? (ongoing[0].description || current.heroDesc) : current.heroDesc}
                            </p>
                        </div>

                        {ongoing.length > 0 ? (
                            <div className="pt-8 animate-fade-in-up delay-400">
                                <Link 
                                    href={route('vote_show_voter_id_form', { election_id: ongoing[0].id })}
                                    className="group relative inline-flex items-center gap-6 px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:bg-indigo-600 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden"
                                >
                                    <span className="relative z-10">{current.startVoting}</span>
                                    <div className="relative z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        {isRtl ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                </Link>
                            </div>
                        ) : (
                            <div className="w-full max-w-xl mx-auto p-1 px-1 rounded-[3rem] bg-gradient-to-br from-slate-100 to-white shadow-2xl shadow-slate-200/40 mt-12 animate-fade-in-up delay-400">
                                <div className="bg-white rounded-[2.8rem] p-12 flex flex-col items-center gap-6 border border-white">
                                    <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
                                        <CalendarDays className="w-10 h-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{current.noElections}</h3>
                                        <p className="text-slate-400 font-medium">{current.noElectionsDesc}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Bento-Style Info Grid */}
            {ongoing.length > 0 && (
                <section className="py-32 bg-[#F8F9FB] relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-8 relative z-10">
                        <div className="grid lg:grid-cols-12 gap-8">
                            
                            {/* Left: Interactive Process Cards */}
                            <div className="lg:col-span-7 space-y-8">
                                <div className="space-y-4 mb-16">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-1 bg-indigo-600 rounded-full" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">{current.howToVote}</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                                        {isRtl ? 'تجربة تصويت ذكية في ثلاث خطوات' : 'Smart Voting in Three Steps'}
                                    </h2>
                                </div>

                                <div className="grid gap-6">
                                    {[
                                        { icon: Fingerprint, title: current.step1Title, desc: current.step1Desc, color: 'indigo' },
                                        { icon: GraduationCap, title: current.step2Title, desc: current.step2Desc, color: 'amber' },
                                        { icon: ShieldCheck, title: current.step3Title, desc: current.step3Desc, color: 'emerald' },
                                    ].map((step, idx) => (
                                        <div key={idx} className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-indigo-100 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] transition-all duration-500">
                                            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                                <div className={`flex-shrink-0 w-20 h-20 rounded-[2rem] bg-${step.color}-50 flex items-center justify-center text-${step.color}-600 group-hover:scale-110 transition-transform duration-500`}>
                                                    <step.icon className="w-10 h-10" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">0{idx + 1}</span>
                                                        <h4 className="text-xl font-black text-slate-900 leading-none">{step.title}</h4>
                                                    </div>
                                                    <p className="text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Conditions Matrix */}
                            <div className="lg:col-span-5">
                                <div className="sticky top-32 h-fit bg-slate-900 rounded-[3.5rem] p-10 md:p-14 text-white overflow-hidden group shadow-2xl">
                                    {/* Decoration */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-700" />
                                    
                                    <div className="relative z-10 space-y-12">
                                        <div className="flex justify-between items-start">
                                            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/10">
                                                <Gavel className="w-8 h-8 text-indigo-400" />
                                            </div>
                                            <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                                                {isRtl ? 'البروتوكول الرسمي' : 'Official Protocol'}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-3xl font-black tracking-tight leading-none">{current.conditions}</h3>
                                            <p className="text-slate-400 text-sm font-medium">{isRtl ? 'يرجى الالتزام بالمعايير التالية لضمان قبول صوتك' : 'Please adhere to the following standards to ensure your vote is accepted'}</p>
                                        </div>

                                        <ul className="space-y-8">
                                            {[current.condition1, current.condition2, current.condition3].map((cond, idx) => (
                                                <li key={idx} className="flex gap-5 items-start group/item">
                                                    <div className="flex-shrink-0 w-6 h-6 rounded-full border border-indigo-500/50 flex items-center justify-center text-indigo-400 group-hover/item:bg-indigo-500 group-hover/item:text-white transition-all">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-base text-slate-300 leading-relaxed font-semibold">{cond}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="pt-6">
                                            <div className="p-6 rounded-[2rem] bg-indigo-600/20 border border-indigo-500/20 backdrop-blur-md">
                                                <div className="flex items-center gap-4">
                                                    <Shield className="w-6 h-6 text-indigo-400" />
                                                    <p className="text-[11px] font-black text-indigo-200 uppercase tracking-widest leading-relaxed">
                                                        {isRtl ? 'نظام مشفر بالكامل يضمن سرية هوية المصوت' : 'Fully encrypted system ensuring voter anonymity'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Footer with a Modern Twist */}
            <footer className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-6 group">
                        <img src="/logo-transparent.png" alt="Sandan Logo" className="h-10 opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700" />
                        <div className="flex flex-col border-s border-slate-100 ps-6">
                            <span className="text-lg font-black text-slate-300 uppercase tracking-widest">{current.brand}</span>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mt-1">{isRtl ? 'نظام التصويت' : 'Voting System'}</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-4 text-center md:text-end">
                        <div className="flex items-center gap-8">
                            <Link href="#" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">{isRtl ? 'الخصوصية' : 'Privacy'}</Link>
                            <Link href="#" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">{isRtl ? 'الشروط' : 'Terms'}</Link>
                            <Link href={route('admin_login')} className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-colors flex items-center gap-2">
                                {current.adminLogin}
                                <MousePointer2 className="w-3 h-3" />
                            </Link>
                        </div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                            {current.footer}
                        </p>
                    </div>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Cairo:wght@400;500;600;700;800;900&display=swap');
                
                body {
                    font-family: 'Inter', sans-serif;
                    -webkit-font-smoothing: antialiased;
                }

                .font-arabic {
                    font-family: 'Cairo', sans-serif;
                }

                @keyframes reveal {
                    from { clip-path: inset(0 100% 0 0); }
                    to { clip-path: inset(0 0 0 0); }
                }

                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }

                .animate-reveal {
                    animation: reveal 1.5s cubic-bezier(0.77, 0, 0.175, 1) forwards;
                }

                .animate-fade-in-up {
                    animation: fade-in-up 1s cubic-bezier(0.23, 1, 0.32, 1) forwards;
                }

                .animate-pulse-slow {
                    animation: pulse-slow 8s infinite ease-in-out;
                }

                .delay-200 { animation-delay: 200ms; }
                .delay-400 { animation-delay: 400ms; }
                
                ::selection {
                    background-color: #EEF2FF;
                    color: #4F46E5;
                }
            `}} />
        </div>
    );
}
