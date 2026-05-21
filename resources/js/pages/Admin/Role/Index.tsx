import React, { useState } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { 
    Shield, 
    Lock, 
    ChevronRight, 
    CheckCircle2, 
    XCircle, 
    Save, 
    Plus, 
    Trash2,
    ShieldCheck,
    Settings,
    Users,
    Key
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface RoleIndexProps {
    roles: Role[];
    allPermissions: Record<string, Permission[]>;
    breadcrumbs: any[];
}

export default function RoleIndex() {
    const { roles, allPermissions, breadcrumbs } = usePage<RoleIndexProps>().props;
    const [selectedRole, setSelectedRole] = useState<Role>(roles[0]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        roles[0]?.permissions.map(p => p.name) || []
    );
    const [isSaving, setIsSaving] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role);
        setSelectedPermissions(role.permissions.map(p => p.name));
    };

    const togglePermission = (permName: string) => {
        setSelectedPermissions(prev => 
            prev.includes(permName) 
                ? prev.filter(p => p !== permName) 
                : [...prev, permName]
        );
    };

    const handleSavePermissions = () => {
        setIsSaving(true);
        router.put(route('admin_roles_update', selectedRole.id), {
            permissions: selectedPermissions
        }, {
            preserveScroll: true,
            onFinish: () => setIsSaving(false)
        });
    };

    const handleCreateRole = () => {
        if (!newRoleName) return;
        router.post(route('admin_roles_store'), { name: newRoleName }, {
            onSuccess: () => setNewRoleName(''),
        });
    };

    const handleDeleteRole = (role: Role) => {
        if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
            router.delete(route('admin_roles_destroy', role.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Governance & Permissions" />

            <div className="min-h-screen bg-[#020617] text-slate-300 p-8 space-y-10 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.4em]">
                            <Shield className="w-4 h-4" /> System Governance Matrix
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">Roles & Permissions</h1>
                        <p className="text-slate-500 font-medium max-w-xl text-lg">Define administrative hierarchies, operational boundaries, and data access protocols for the assembly ecosystem.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                    {/* Left Panel: Roles List */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                                    <Users className="w-5 h-5 text-indigo-400" /> Administrative Roles
                                </h2>
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{roles.length} Active</span>
                            </div>

                            <div className="space-y-2">
                                {roles.map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => handleRoleSelect(role)}
                                        className={cn(
                                            "w-full group relative flex items-center justify-between p-5 rounded-2xl transition-all duration-300",
                                            selectedRole.id === role.id 
                                                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" 
                                                : "bg-white/[0.02] border border-white/5 text-slate-400 hover:bg-white/[0.05] hover:border-white/10"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                selectedRole.id === role.id ? "bg-white/20" : "bg-white/5"
                                            )}>
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-sm uppercase tracking-widest">{role.name}</span>
                                        </div>
                                        <ChevronRight className={cn(
                                            "w-4 h-4 transition-transform",
                                            selectedRole.id === role.id ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                                        )} />
                                    </button>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <div className="relative group">
                                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input 
                                        type="text" 
                                        placeholder="Add New Authority Layer..."
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateRole()}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {selectedRole && !['super-admin', 'admin', 'manager'].includes(selectedRole.name) && (
                            <button 
                                onClick={() => handleDeleteRole(selectedRole)}
                                className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3"
                            >
                                <Trash2 className="w-4 h-4" /> Terminate Role Authority
                            </button>
                        )}
                    </div>

                    {/* Right Panel: Permissions Grid */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 md:p-14 space-y-12">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-white tracking-tighter">
                                        Authority Matrix: <span className="text-indigo-500 uppercase">{selectedRole.name}</span>
                                    </h2>
                                    <p className="text-slate-500 font-medium max-w-md">Assign granular operational permissions to this role. Changes take effect on next session.</p>
                                </div>
                                <Button 
                                    onClick={handleSavePermissions}
                                    disabled={isSaving || selectedRole.name === 'super-admin'}
                                    className="px-10 py-6 rounded-2xl bg-indigo-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs gap-3 shadow-2xl shadow-indigo-600/20 transition-all active:scale-[0.98]"
                                >
                                    {isSaving ? <Settings className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Deploy Changes
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {Object.entries(allPermissions).map(([group, perms]) => (
                                    <div key={group} className="space-y-5">
                                        <div className="flex items-center gap-3 px-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">{group} Module</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {perms.map((perm) => (
                                                <button
                                                    key={perm.id}
                                                    disabled={selectedRole.name === 'super-admin'}
                                                    onClick={() => togglePermission(perm.name)}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 rounded-xl transition-all duration-300",
                                                        selectedPermissions.includes(perm.name)
                                                            ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                                                            : "bg-white/5 border border-white/5 text-slate-500 hover:bg-white/10 hover:border-white/10"
                                                    )}
                                                >
                                                    <span className="text-xs font-bold">{perm.name}</span>
                                                    {selectedPermissions.includes(perm.name) ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 opacity-20" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedRole.name === 'super-admin' && (
                                <div className="p-8 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-start gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                                        <Lock className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-black text-white tracking-tight">Root Authority Locked</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                            The <span className="text-indigo-400 font-bold uppercase">super-admin</span> role is the root of the system and automatically bypasses all permission checks. Its matrix is immutable.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
