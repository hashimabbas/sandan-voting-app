import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email?: string;
    email_verified_at?: string;
    photo?: string | null;
    phone?: string | null;
    owner_id_no?: string | null;
    type?: 'admin' | 'owner';
    roles?: Role[]; // <--- NEW: Roles for the user
    permissions?: string[]; // <--- NEW: Direct permissions (if used)
    hasRole?: (role: string) => boolean; // <--- NEW: Helper for frontend checks
    hasPermissionTo?: (permission: string) => boolean; // <--- NEW: Helper for frontend checks
    created_at?: string; // Add if you use it for display
    updated_at?: string;
}

// Define Role interface
export interface Role {
    id: number;
    name: string;
    guard_name?: string;
    created_at?: string;
    updated_at?: string;
}
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User | null;
    };
    flash: {
        success?: string;
        error?: string;
        info?: string; // Add info for general messages
    };
    ziggy: Ziggy;
    can: { [key: string]: boolean }; // e.g., can.viewUsers, can.createOwners
    authenticatedUser: {
        // Current logged-in user details to pass to frontend
        id: number;
        name: string;
        email: string;
        hasRole: (role: string) => boolean; // Function to check role
        hasPermissionTo: (permission: string) => boolean; // Function to check permission
        // Add other core user properties if needed by NavUser etc.
    };
};

export interface BreadcrumbItem {
    label: string;
    url?: string;
    title?: string;
    href?: string;
}

// Owner-specific data structure (used in owner dashboard)
export interface OwnerData {
    id: number;
    name: string;
    phone: string;
    owner_id_no: string;
    photo: string | null;
}

// NEW: Tenant data structure
export interface Tenant {
    id: number;
    unit_id: number | null;
    name: string;
    phone: string;
    email: string | null;
    lease_start_date: string | null;
    lease_end_date: string | null;
    rent_amount: number | string | null | undefined;
    deposit_amount: number | string | null | undefined;
    remarks: string | null;
    created_at: string;
    updated_at: string;
    unit?: UnitShort | null; // Eager loaded unit for display
}

// NEW: Props for Admin Tenant Index page
export interface AdminTenantIndexProps {
    tenants: {
        data: Tenant[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    units: UnitShort[]; // For unit filter dropdown
    filters: { search?: string; unit_id?: string };
    breadcrumbs: BreadcrumbItem[];
    flash: { success?: string; error?: string; info?: string };
    can: {
        // Permissions for current user
        viewTenants: boolean;
        createTenants: boolean;
        editTenants: boolean;
        deleteTenants: boolean;
    };
}

// NEW: Props for Admin Tenant Create/Edit page
export interface AdminTenantCreateProps {
    units: UnitShort[];
    breadcrumbs: BreadcrumbItem[];
}
export interface AdminTenantEditProps {
    tenant: Tenant;
    units: UnitShort[];
    breadcrumbs: BreadcrumbItem[];
}

// Unit data structure (ensure balance can be string/number for flexibility)
export interface Unit {
    id: number;
    unit_code: string;
    y2020: number | string | null | undefined;
    y2021: number | string | null | undefined;
    y2022: number | string | null | undefined;
    y2023: number | string | null | undefined;
    y2024: number | string | null | undefined;
    y2025: number | string | null | undefined;
    y2026: number | string | null | undefined;
    total: number | string | null | undefined;
    received: number | string | null | undefined;
    balance: number | string | null | undefined;
    owner_id_no: string | null;
    owner?: OwnerShort | null; // Eager loaded owner
    tenant_id: number | null; // <--- ADDED
    tenant?: TenantShort | null; // <--- ADDED Eager loaded tenant (short version for display)
}

// Payment data structure (ensure amount can be string/number)
export interface Payment {
    id: number;
    payment_date: string;
    amount: number | string | null | undefined;
    method: string;
    reference: string | null;
    owner_id?: number; // Optional if not always eager loaded
    unit_id?: number; // Optional if not always eager loaded
}

// NEW: Admin Owner data interface for PaymentForm
export interface AdminOwner {
    id: number;
    name: string;
    phone: string;
    owner_id_no: string;
}

// NEW: Admin Unit data interface for PaymentForm (simplified)
export interface AdminUnit {
    id: number;
    unit_code: string;
    balance: number | string | null | undefined;
}

export interface Complaint {
    id: number;
    owner_id: number;
    unit_id: number | null;
    subject: string;
    description: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'rejected'; // Specific statuses
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    owner?: {
        // Eager loaded owner for display
        id: number;
        name: string;
        phone: string;
        owner_id_no: string;
    } | null;
    unit?: {
        // Eager loaded unit for display
        id: number;
        unit_code: string;
    } | null;
}

export interface WorkOrder {
    id: number;
    complaint_id: number | null;
    owner_id: number;
    unit_id: number;
    subject: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
    assigned_to: string | null;
    estimated_cost: number | null;
    actual_cost: number | null;
    expected_completion_date: string | null;
    completed_at: string | null;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    owner?: {
        // Eager loaded owner for display
        id: number;
        name: string;
        phone: string;
        owner_id_no: string;
    } | null;
    unit?: {
        // Eager loaded unit for display
        id: number;
        unit_code: string;
    } | null;
    complaint?: {
        // Eager loaded complaint for display
        id: number;
        subject: string;
        status: string;
    } | null;
}

// NEW: Short Owner interface for dropdowns/filters
export interface OwnerShort {
    id: number;
    name: string;
    phone: string;
}

// NEW: Short Unit interface for dropdowns/filters
export interface UnitShort {
    id?: number;
    unit_code: string;
    balance?: number | string | null | undefined;
    tenant_id?: number | null; // <--- ADDED for linking
}

export interface Document {
    id: number;
    owner_id: number | null;
    unit_id: number | null;
    name: string;
    file_path: string;
    file_name: string;
    file_size: number;
    file_mime_type: string;
    type: 'contract' | 'receipt' | 'report' | 'photo' | 'other' | null; // Nullable type
    description: string | null;
    created_at: string;
    updated_at: string;
    // Eager loaded relations for display
    owner?: OwnerShort | null;
    unit?: UnitShort | null;
    file_path_url?: string; // Optional: A URL for direct access/download
}

export interface PaymentsReportProps {
    payments: {
        data: Payment[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    totalPaymentsSum: number | string; // <--- NEW
    owners: OwnerShort[];
    paymentMethods: string[];
    filters: {
        start_date?: string;
        end_date?: string;
        method?: string;
        owner_id?: string;
        unit_code?: string;
    };
    breadcrumbs: BreadcrumbItem[];
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
    can: {
        // Permissions for current user
        viewReports: boolean;
        exportReports: boolean; // <--- NEW
        viewPaymentsReport: boolean;
    };
}

// NEW: UnitsReportProps
export interface UnitsReportProps {
    units: {
        data: Unit[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    owners: OwnerShort[];
    totalChargesSum: number | string;
    totalReceivedSum: number | string;
    totalBalanceSum: number | string;
    filters: {
        search?: string;
        owner_id?: string;
        balance_status?: string;
    };
    breadcrumbs: BreadcrumbItem[];
    flash: {
        /* ... */
    };
    can: {
        viewReports: boolean;
        exportReports: boolean;
        viewUnitsReport: boolean; // <--- NEW
    };
}

// NEW: OwnersReportProps
export interface OwnersReportProps {
    owners: {
        data: Owner &
            {
                // Extend Owner type to include aggregated sums/counts
                units_count: number;
                total_balance: number | string; // Sum of units balance
            }[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        has_units?: string;
        balance_status?: string;
    };
    breadcrumbs: BreadcrumbItem[];
    flash: {
        /* ... */
    };
    can: {
        viewReports: boolean;
        exportReports: boolean;
        viewOwnersReport: boolean; // <--- NEW
    };
}

// NEW: Voter data structure
export interface Voter {
    id: number;
    voter_id_no: string;
    name: string;
    phone: string;
    number_of_units: number;
    owner_id: number | null;
    has_voted: boolean;
    created_at: string;
    owner?: OwnerShort | null; // Eager loaded owner for display
}

// NEW: Candidate data structure
export interface Candidate {
    id: number;
    name: string;
    phone: string | null;
    description: string | null;
    photo: string | null;
    created_at?: string; // Made optional as not always returned
    votes_count?: number; // For results page
}

// NEW: Vote data structure (if needed for display)
export interface Vote {
    id: number;
    voter_id: number;
    candidate_id: number;
    vote_weight: number;
    created_at: string;
}

// NEW: General Voting props for Admin Voting Dashboard
export interface AdminVotingIndexProps {
    votingStatus: string;
    votingPeriod: { start: string | null; end: string | null };
    totalVoters: number;
    totalCandidates: number;
    totalVotesCast: number;
    breadcrumbs: BreadcrumbItem[];
    flash: { success?: string; error?: string; info?: string };
    can: {
        // Permissions for current user
        viewVotingStatus: boolean;
        manageVotingSystem: boolean;
        viewVoters: boolean;
        viewCandidates: boolean;
        viewVotingResults: boolean;
    };
}

// NEW: Props for Admin Voter Index page
export interface AdminVoterIndexProps {
    voters: {
        data: Voter[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string };
    breadcrumbs: BreadcrumbItem[];
    flash: { success?: string; error?: string; info?: string };
    can: {
        // Permissions for current user
        viewVoters: boolean;
        importVoters: boolean;
        editVoters: boolean;
        deleteVoters: boolean;
    };
}

// NEW: Props for Admin Voter Edit page
export interface AdminVoterEditProps {
    voter: Voter;
    owners: OwnerShort[];
    breadcrumbs: BreadcrumbItem[];
}

// NEW: Props for Admin Candidate Index page
export interface AdminCandidateIndexProps {
    candidates: {
        data: Candidate[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: { search?: string };
    breadcrumbs: BreadcrumbItem[];
    flash: { success?: string; error?: string; info?: string };
    can: {
        // Permissions for current user
        viewCandidates: boolean;
        createCandidates: boolean;
        editCandidates: boolean;
        deleteCandidates: boolean;
    };
}

// NEW: Props for Admin Candidate Create/Edit page
export interface AdminCandidateCreateProps {
    breadcrumbs: BreadcrumbItem[];
}
export interface AdminCandidateEditProps {
    candidate: Candidate;
    breadcrumbs: BreadcrumbItem[];
}

// NEW: Props for Admin Voting Results page
export interface AdminVotingResultsProps {
    results: Candidate[]; // Candidate data with votes_count
    totalPossibleVotes: number;
    totalVotesCast: number;
    votingStatus: string; // <--- ADDED
    breadcrumbs: BreadcrumbItem[];
    flash: { success?: string; error?: string; info?: string };
    can: {
        viewVotingResults: boolean;
        viewVotingStatus: boolean; // Needed for polling logic
    };
}

// NEW: Props for Owner Voting page
export interface OwnerVotingIndexProps {
    voter: Voter; // Owner's voter record
    candidates: Candidate[];
    breadcrumbs: BreadcrumbItem[];
    flash: { success?: string; error?: string; info?: string };
}
// For owner voting inactive/unavailable/completed pages
export interface OwnerVotingStatusPageProps {
    status?: string; // e.g., 'inactive'
    message: string; // Message to display
    breadcrumbs: BreadcrumbItem[];
}

// NEW: Props for Admin Live Voting Results page (same data structure)
export interface AdminLiveVotingResultsProps {
    results: Candidate[];
    totalPossibleVotes: number;
    totalVotesCast: number;
    votingStatus: string; // <--- ADDED
    // No breadcrumbs for this page
}

// NEW: TenantShort for display in unit table
export interface TenantShort {
    id: number;
    name: string;
    phone: string;
    email?: string | null; // Optional
}

// NEW: Props for Admin Rent Receivable Index page
export interface AdminRentReceivableIndexProps {
    units: {
        // This page lists units with their financial data
        data: Unit[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    owners: OwnerShort[]; // For owner filter dropdown
    filters: { search?: string; owner_id?: string; balance_status?: string };
    breadcrumbs: BreadcrumbItem[];
    flash: { success?: string; error?: string; info?: string };
    can: {
        // Permissions for current user
        viewRentReceivable: boolean;
        importRentReceivable: boolean;
    };
}
