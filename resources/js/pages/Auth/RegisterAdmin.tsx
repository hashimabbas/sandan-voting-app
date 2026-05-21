// import React from 'react';
// import { Head, Form } from '@inertiajs/react';

// // UI Components
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import InputError from '@/components/input-error';

// // Layout
// import AuthLayout from '@/layouts/auth-layout';
// import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';

// export default function RegisterAdmin() {
//     return (
//         <AuthLayout title="Create an Admin account" description="Enter admin details to create your account">
//             <Head title="Register Admin" />

//             <Form
//                 {...RegisteredUserController.storeAdmin.form()}
//                 resetOnSuccess={['password', 'password_confirmation']}
//                 disableWhileProcessing
//                 className="space-y-6 border p-6 rounded-lg shadow-sm bg-white"
//             >
//                 {({ processing, errors }) => (
//                     <>
//                         <h3 className="text-lg font-semibold text-center">Admin Details</h3>

//                         <div className="grid gap-2">
//                             <Label htmlFor="name">Admin Name</Label>
//                             <Input id="name" type="text" name="name" placeholder="Full name" required />
//                             <InputError message={errors.name} />
//                         </div>

//                         <div className="grid gap-2">
//                             <Label htmlFor="username">Username</Label>
//                             <Input id="username" type="text" name="username" placeholder="Username" required />
//                             <InputError message={errors.username} />
//                         </div>

//                         <div className="grid gap-2">
//                             <Label htmlFor="email">Email Address</Label>
//                             <Input id="email" type="email" name="email" placeholder="email@example.com" required />
//                             <InputError message={errors.email} />
//                         </div>

//                         <div className="grid gap-2">
//                             <Label htmlFor="password">Password</Label>
//                             <Input id="password" type="password" name="password" placeholder="Password" required />
//                             <InputError message={errors.password} />
//                         </div>

//                         <div className="grid gap-2">
//                             <Label htmlFor="password_confirmation">Confirm Password</Label>
//                             <Input
//                                 id="password_confirmation"
//                                 type="password"
//                                 name="password_confirmation"
//                                 placeholder="Confirm password"
//                                 required
//                             />
//                             <InputError message={errors.password_confirmation} />
//                         </div>

//                         <Button type="submit" className="w-full" disabled={processing}>
//                             {processing && <span className="animate-spin mr-2">⏳</span>}
//                             Create Admin Account
//                         </Button>
//                     </>
//                 )}
//             </Form>
//         </AuthLayout>
//     );
// }
