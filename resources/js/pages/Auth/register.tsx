import React, { useState, FormEvent } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';

// Icons
import { LoaderCircle, User, Smartphone } from 'lucide-react';

// Layouts
import AuthLayout from '@/layouts/auth-layout';

// Types
import { PageProps } from '@inertiajs/core';

declare global {
    interface PageProps {
        ziggy?: {
            routes: { [key: string]: any };
        };
    }
}

interface PageData extends PageProps<{ roles?: UserRole[]; status?: string }> { }

enum UserRole {
    Owner = 'owner',
    Admin = 'admin',
}

// Form types
interface OwnerFormData {
    owner_name: string;
    phone_number: string;
    owner_id_no: string;
    email: string;
    password: string;
    password_confirmation: string;
}

interface AdminFormData {
    name: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function Register({ roles }: { roles?: UserRole[] }) {
    const { props } = usePage<PageData>();

    const route = (name: string, params?: any, absolute?: boolean): string => {
        if (!props.ziggy || !props.ziggy.routes || !props.ziggy.routes[name]) {
            console.warn(`Route "${name}" not found in Ziggy data.`);
            return `/fallback/${name}`;
        }
        let url = props.ziggy.routes[name].uri;
        if (params) {
            for (const key in params) {
                url = url.replace(`:${key}`, params[key]);
            }
        }
        return url;
    };

    const [role, setRole] = useState<UserRole>(UserRole.Owner);

    // Forms
    const ownerForm = useForm<OwnerFormData>({
        owner_name: '',
        phone_number: '',
        owner_id_no: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const adminForm = useForm<AdminFormData>({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleOwnerRegistration = (e: FormEvent) => {
        e.preventDefault();
        ownerForm
            .transform((data) => ({
                ...data,
                role: UserRole.Owner,
            }))
            .post(route('register'), {
                onSuccess: () => {
                    ownerForm.reset();
                    alert('Registration successful! Please check your phone for login instructions.');
                    router.visit(route('login', { type: 'owner' }));
                },
            });
    };

    const handleAdminRegistration = (e: FormEvent) => {
        e.preventDefault();
        adminForm.transform((data) => ({
            ...data,
            role: UserRole.Admin,
        }));

        adminForm.post(route('register'), {
            onSuccess: () => {
                adminForm.reset();
                alert('Admin account created successfully!');
                router.visit(route('login', { type: 'admin' }));
            },
            onError: (err) => {
                console.error('Admin registration failed:', err);
            },
        });

    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />

            <div className="flex flex-col gap-4">
                <div className="flex justify-center gap-4 mb-4">
                    <Button
                        variant={role === UserRole.Owner ? 'default' : 'outline'}
                        onClick={() => setRole(UserRole.Owner)}
                        className="flex items-center gap-2"
                    >
                        <Smartphone className="h-4 w-4" /> Register as Owner
                    </Button>
                    <Button
                        variant={role === UserRole.Admin ? 'default' : 'outline'}
                        onClick={() => setRole(UserRole.Admin)}
                        className="flex items-center gap-2"
                    >
                        <User className="h-4 w-4" /> Register as Admin
                    </Button>
                </div>

                {role === UserRole.Owner && (
                    <form
                        onSubmit={handleOwnerRegistration}
                        className="space-y-6 border p-6 rounded-lg shadow-sm bg-white"
                    >
                        <h3 className="text-lg font-semibold text-center">Owner Details</h3>

                        <div className="grid gap-2">
                            <Label htmlFor="owner_name">Full Name</Label>
                            <Input
                                id="owner_name"
                                type="text"
                                value={ownerForm.data.owner_name}
                                onChange={(e) => ownerForm.setData('owner_name', e.target.value)}
                                placeholder="Full name"
                                required
                                autoComplete="name"
                                name="owner_name"
                            />
                            <InputError message={ownerForm.errors.owner_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="owner_phone_number">Phone Number</Label>
                            <Input
                                id="owner_phone_number"
                                type="tel"
                                value={ownerForm.data.phone_number}
                                onChange={(e) => ownerForm.setData('phone_number', e.target.value)}
                                placeholder="e.g., +1234567890"
                                required
                                autoComplete="tel"
                                name="phone_number"
                            />
                            <InputError message={ownerForm.errors.phone_number} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="owner_id_no">ID Number</Label>
                            <Input
                                id="owner_id_no"
                                type="text"
                                value={ownerForm.data.owner_id_no}
                                onChange={(e) => ownerForm.setData('owner_id_no', e.target.value)}
                                placeholder="e.g., 1082705"
                                name="owner_id_no"
                            />
                            <InputError message={ownerForm.errors.owner_id_no} />
                        </div>

                        <Button type="submit" className="w-full" disabled={ownerForm.processing}>
                            {ownerForm.processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Register as Owner
                        </Button>
                    </form>
                )}

                {role === UserRole.Admin && (
                    <form
                        onSubmit={handleAdminRegistration}
                        className="space-y-6 border p-6 rounded-lg shadow-sm bg-white"
                    >
                        <h3 className="text-lg font-semibold text-center">Admin Details</h3>

                        <div className="grid gap-2">
                            <Label htmlFor="admin_name">Admin Name</Label>
                            <Input
                                id="admin_name"
                                type="text"
                                value={adminForm.data.name}
                                onChange={(e) => adminForm.setData('name', e.target.value)}
                                placeholder="Admin's full name"
                                required
                                autoComplete="name"
                                name="name"
                            />
                            <InputError message={adminForm.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="admin_username">Username</Label>
                            <Input
                                id="admin_username"
                                type="text"
                                value={adminForm.data.username}
                                onChange={(e) => adminForm.setData('username', e.target.value)}
                                placeholder="Choose a username"
                                required
                                autoComplete="username"
                                name="username"
                            />
                            <InputError message={adminForm.errors.username} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="admin_email">Email Address</Label>
                            <Input
                                id="admin_email"
                                type="email"
                                value={adminForm.data.email}
                                onChange={(e) => adminForm.setData('email', e.target.value)}
                                placeholder="email@example.com"
                                required
                                autoComplete="email"
                                name="email"
                            />
                            <InputError message={adminForm.errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="admin_password">Password</Label>
                            <Input
                                id="admin_password"
                                type="password"
                                value={adminForm.data.password}
                                onChange={(e) => adminForm.setData('password', e.target.value)}
                                placeholder="Password"
                                required
                                autoComplete="new-password"
                                name="password"
                            />
                            <InputError message={adminForm.errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="admin_password_confirmation">Confirm Password</Label>
                            <Input
                                id="admin_password_confirmation"
                                type="password"
                                value={adminForm.data.password_confirmation}
                                onChange={(e) => adminForm.setData('password_confirmation', e.target.value)}
                                placeholder="Confirm password"
                                required
                                autoComplete="new-password"
                                name="password_confirmation"
                            />
                            <InputError message={adminForm.errors.password_confirmation} />
                        </div>

                        <Button type="submit" className="w-full" disabled={adminForm.processing}>
                            {adminForm.processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Create Admin Account
                        </Button>
                    </form>
                )}

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={route('login')}>Log in</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
