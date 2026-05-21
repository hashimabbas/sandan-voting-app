import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials'; // Assuming this hook correctly generates initials
// import { type User } from '@/types'; // You might need to adjust this type definition in '@/types'
import { usePage } from '@inertiajs/react'; // Import usePage to get user from auth props


// Define the expected structure of your authenticated user (Owner or Admin)
// This interface should align with what HandleInertiaRequests.php shares
interface AuthenticatedAppUser {
    id: number;
    name: string | null;
    phone?: string | null; // Optional, specific to Owner
    email?: string | null; // Optional, specific to Admin User
    photo: string | null; // <--- THIS IS THE CORRECT PROPERTY NAME
    owner_id_no?: string | null; // Optional, specific to Owner
    type?: 'admin' | 'owner'; // Optional, useful for frontend logic
    // ... any other properties you share from Laravel
}

// Update the props interface for UserInfo
// It should now expect `user` to be the AuthenticatedAppUser
// Or, if this component is *always* used inside AppLayout, you can get the user
// directly from usePage().props.auth.user as shown below.
// For now, let's assume it gets it via props, but we'll add a way to get it
// directly from Inertia props if it's called in isolation.

// If UserInfo is expected to be used as a standalone component that reads `auth.user`
// from Inertia's global props, it should look like this:
export function UserInfo({ showEmail = false }: { showEmail?: boolean }) {
    const { auth } = usePage<{ auth: { user: AuthenticatedAppUser | null } }>().props;
    const user = auth?.user; // Safely get the user object

    const getInitials = useInitials(); // Initialize your initials hook

    // --- CRITICAL: Handle the case where user is NULL ---
    if (!user) {
        // console.log("UserInfo: User is null or undefined. Not rendering user info."); // Debugging
        return (
            <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-500">
                <span>Guest</span>
                {/* Optional: Add a login link here */}
            </div>
        );
    }
}
