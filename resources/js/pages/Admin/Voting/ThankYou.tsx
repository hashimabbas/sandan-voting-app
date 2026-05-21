// resources/js/Pages/Voting/ThankYou.tsx
"use client";

import { Head, Link } from "@inertiajs/react";
import React from "react";
import { route } from 'ziggy-js';
import { HeartHandshake } from 'lucide-react';

export default function ThankYou() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-green-50">
            <Head title="Thank You for Voting" />
            <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-xl shadow-2xl border-t-8 border-green-500 text-center">
                <HeartHandshake className="h-20 w-20 text-green-600 mx-auto animate-bounce-slow" />
                <h2 className="text-4xl font-extrabold text-gray-900">Thank You!</h2>
                <p className="text-xl text-gray-600">
                    Your vote has been successfully cast and recorded.
                </p>
                <p className="text-sm text-gray-500">
                    You may now close this window.
                </p>
                <Link href={route('home')} className="inline-block">
                    <button
                        type="button"
                        className="py-3 px-6 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 mt-4"
                    >
                        Return to Homepage
                    </button>
                </Link>
            </div>
        </div>
    );
}
