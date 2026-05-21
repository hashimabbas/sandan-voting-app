import React from 'react';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    UserPlus,
    Mail,
    Lock,
    Camera,
    ArrowLeft,
    CheckCircle2,
    Settings,
    LoaderCircle
} from 'lucide-react';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

interface AdminUserCreateProps {
    breadcrumbs: any[];
    roles: { id: number; name: string }[];
}

export default function AdminUserCreate() {
    const { breadcrumbs, roles } = usePage<AdminUserCreateProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        photo: null as File | null,
        roles: [] as string[],
    });

    const handleRoleToggle = (roleName: string) => {
        const currentRoles = [...data.roles];
        const index = currentRoles.indexOf(roleName);
        if (index > -1) {
            currentRoles.splice(index, 1);
        } else {
            currentRoles.push(roleName);
        }
        setData('roles', currentRoles);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin_users_store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Commission New Personnel" />

            <div className="min-h-screen bg-[#020617] text-slate-300 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

                <div className="w-full max-w-4xl relative z-10 space-y-8">
                    <Link
                        href={route('admin_users_index')}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Registry
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Side: Info */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/20">
                                <UserPlus className="w-10 h-10" />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Commission Personnel</h1>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Initiate a new administrative entity. Ensure all credentials align with the security protocols of the Sandan Assembly ecosystem.
                                </p>
                            </div>

                            <div className="space-y-3 pt-6">
                                <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Secure Encryption
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Administrative Access
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Audit Logging
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Form */}
                        <div className="lg:col-span-8">
                            <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 md:p-14 space-y-10 shadow-2xl">

                                {/* Identity Group */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Legal Name</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="John Doe"
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-4 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-800"
                                                required
                                            />
                                        </div>
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="john@sandan.com"
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-4 pr-12 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-800"
                                                required
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>
                                </div>

                                {/* Security Group */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Access Key</label>
                                        <div className="relative group">
                                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                            <input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-4 pr-12 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-800"
                                                required
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Confirm Access Key</label>
                                        <div className="relative group">
                                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                            <input
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-4 pr-12 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-800"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Authority Mapping (Roles) */}
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Authority Mapping (Roles)</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {roles.map((role) => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => handleRoleToggle(role.name)}
                                                className={cn(
                                                    "p-4 rounded-2xl border transition-all text-left group relative overflow-hidden",
                                                    data.roles.includes(role.name)
                                                        ? "bg-indigo-600/10 border-indigo-500/50 text-white"
                                                        : "bg-white/[0.01] border-white/5 text-slate-500 hover:border-white/20"
                                                )}
                                            >
                                                <div className="flex items-center gap-3 relative z-10">
                                                    <div className={cn(
                                                        "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                                                        data.roles.includes(role.name) ? "border-indigo-500 bg-indigo-500" : "border-slate-700"
                                                    )}>
                                                        {data.roles.includes(role.name) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{role.name.replace('-', ' ')}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <InputError message={errors.roles} />
                                </div>

                                {/* Media Group */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Visual Identification (Photo)</label>
                                    <div className="flex items-center gap-6 p-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all relative">
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-600">
                                            <Camera className="w-8 h-8" />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                onChange={(e) => setData('photo', e.target.files?.[0] || null)}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            <p className="text-sm font-bold text-slate-400">{data.photo ? data.photo.name : 'Click to upload or drag & drop identification'}</p>
                                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">PNG, JPG up to 2MB</p>
                                        </div>
                                    </div>
                                    <InputError message={errors.photo} />
                                </div>

                                <div className="pt-8 border-t border-white/5 flex items-center justify-end gap-6">
                                    <Link
                                        href={route('admin_users_index')}
                                        className="text-xs font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all"
                                    >
                                        Cancel Commission
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="px-12 py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs gap-3 shadow-2xl shadow-indigo-600/20 active:scale-[0.98] transition-all"
                                    >
                                        {processing ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                                        Finalize Commission
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
