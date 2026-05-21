import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import {
    admin_dashboard, admin_settings_index, 
    admin_elections_index, admin_voters_index, admin_candidates_index,
    admin_import_index, admin_logout, admin_users_index
} from '@/routes';
import { type NavItem } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutGrid, Users, Settings, UserRoundCheck, 
    CalendarCheck, LogOut, 
    Database, BarChart3, Activity, Sparkles
} from 'lucide-react';
import AppLogo from './app-logo';
import { cn } from '@/lib/utils';

export function AppSidebar() {
    const { can } = usePage().props as any;

    const mainNav: NavItem[] = [
        { title: 'Dashboard', href: admin_dashboard(), icon: LayoutGrid }
    ];

    const electionNav: NavItem[] = [
        { title: 'Elections', href: admin_elections_index(), icon: CalendarCheck },
        { title: 'Voter Registry', href: admin_voters_index(), icon: Users },
        { title: 'Candidates', href: admin_candidates_index(), icon: UserRoundCheck }
    ];

    const systemNav: NavItem[] = [
        { title: 'Property Management', href: admin_import_index(), icon: Database },
        { title: 'System Control Unit', href: admin_settings_index(), icon: Settings },
        { title: 'Users Management', href: admin_users_index(), icon: UserRoundCheck }
    ];

    const handleAdminLogout = () => {
        if (confirm("Are you sure you want to logout?")) {
            router.post(route('admin_logout'));
        }
    };

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-slate-200 bg-white">
            <SidebarHeader className="p-6">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent h-auto">
                            <Link href={admin_dashboard()} className="flex items-center gap-4 group">
                                <AppLogo size="sm" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-4 py-8 space-y-10 custom-scrollbar bg-white">
                {/* Main Navigation */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-4 mb-6 opacity-40">
                        <Activity className="w-3 h-3 text-slate-900" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">General</span>
                    </div>
                    <NavMain items={mainNav} />
                </div>

                {/* Election Management */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-4 mb-6 opacity-40">
                        <BarChart3 className="w-3 h-3 text-slate-900" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Operations</span>
                    </div>
                    <NavMain items={electionNav} />
                </div>

                {/* System Nodes */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-4 mb-6 opacity-40">
                        <Database className="w-3 h-3 text-slate-900" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Infrastructure</span>
                    </div>
                    <NavMain items={systemNav} />
                </div>
            </SidebarContent>

            <SidebarFooter className="p-6 space-y-6 bg-white border-t border-slate-50">
                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-[0.05] group-hover:scale-125 transition-transform duration-700">
                        <Sparkles className="w-12 h-12 text-indigo-600" />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">System Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-slate-900 font-black text-xs">Core Active & Stable</span>
                        </div>
                    </div>
                </div>

                <NavUser />

                <button
                    onClick={handleAdminLogout}
                    className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all group"
                >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-black text-[10px] uppercase tracking-[0.2em]">Logout Session</span>
                </button>
            </SidebarFooter>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #e2e8f0; }
            `}} />
        </Sidebar>
    );
}
