// resources/js/Pages/Voting/ThankYou.tsx
"use client";

import { Head, Link, usePage } from "@inertiajs/react";
import React from "react";
import { route } from 'ziggy-js';
import { HeartHandshake, ReceiptText, Home } from 'lucide-react'; // Added Home icon

interface ThankYouProps {
    election?: {
        title: string;
    };
    receiptCode?: string;
    voterIdNo?: string; // <--- NEW: Pass voterIdNo to ThankYou page
}

export default function ThankYou() {
    const { props } = usePage<ThankYouProps>();
    const electionTitle = props.election?.title || 'your election';
    const { receiptCode, voterIdNo } = props; // <--- Get receiptCode and voterIdNo from props

    return (
        <div className="flex items-center justify-center min-h-screen bg-green-50">
            <Head title="Thank You for Voting" />
            <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-xl shadow-2xl border-t-8 border-green-500 text-center">
                <HeartHandshake className="h-20 w-20 text-green-600 mx-auto animate-bounce-slow" />
                <h2 className="text-4xl font-extrabold text-gray-900">Thank You!</h2>
                <p className="text-xl text-gray-600">
                    Your vote for "{electionTitle}" has been successfully cast and recorded.
                </p>

                {receiptCode && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center">
                        <ReceiptText className="h-8 w-8 text-gray-700 mb-2" />
                        <p className="text-sm font-semibold text-gray-800">Your Vote Receipt Code:</p>
                        <code className="text-xs break-all bg-gray-200 p-2 rounded-md font-mono text-gray-700 mt-2">
                            {receiptCode}
                        </code>
                        <p className="text-xs text-gray-500 mt-2">Please keep this code for your records.</p>
                    </div>
                )}

                <p className="text-sm text-gray-500 mt-4">
                    You may now close this window.
                </p>

                {/* --- MODIFIED BUTTON --- */}
                <Link
                    href={route('receipt_verification_form', { // Redirect to verification form
                        voter_id_no: voterIdNo || '',      // Pass voter_id_no as query param
                        receipt_code: receiptCode || ''     // Pass receiptCode as query param
                    })}
                    className="inline-block"
                >
                    <button
                        type="button"
                        className="py-3 px-6 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 mt-4 flex items-center justify-center"
                    >
                        <ReceiptText className="h-5 w-5 mr-2" /> Verify My Vote Now
                    </button>
                </Link>

                <Link href={route('home')} className="inline-block mt-2">
                    <button
                        type="button"
                        className="py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 flex items-center justify-center"
                    >
                        <Home className="h-4 w-4 mr-2" /> Back to Homepage
                    </button>
                </Link>
                {/* --- END MODIFIED BUTTON --- */}
            </div>
        </div>
    );
}
