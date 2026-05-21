import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, Form } from '@inertiajs/react';
import { LoaderCircle, Smartphone, User } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    login_type?: 'owner' | 'admin' | 'mixed';
}

export default function Login({ status, canResetPassword, login_type }: LoginProps) {
    const [currentLoginType, setCurrentLoginType] = useState<'owner' | 'admin' | 'mixed'>(
        login_type ?? 'mixed'
    );

    return (
        <AuthLayout
            title="Log in to your account"
            description={
                currentLoginType === 'owner'
                    ? 'Enter your phone number and OTP to log in'
                    : currentLoginType === 'admin'
                        ? 'Enter your username and password to log in'
                        : 'Select your login type below'
            }
        >
            <Head title="Log in" />

            {currentLoginType === 'mixed' && (
                <div className="flex justify-center gap-4 mb-6">
                    <Button variant="outline" onClick={() => setCurrentLoginType('owner')}>
                        <Smartphone className="mr-2 h-4 w-4" /> Owner Login
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentLoginType('admin')}>
                        <User className="mr-2 h-4 w-4" /> Admin Login
                    </Button>
                </div>
            )}

            {/* Owner Login */}
            {(currentLoginType === 'owner' || currentLoginType === 'mixed') && (
                <Form
                    {...AuthenticatedSessionController.store.form({
                        role: 'owner',
                        phone_number: '',
                        otp_code: '',
                        remember: false,
                    })}
                    resetOnSuccess={['otp_code']}
                    className="space-y-6 border p-6 rounded-lg shadow-sm bg-white"
                >
                    {({ processing, errors }) => (
                        <>
                            <h3 className="text-lg font-semibold text-center">Owner Login</h3>

                            <div className="grid gap-2">
                                <Label htmlFor="phone_number">Phone Number</Label>
                                <Input
                                    id="phone_number"
                                    type="tel"
                                    name="phone_number"
                                    required
                                    placeholder="e.g. +96890000000"
                                    disabled={processing}
                                />
                                <InputError message={errors.phone_number} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="otp_code">OTP Code</Label>
                                <Input
                                    id="otp_code"
                                    type="text"
                                    name="otp_code"
                                    required
                                    placeholder="Enter OTP"
                                    disabled={processing}
                                />
                                <InputError message={errors.otp_code} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Owner Login
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                Need an admin account? <TextLink href="/login?type=admin">Log in as Admin</TextLink>
                            </div>
                        </>
                    )}
                </Form>
            )}

            {/* Admin Login */}
            {(currentLoginType === 'admin' || currentLoginType === 'mixed') && (
                <Form
                    {...AuthenticatedSessionController.store.form({
                        role: 'admin',
                        username: '',
                        password: '',
                        remember: false,
                    })}
                    resetOnSuccess={['password']}
                    className="space-y-6 border p-6 rounded-lg shadow-sm bg-white"
                >
                    {({ processing, errors }) => (
                        <>
                            <h3 className="text-lg font-semibold text-center">Admin Login</h3>

                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    name="username"
                                    required
                                    autoFocus={currentLoginType === 'admin'}
                                    placeholder="Your username"
                                    disabled={processing}
                                />
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="Password"
                                    disabled={processing}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Admin Login
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                Need to login as an owner? <TextLink href="/login?type=owner">Login as Owner</TextLink>
                            </div>
                        </>
                    )}
                </Form>
            )}

            {status && (
                <div className="mt-4 text-center text-sm font-medium text-green-600">{status}</div>
            )}
        </AuthLayout>
    );
}
