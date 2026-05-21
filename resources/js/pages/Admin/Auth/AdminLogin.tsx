"use client";

import { useForm } from "@inertiajs/react";
import React from "react";
import { route } from 'ziggy-js';

export default function AdminLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("admin_send_email_otp"));
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl border border-gray-200">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Admin Login</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your email and password to receive a login OTP.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="your@example.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        {errors.password && (
                            <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {processing ? "Sending OTP..." : "Login & Get OTP"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
