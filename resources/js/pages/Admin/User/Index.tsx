import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { 
    PlusCircle, 
    Search, 
    Edit, 
    Trash2, 
    Shield, 
    UserPlus, 
    Mail, 
    Calendar,
    ArrowUpRight,
    ShieldCheck,
    MoreVertical,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminUser {
    id: number;
    name: string;
    email: string;
    photo: string | null;
    created_at: string;
    roles?: { id: number; name: string }[];
}

interface AdminUserIndexProps {
    users: {
        data: AdminUser[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
    breadcrumbs: any[];
    flash: {
        success?: string;
        error?: string;
    };
    can: {
        viewUsers: boolean;
        createUsers: boolean;
        editUsers: boolean;
        deleteUsers: boolean;
        assignRoles: boolean;
    };
    user_id: number;
}

export default function AdminUserIndex() {
    const { users, filters, breadcrumbs, flash, can, user_id } = usePage<AdminUserIndexProps>().props;
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = () => {
        router.get(route('admin_users_index'), { search }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleResetSearch = () => {
        setSearch('');
        router.get(route('admin_users_index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm("Permanently revoke administrative access for this entity?")) {
            router.delete(route('admin_users_destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Authority Personnel" />

            <div className="min-h-screen bg-[#020617] text-slate-300 p-8 space-y-12 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.4em]">
                            <Shield className="w-4 h-4" /> Administrative Registry
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">Access Control</h1>
                        <p className="text-slate-500 font-medium max-w-xl text-lg">Oversee the administrative hierarchy, manage operational permissions, and monitor core system access points.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link 
                            href={route('admin_users_create')}
                            className="inline-flex items-center gap-4 px-10 py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20 group"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>Add Personnel</span>
                        </Link>
                    </div>
                </header>

                {/* Search Bar */}
                <div className="relative group z-10 max-w-2xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search personnel by name or identity..."
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 pl-16 pr-6 text-white text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-700"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>

                {/* Personnel Grid */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {users.data.map((user) => (
                        <div 
                            key={user.id}
                            className="group relative bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10"
                        >
                            <div className="flex flex-col gap-8">
                                <div className="flex items-start justify-between">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white/5 shadow-2xl">
                                            {user.photo ? (
                                                <img src={user.photo} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-3xl font-black text-slate-600">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-[#0a0f1d]">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={route('admin_users_edit', user.id)}>
                                            <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:bg-white hover:text-black transition-all">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                        </Link>
                                        {user_id !== user.id && (
                                            <button 
                                                onClick={() => handleDelete(user.id)}
                                                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-red-500/50 hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-white tracking-tight">{user.name}</h3>
                                        <div className="flex items-center gap-2 text-slate-500 mt-1">
                                            <Mail className="w-4 h-4" />
                                            <span className="text-xs font-bold">{user.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Commissioned</span>
                                            <span className="text-[11px] font-bold text-slate-400">{new Date(user.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    {user_id === user.id && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">
                                            <Activity className="w-3 h-3" /> Active Self
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {users.data.length === 0 && (
                    <div className="py-40 text-center bg-white/[0.01] border border-white/5 border-dashed rounded-[4rem]">
                        <Search className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-white tracking-tight">Personnel Not Found</h3>
                        <p className="text-slate-600 font-medium uppercase tracking-[0.2em] text-[10px] mt-2">Standing by for registry authentication</p>
                    </div>
                )}

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex justify-center pt-12">
                        <Pagination links={users.links} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
