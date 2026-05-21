import React, { useState } from 'react';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    ShieldCheck, 
    ShieldAlert, 
    Zap, 
    Activity, 
    Settings as SettingsIcon,
    RefreshCw,
    Lock,
    Unlock,
    LoaderCircle,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsProps {
    settings: {
        admin_2fa_enabled: boolean;
    };
    breadcrumbs: any[];
}

export default function SettingsIndex() {
    const { settings, breadcrumbs } = usePage<SettingsProps>().props;
    const { data, setData, post, processing } = useForm({
        admin_2fa_enabled: settings.admin_2fa_enabled,
    });

    const handleToggle2FA = (val: boolean) => {
        setData('admin_2fa_enabled', val);
        router.post(route('admin_settings_update'), { admin_2fa_enabled: val }, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Control Unit | Security Protocols" />

            <div className="min-h-screen bg-[#020617] text-slate-300 p-8 space-y-12 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.4em]">
                            <SettingsIcon className="w-4 h-4" /> System Core Protocols
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">System Control</h1>
                        <p className="text-slate-500 font-medium max-w-xl text-lg">Modify administrative boundaries, security layers, and operational parameters of the Sandan Assembly.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                    {/* Security Protocols Panel */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 md:p-14 space-y-12 shadow-2xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Security Hardening</h2>
                                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Protocol Layer 01</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* 2FA Toggle Card */}
                                <div className={cn(
                                    "p-10 rounded-[2.5rem] border transition-all duration-700 flex flex-col md:flex-row md:items-center justify-between gap-12",
                                    data.admin_2fa_enabled 
                                        ? "bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5" 
                                        : "bg-red-500/5 border-red-500/20 shadow-red-500/5"
                                )}>
                                    <div className="space-y-4 max-w-md">
                                        <div className="flex items-center gap-3">
                                            {data.admin_2fa_enabled ? (
                                                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                            ) : (
                                                <ShieldAlert className="w-6 h-6 text-red-500" />
                                            )}
                                            <h3 className="text-xl font-black text-white uppercase tracking-wider">Multi-Factor Auth</h3>
                                        </div>
                                        <p className="text-slate-500 font-medium leading-relaxed">
                                            {data.admin_2fa_enabled 
                                                ? "OTP verification is currently mandatory for all administrative access attempts. This ensures maximum entity protection." 
                                                : "Security layer is currently relaxed. Direct email/password access is permitted. High risk mode."}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded-[2rem] border border-white/5">
                                        <button 
                                            onClick={() => handleToggle2FA(true)}
                                            className={cn(
                                                "px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3",
                                                data.admin_2fa_enabled 
                                                    ? "bg-emerald-500 text-black shadow-xl" 
                                                    : "text-slate-600 hover:text-white"
                                            )}
                                        >
                                            <Lock className="w-3 h-3" /> Enabled
                                        </button>
                                        <button 
                                            onClick={() => handleToggle2FA(false)}
                                            className={cn(
                                                "px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3",
                                                !data.admin_2fa_enabled 
                                                    ? "bg-red-500 text-white shadow-xl" 
                                                    : "text-slate-600 hover:text-white"
                                            )}
                                        >
                                            <Unlock className="w-3 h-3" /> Disabled
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {processing && (
                                <div className="flex items-center gap-4 text-emerald-400 animate-pulse">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Updating System Protocols...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats / Info Panel */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-black shadow-xl">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Health Status</h2>
                                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Real-time Diagnostics</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-bold text-slate-400">Core Engine</span>
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Operational</span>
                                </div>
                                <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                        <span className="text-xs font-bold text-slate-400">Identity Guard</span>
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Active</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <div className="p-8 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 flex flex-col items-center text-center space-y-4">
                                    <CheckCircle2 className="w-10 h-10 text-indigo-400" />
                                    <p className="text-xs font-medium text-slate-400 leading-relaxed">
                                        All administrative actions are currently being logged under the <span className="text-white font-bold">Standard Integrity Protocol</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
