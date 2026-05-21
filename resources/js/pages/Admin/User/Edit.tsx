import React from 'react';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Edit3,
    Mail,
    Lock,
    Camera,
    ArrowLeft,
    CheckCircle2,
    Settings,
    X,
    LoaderCircle,
    UserCircle,
    RefreshCw
} from 'lucide-react';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

interface AdminUserEditProps {
    user: {
        id: number;
        name: string;
        email: string;
        photo: string | null;
        roles: string[];
    };
    roles: { id: number; name: string }[];
    breadcrumbs: any[];
    auth_user_id: number;
}

export default function AdminUserEdit() {
    const { user, roles, breadcrumbs } = usePage<AdminUserEditProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        _method: 'post',
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        photo: null as File | null,
        remove_photo: false,
        roles: [...user.roles],
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
        post(route('admin_users_update_post', user.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modify Credentials: ${user.name}`} />

            <div className="min-h-screen bg-[#020617] text-slate-300 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

                <div className="w-full max-w-4xl relative z-10 space-y-8">
                    <Link
                        href={route('admin_users_index')}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Return to Registry
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Side: Info & Profile Preview */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl relative">
                                    {user.photo && !data.remove_photo ? (
                                        <img src={user.photo} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-5xl font-black text-slate-600">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-[#020617]">
                                    <UserCircle className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Modify Entity</h1>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Updating administrative credentials for <span className="text-indigo-400 font-bold">{user.name}</span>. Ensure authority remains within protocol.
                                </p>
                            </div>

                            <div className="p-6 rounded-3xl bg-indigo-600/5 border border-indigo-500/10 space-y-4">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Quick Summary</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className="text-slate-600">Entity ID</span>
                                        <span className="text-slate-400">#ADM-{user.id.toString().padStart(4, '0')}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className="text-slate-600">Status</span>
                                        <span className="text-emerald-500">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Form */}
                        <div className="lg:col-span-8">
                            <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 md:p-14 space-y-10 shadow-2xl">

                                {/* Identity Group */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Name</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-4 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                            required
                                        />
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
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-4 pr-12 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                                required
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>
                                </div>

                                {/* Authority Sync (Roles) */}
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Authority Sync (Roles)</label>
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

                                {/* Security Update Group */}
                                <div className="p-8 rounded-[2rem] bg-indigo-600/5 border border-indigo-500/10 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <RefreshCw className="w-4 h-4 text-indigo-400" />
                                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Credential Rotation (Optional)</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">New Access Key</label>
                                            <input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Confirm New Key</label>
                                            <input
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-800"
                                            />
                                        </div>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                {/* Media Group */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Identification Identity</label>
                                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                                        <div className="flex-1 relative group">
                                            <div className="flex items-center gap-6 p-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                                                <Camera className="w-8 h-8 text-slate-600" />
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        onChange={(e) => setData('photo', e.target.files?.[0] || null)}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        disabled={data.remove_photo}
                                                    />
                                                    <p className="text-sm font-bold text-slate-400">{data.photo ? data.photo.name : 'Update visual ID'}</p>
                                                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">PNG, JPG up to 2MB</p>
                                                </div>
                                            </div>
                                        </div>
                                        {user.photo && !data.remove_photo && (
                                            <button
                                                type="button"
                                                onClick={() => setData('remove_photo', true)}
                                                className="px-6 py-6 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                            >
                                                <X className="w-4 h-4" /> Remove Current
                                            </button>
                                        )}
                                        {data.remove_photo && (
                                            <button
                                                type="button"
                                                onClick={() => setData('remove_photo', false)}
                                                className="px-6 py-6 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest"
                                            >
                                                Restore Original
                                            </button>
                                        )}
                                    </div>
                                    <InputError message={errors.photo} />
                                </div>

                                <div className="pt-8 border-t border-white/5 flex items-center justify-end gap-6">
                                    <Link
                                        href={route('admin_users_index')}
                                        className="text-xs font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all"
                                    >
                                        Discard Changes
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="px-12 py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs gap-3 shadow-2xl shadow-indigo-600/20 active:scale-[0.98] transition-all"
                                    >
                                        {processing ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                                        Update Entity
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
