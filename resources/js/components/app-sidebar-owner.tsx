import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
// <--- REMOVE SidebarMenuSection from this import ---
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SidebarMenuSection } from '@/components/ui/sidebar-menu-section'; // <--- NEW: IMPORT FROM NEW FILE
// <--- ADD owner_voting_index to the import below ---
import { owner_dashboard, owner_voting_index } from '@/routes';
import { type NavItem } from '@/types';
import { Link, router, usePage } from '@inertiajs/react'; // Ensure usePage and router are imported
// <--- ADD ListTodo icon for voting ---
import { BookOpen, Folder, LayoutGrid, LogOut, MessageSquareMore, ListTodo } from 'lucide-react';
import AppLogo from './app-logo';
import { Button } from './ui/button';
import { UserInfo } from './user-info';

export function AppSidebarOwner() {
    const { can } = usePage().props; // Access global 'can' object if owner also has permissions

    const mainNavItems: NavItem[] = [];
    // Assuming owner always sees dashboard and complaints if logged in,
    // but you can add can.viewOwnerDashboard, can.viewOwnerComplaints etc.
    mainNavItems.push({
        title: 'Dashboard',
        href: owner_dashboard(),
        icon: LayoutGrid,
    });


    // --- Owner Voting Section Items ---
    const ownerVotingNavItems: NavItem[] = [];
    // Assuming owner has a permission to view voting or it's always visible if active
    // if (can.viewOwnerVoting) { // Example permission
    ownerVotingNavItems.push({
        title: 'Voting',
        href: owner_voting_index(),
        icon: ListTodo,
    });
    // }
    // --- END Owner Voting Section Items ---


    const footerNavItems: NavItem[] = [
        {
            title: 'Reports', // Placeholder for owner-specific reports
            href: '#',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: '#',
            icon: BookOpen,
        },
    ];

    const handleLogout = () => {
        if (confirm("Are you sure you want to log out?")) {
            router.post(route('owner_logout'), {}, {
                onStart: () => console.log("Inertia POST request for logout started to /owner/logout."),
                onSuccess: () => console.log("Inertia POST request for logout successful to /owner/logout."),
                onError: (errors) => console.error("Inertia POST request for logout failed to /owner/logout:", errors),
                onFinish: () => console.log("Inertia POST request for logout finished to /owner/logout."),
            });
        }
    };

    const showOwnerVotingSection = ownerVotingNavItems.length > 0;


    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={owner_dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />

                {showOwnerVotingSection && (
                    <SidebarMenuSection label="My Activities" icon={ListTodo}> {/* Generic label for owner activities */}
                        <NavMain items={ownerVotingNavItems} />
                    </SidebarMenuSection>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mb-2 mt-auto" />
                <NavUser />

                <Button
                    onClick={handleLogout}
                    type="button"
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 mt-2"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}
