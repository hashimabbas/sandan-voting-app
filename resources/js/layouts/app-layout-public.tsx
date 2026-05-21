// resources/js/layouts/app-layout-public.tsx
import React, { PropsWithChildren } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { LogIn, User } from 'lucide-react'; // Example icons
import AppLogo from '@/components/app-logo'; // Assuming you have an AppLogo component

interface AppLayoutPublicProps extends PropsWithChildren {
    title?: string;
    // You can add more props like a custom header, footer, etc.
}

export default function AppLayoutPublic({ children, title }: AppLayoutPublicProps) {
    const { props } = usePage();
    const appName = props.name || 'Application'; // Get app name from shared props
    const authUser = props.auth?.user; // Check if any user is authenticated

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Head title={title ? `${title} - ${appName}` : appName} />

            {/* Optional Public Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <Link href={route('home')} className="flex items-center gap-2 text-xl font-bold text-gray-800">
                        <AppLogo className="h-8 w-auto" /> {/* Use your AppLogo component */}
                        {/* {appName} */} {/* Optionally display app name text */}
                    </Link>
                    <nav className="flex items-center space-x-4">
                        {/* Example: Link to Home */}
                        <Link
                            href={route('home')}
                            className="text-gray-600 hover:text-gray-900 text-sm font-medium transition duration-150 ease-in-out"
                        >
                            Home
                        </Link>
                        {/* Example: Link to Receipt Verification */}
                        <Link
                            href={route('receipt_verification_form')}
                            className="text-gray-600 hover:text-gray-900 text-sm font-medium transition duration-150 ease-in-out"
                        >
                            Verify Vote
                        </Link>

                        {/* Conditional Login/Dashboard Link */}
                        {authUser ? (
                            <Link
                                href={authUser.type === 'admin' ? route('admin_dashboard') : route('owner_dashboard')}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                <User className="h-4 w-4 mr-1" /> Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={route('admin_login')} // Assuming admin_login is the general public login
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                <LogIn className="h-4 w-4 mr-1" /> Login
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1">
                {children}
            </main>

            {/* Optional Public Footer */}
            <footer className="bg-gray-800 text-white py-6 text-center text-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    &copy; {new Date().getFullYear()} {appName}. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
