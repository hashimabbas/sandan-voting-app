"use client";

import { useForm } from "@inertiajs/react";
import React from "react";
import { route } from 'ziggy-js';

interface VerifyOtpProps {
    email: string;
}

export default function VerifyOtp({ email }: VerifyOtpProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: email,
        otp_code: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("admin_verify_email_otp"));
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl border border-gray-200">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Verify Your Login
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        An OTP has been sent to your email:{" "}
                        <strong className="text-indigo-600">{email}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input type="hidden" name="email" value={email} />

                    <div>
                        <label
                            htmlFor="otp_code"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Enter OTP
                        </label>
                        <div className="mt-1">
                            <input
                                id="otp_code"
                                name="otp_code"
                                type="text"
                                required
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={data.otp_code}
                                onChange={(e) => setData("otp_code", e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="••••••"
                            />
                        </div>
                        {errors.otp_code && (
                            <p className="mt-2 text-sm text-red-600">{errors.otp_code}</p>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {processing ? "Verifying..." : "Verify OTP"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
