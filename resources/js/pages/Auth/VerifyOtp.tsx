import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    Key, 
    ShieldCheck, 
    ArrowRight, 
    RefreshCcw, 
    ArrowLeft,
    Fingerprint,
    LoaderCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifyOtpProps {
    email: string;
}

export default function VerifyOtp({ email }: VerifyOtpProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: email,
        otp_code: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin_verify_email_otp'));
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-emerald-500/30 flex items-center justify-center p-6 overflow-hidden relative">
            <Head title="OTP Verification | Administrative Shield" />

            {/* Cinematic Background Layer */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/5 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 mix-blend-overlay" />
            </div>

            <div className="w-full max-w-xl relative z-10">
                <div className="text-center space-y-12 mb-16">
                    {/* Animated Identity Shield */}
                    <div className="relative inline-block group">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-ping duration-1000" />
                        <div className="relative w-24 h-24 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl backdrop-blur-xl">
                            <Fingerprint className="w-10 h-10 text-indigo-400" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.4em]">
                            <ShieldCheck className="w-4 h-4" /> Multi-Layer Authentication
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                            Identity <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Confirmation.</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg max-w-sm mx-auto leading-relaxed">
                            A secure sequence has been dispatched to <span className="text-indigo-400 font-bold">{email}</span>. Please verify to proceed.
                        </p>
                    </div>
                </div>

                {/* Glassmorphic OTP Container */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 to-emerald-500/30 rounded-[3.5rem] blur-xl opacity-20" />
                    
                    <div className="relative bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-[3.5rem] p-10 md:p-14 space-y-12">
                        <form onSubmit={handleSubmit} className="space-y-12">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2 block text-center">Verification Sequence</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        maxLength={6}
                                        value={data.otp_code}
                                        onChange={(e) => setData('otp_code', e.target.value)}
                                        placeholder="000000"
                                        className="w-full bg-black/40 border border-white/5 rounded-3xl py-8 text-center text-5xl font-black text-white tracking-[0.3em] focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-900 focus:ring-8 focus:ring-indigo-500/5 shadow-inner"
                                        required
                                        autoFocus
                                    />
                                    <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-800 opacity-20" />
                                </div>
                                {errors.otp_code && <p className="text-red-500/80 text-[10px] font-bold uppercase tracking-widest text-center">{errors.otp_code}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full group relative flex items-center justify-center gap-4 py-7 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.3em] text-xs transition-all duration-500 shadow-2xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? (
                                    <LoaderCircle className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Authorize Access</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-8">
                            <div className="flex items-center gap-12 text-[10px] font-black uppercase tracking-widest">
                                <button type="button" className="text-slate-600 hover:text-indigo-400 transition-colors flex items-center gap-2">
                                    <RefreshCcw className="w-3 h-3" /> Resend Protocol
                                </button>
                            <Link href={route('admin_login')} className="text-slate-600 hover:text-white transition-colors flex items-center gap-2">
                                <ArrowLeft className="w-3 h-3" /> Use Different Key
                            </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.5em]">
                        Shield Protocol &copy; 2026 Identity Hub
                    </p>
                </div>
            </div>
        </div>
    );
}
