import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    Shield, 
    Mail, 
    Lock, 
    ArrowRight, 
    Sparkles, 
    ChevronRight,
    Activity,
    Eye,
    EyeOff,
    LoaderCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin_send_email_otp'));
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-emerald-500/30 flex items-center justify-center p-6 overflow-hidden relative">
            <Head title="System Gateway | Secure Authentication" />

            {/* Cinematic Background Layer */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                
                {/* Parallax Grid */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 mix-blend-overlay" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            <div className="w-full max-w-xl relative z-10">
                <div className="text-center space-y-12 mb-16">
                    {/* Monolithic Logo Wrapper */}
                    <div className="relative inline-block group">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-1000" />
                        <div className="relative w-24 h-24 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl backdrop-blur-xl transition-all duration-700 group-hover:rotate-[10deg]">
                            <Shield className="w-10 h-10 text-emerald-400" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.4em] animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <Sparkles className="w-4 h-4" /> Secure Administration Hub
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                            Enter the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Decisive Engine.</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                            Accessing the core operational protocols for Sandan Property Assemblies.
                        </p>
                    </div>
                </div>

                {/* Glassmorphic Auth Container */}
                <div className="relative group animate-in fade-in zoom-in duration-1000 delay-300">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/30 to-indigo-500/30 rounded-[3.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                    
                    <div className="relative bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-[3.5rem] p-10 md:p-14 space-y-12">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            {/* Email Input Field */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">Administrative Identity</label>
                                <div className="relative group/input">
                                    <Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within/input:text-emerald-400 transition-colors" />
                                    <input 
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter secure email..."
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-6 pl-8 pr-16 text-white text-lg focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-800 focus:ring-4 focus:ring-emerald-500/5"
                                        required
                                    />
                                </div>
                                {errors.email && <p className="text-red-500/80 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.email}</p>}
                            </div>

                            {/* Password Input Field */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Passcode Sequence</label>
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-[9px] font-black text-slate-700 hover:text-white uppercase tracking-widest transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="relative group/input">
                                    <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within/input:text-emerald-400 transition-colors" />
                                    <input 
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter key sequence..."
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-6 pl-8 pr-16 text-white text-lg focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-800 focus:ring-4 focus:ring-emerald-500/5"
                                        required
                                    />
                                </div>
                                {errors.password && <p className="text-red-500/80 text-[10px] font-bold uppercase tracking-widest ml-4">{errors.password}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full group relative flex items-center justify-center gap-4 py-7 rounded-[2rem] bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-[0.3em] text-xs transition-all duration-500 shadow-2xl shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? (
                                    <LoaderCircle className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Initiate Secure Session</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Quantum Guard</span>
                                    <span className="text-[9px] text-slate-600 font-bold">256-bit AES Protocol</span>
                                </div>
                            </div>
                            <Link href="/" className="text-[9px] font-black text-slate-700 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                                Public Home <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Storytelling */}
                <div className="mt-16 text-center">
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.5em]">
                        Property Authority &copy; 2026 Sandan Hub
                    </p>
                </div>
            </div>
        </div>
    );
}
