// resources/js/Pages/Owner/Auth/Login.jsx
import { Head, useForm } from '@inertiajs/react'; // استيراد useForm
import React from 'react';
import { route } from 'ziggy-js';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        phone: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('owner_login_submit')); // استخدام route() إذا كنت تستخدم Ziggy
    };

    return (
        <>
            <Head title="Owner Login" />
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl border border-gray-200">
                    {/* هنا نقل محتوى ملف Blade */}
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Owner Login
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sign in to your owner account.
                        </p>
                    </div>

                    {/* عرض الأخطاء والرسائل (من Inertia) */}
                    {errors.phone && <div className="text-red-500 text-sm mt-2">{errors.phone}</div>}
                    {errors.password && <div className="text-red-500 text-sm mt-2">{errors.password}</div>}
                    {/* يمكنك عرض flash messages هنا أيضاً */}
                    {/* {flash.success && <div className="bg-green-100..."></div>} */}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <div className="mt-1">
                                <input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    autoComplete="tel"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="+96812345678"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                disabled={processing}
                            >
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
