// resources/js/Pages/Voting/Verification.tsx
"use client";

import { useForm, Head, usePage } from "@inertiajs/react";
import React from "react";
import { route } from 'ziggy-js';
import { Users, Code, AlertTriangle } from 'lucide-react';

export default function Verification() {
    const { props: { errors, flash } } = usePage(); // Get validation errors and flash messages

    // Global errors from server (e.g., voting closed, invalid token from redirect)
    const globalError = errors.global || flash?.error;

    const { data, setData, post, processing, errors: formErrors } = useForm({
        voter_id_no: "", // Maps to the backend's voter_id_no field for National ID
        unit_code: "",  // Maps to the unit_code field for unit verification
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // The backend route vote_verify_voter will check voter_id_no and unit_code
        post(route("vote_verify_voter"));
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-indigo-50">
            <Head title="Start Voting Verification" />
            <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-xl shadow-2xl border border-indigo-200">
                <div className="text-center">
                    <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-3xl font-extrabold text-gray-900">Start Your Vote</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your Voter ID / National ID and one of your Unit Codes to proceed to the ballot.
                    </p>
                </div>

                {/* Global Error Display (e.g., Voting Closed, Invalid Token) */}
                {globalError && (
                    <div className="rounded-md bg-red-100 border border-red-400 p-3 text-red-800 font-medium flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> {globalError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="voter_id_no" className="block text-sm font-medium text-gray-700">
                            Voter ID / National ID
                        </label>
                        <div className="mt-1">
                            <input
                                id="voter_id_no"
                                name="voter_id_no"
                                type="text"
                                required
                                value={data.voter_id_no}
                                onChange={(e) => setData("voter_id_no", e.target.value)}
                                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base"
                                placeholder="Your Unique Voter ID or National ID"
                            />
                        </div>
                        {formErrors.voter_id_no && (
                            <p className="mt-2 text-sm text-red-600">{formErrors.voter_id_no}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="unit_code" className="block text-sm font-medium text-gray-700">
                            Unit Code
                        </label>
                        <div className="mt-1 flex items-center">
                            <Code className="h-5 w-5 text-gray-400 absolute ml-3" />
                            <input
                                id="unit_code"
                                name="unit_code"
                                type="text"
                                required
                                value={data.unit_code}
                                onChange={(e) => setData("unit_code", e.target.value)}
                                className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base"
                                placeholder="e.g., A101 or 02/G002"
                            />
                        </div>
                        {formErrors.unit_code && (
                            <p className="mt-2 text-sm text-red-600">{formErrors.unit_code}</p>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                        >
                            {processing ? "Verifying..." : "Verify & Go to Ballot"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
