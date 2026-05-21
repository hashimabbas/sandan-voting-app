// resources/js/Pages/Voting/VoterLogin.tsx
"use client";

import { useForm, Head, usePage } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import { route } from 'ziggy-js';
import { Users, AlertTriangle, Send, CheckCircle, LoaderCircle } from 'lucide-react';

// Props Interface to receive data from the controller
interface VoterLoginProps {
    voter_id_no?: string; // Passed from backend after sending OTP
    otpSent?: boolean; // Indicates we should show the OTP step
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
    errors: {
        voter_id_no?: string;
        otp?: string;
        global?: string; // For general errors like voting closed
    };
}

export default function VoterLogin() {
    const { props } = usePage<VoterLoginProps>();
    const { voter_id_no: initialVoterIdNo, otpSent: initialOtpSent } = props;

    // State for managing the current form step
    const [step, setStep] = useState(initialOtpSent ? 2 : 1);

    // Inertia form to handle Step 1: Send OTP request
    const sendOtpForm = useForm({
        voter_id_no: initialVoterIdNo || "",
    });

    // Inertia form to handle Step 2: Verify OTP
    const verifyOtpForm = useForm({
        voter_id_no: initialVoterIdNo || "",
        otp: "",
    });

    // Effect to update forms when initial props change (e.g., redirect from backend)
    useEffect(() => {
        if (initialVoterIdNo) {
            sendOtpForm.setData('voter_id_no', initialVoterIdNo);
            verifyOtpForm.setData('voter_id_no', initialVoterIdNo);
        }
        if (initialOtpSent) {
            setStep(2);
        } else {
            setStep(1);
        }
    }, [initialVoterIdNo, initialOtpSent]);


    // Step 1 Submission Handler: Request OTP
    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        sendOtpForm.post(route("vote_send_otp"), {
            preserveScroll: true,
            onSuccess: (page) => {
                // Controller will redirect back with 'otpSent: true' and 'voter_id_no' in props
                // Inertia automatically updates page props, so useEffect handles state change
            },
            onError: (errors) => {
                // If there's a global error, it might not be tied to a specific field
                if (errors.global) {
                    // This will be caught by the general flash error display
                }
            },
        });
    };

    // Step 2 Submission Handler: Verify OTP
    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        verifyOtpForm.post(route("vote_verify_otp"), {
            preserveScroll: true,
            onSuccess: (page) => {
                // If successful, controller redirects to the ballot page, Inertia handles it.
            },
        });
    };

    // Consolidated Error and Message display logic
    const successMessage = props.flash?.success;
    const errorMessage = props.flash?.error || props.errors.global;

    return (
        <div className="flex items-center justify-center min-h-screen bg-indigo-50">
            <Head title={step === 1 ? "Start Your Vote" : "Verify OTP"} />
            <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-xl shadow-2xl border border-indigo-200">
                <div className="text-center">
                    <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-3xl font-extrabold text-gray-900">Start Your Vote</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 1
                            ? "Enter your Voter ID / National ID to receive a verification code."
                            : `Enter the 6-digit code sent to your registered phone for ID: ${verifyOtpForm.data.voter_id_no}.`}
                    </p>
                </div>

                {/* Global Error/Success Display */}
                {successMessage && (
                    <div className="rounded-md bg-green-100 border border-green-400 p-3 text-green-800 font-medium flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" /> {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="rounded-md bg-red-100 border border-red-400 p-3 text-red-800 font-medium flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> {errorMessage}
                    </div>
                )}


                {step === 1 ? (
                    // Step 1: Enter Voter ID / National ID
                    <form onSubmit={handleSendOtp} className="space-y-6">
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
                                    value={sendOtpForm.data.voter_id_no}
                                    onChange={(e) => sendOtpForm.setData("voter_id_no", e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base"
                                    placeholder="Your Unique Voter ID or National ID"
                                />
                            </div>
                            {sendOtpForm.errors.voter_id_no && (
                                <p className="mt-2 text-sm text-red-600">{sendOtpForm.errors.voter_id_no}</p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={sendOtpForm.processing}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                            >
                                {sendOtpForm.processing ? (
                                    <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                                ) : (
                                    <><Send className="h-5 w-5 mr-2" /> Request OTP</>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    // Step 2: Enter OTP
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <input type="hidden" name="voter_id_no" value={verifyOtpForm.data.voter_id_no} />
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                OTP (One-Time Password)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    maxLength="6"
                                    required
                                    value={verifyOtpForm.data.otp}
                                    onChange={(e) => verifyOtpForm.setData("otp", e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base text-center tracking-widest"
                                    placeholder="------"
                                />
                            </div>
                            {verifyOtpForm.errors.otp && (
                                <p className="mt-2 text-sm text-red-600">{verifyOtpForm.errors.otp}</p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={verifyOtpForm.processing}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                            >
                                {verifyOtpForm.processing ? (
                                    <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                                ) : (
                                    <><CheckCircle className="h-5 w-5 mr-2" /> Verify OTP</>
                                )}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setStep(1); // Go back to step 1
                                sendOtpForm.setData('voter_id_no', verifyOtpForm.data.voter_id_no); // Keep ID pre-filled
                                verifyOtpForm.reset('otp'); // Clear OTP field
                            }}
                            disabled={verifyOtpForm.processing}
                            className="w-full text-sm text-indigo-600 hover:underline mt-4"
                        >
                            Request new OTP or change ID
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
