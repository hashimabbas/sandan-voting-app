// resources/js/Pages/Verification/Receipt.tsx
"use client";

import { useForm, Head, usePage } from "@inertiajs/react";
import React, { useEffect } from "react"; // Added useEffect
import { route } from 'ziggy-js';
import { ShieldCheck, AlertTriangle, Search } from 'lucide-react';
import AppLayoutPublic from '@/layouts/app-layout-public';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ReceiptVerificationProps {
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
    errors: {
        voter_id_no?: string;
        receipt_code?: string;
    };
    // NEW: Optional query parameters for pre-filling
    voter_id_no_qp?: string;
    receipt_code_qp?: string;
}

export default function ReceiptVerification() {
    const { props } = usePage<ReceiptVerificationProps>();
    const { voter_id_no_qp, receipt_code_qp } = props; // Get query params from props

    const { data, setData, post, processing, errors } = useForm({
        voter_id_no: voter_id_no_qp || "", // Pre-fill from query param
        receipt_code: receipt_code_qp || "", // Pre-fill from query param
    });

    // Effect to set data once props are available (e.g., on first load with query params)
    useEffect(() => {
        if (voter_id_no_qp && data.voter_id_no === "") {
            setData('voter_id_no', voter_id_no_qp);
        }
        if (receipt_code_qp && data.receipt_code === "") {
            setData('receipt_code', receipt_code_qp);
        }
    }, [voter_id_no_qp, receipt_code_qp]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("receipt_verify_post"));
    };

    const successMessage = props.flash?.success;
    const errorMessage = props.flash?.error || errors.receipt_code || errors.voter_id_no;


    return (
        <AppLayoutPublic>
            <Head title="Verify Vote Receipt" />
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-xl shadow-2xl border border-blue-200">
                    <div className="text-center">
                        <ShieldCheck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                        <h2 className="text-3xl font-extrabold text-gray-900">Verify Your Vote</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter your Voter ID and Receipt Code to confirm your vote was recorded.
                        </p>
                    </div>

                    {successMessage && (
                        <div className="rounded-md bg-green-100 border border-green-400 p-3 text-green-800 font-medium flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" /> {successMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div className="rounded-md bg-red-100 border border-red-400 p-3 text-red-800 font-medium flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" /> {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="voter_id_no" className="block text-sm font-medium text-gray-700">
                                Voter ID / National ID
                            </label>
                            <div className="mt-1">
                                <Input
                                    id="voter_id_no"
                                    name="voter_id_no"
                                    type="text"
                                    required
                                    value={data.voter_id_no}
                                    onChange={(e) => setData("voter_id_no", e.target.value)}
                                    placeholder="Your Unique Voter ID or National ID"
                                />
                            </div>
                            {errors.voter_id_no && (
                                <p className="mt-2 text-sm text-red-600">{errors.voter_id_no}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="receipt_code" className="block text-sm font-medium text-gray-700">
                                Vote Receipt Code
                            </label>
                            <div className="mt-1">
                                <Input
                                    id="receipt_code"
                                    name="receipt_code"
                                    type="text"
                                    maxLength={64}
                                    required
                                    value={data.receipt_code}
                                    onChange={(e) => setData("receipt_code", e.target.value)}
                                    placeholder="Paste your 64-character receipt code here"
                                />
                            </div>
                            {errors.receipt_code && (
                                <p className="mt-2 text-sm text-red-600">{errors.receipt_code}</p>
                            )}
                        </div>

                        <div>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                            >
                                {processing ? (
                                    'Verifying...'
                                ) : (
                                    <><Search className="h-5 w-5 mr-2" /> Verify Vote</>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayoutPublic>
    );
}
