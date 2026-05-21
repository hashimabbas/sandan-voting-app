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

// export default function RegisterOwner() {
//     return (
//         <AuthLayout title="Create an Owner account" description="Enter owner details to create your account">
//             <Head title="Register Owner" />

//             <Form
//                 {...RegisteredUserController.storeOwner.form()}
//                 resetOnSuccess={['password', 'password_confirmation']}
//                 disableWhileProcessing
//                 className="space-y-6 border p-6 rounded-lg shadow-sm bg-white"
//             >
//                 {({ processing, errors }) => (
//                     <>
//                         <h3 className="text-lg font-semibold text-center">Owner Details</h3>

//                         <div className="grid gap-2">
//                             <Label htmlFor="owner_name">Owner Name</Label>
//                             <Input id="owner_name" type="text" name="owner_name" placeholder="Full name" required />
//                             <InputError message={errors.owner_name} />
//                         </div>

//                         <div className="grid gap-2">
//                             <Label htmlFor="phone_number">Phone Number</Label>
//                             <Input id="phone_number" type="text" name="phone_number" placeholder="+96812345678" required />
//                             <InputError message={errors.phone_number} />
//                         </div>

//                         <div className="grid gap-2">
//                             <Label htmlFor="email">Email Address</Label>
//                             <Input id="email" type="email" name="email" placeholder="email@example.com" />
//                             <InputError message={errors.email} />
//                         </div>

//                         <div className="grid gap-2">
//                             <Label htmlFor="password">Password</Label>
//                             <Input id="password" type="password" name="password" placeholder="Password" />
//                             <InputError message={errors.password} />
//                         </div>

//                         <div className="grid gap-2">
//                             <Label htmlFor="password_confirmation">Confirm Password</Label>
//                             <Input
//                                 id="password_confirmation"
//                                 type="password"
//                                 name="password_confirmation"
//                                 placeholder="Confirm password"
//                             />
//                             <InputError message={errors.password_confirmation} />
//                         </div>

//                         <Button type="submit" className="w-full" disabled={processing}>
//                             {processing && <span className="animate-spin mr-2">⏳</span>}
//                             Create Owner Account
//                         </Button>
//                     </>
//                 )}
//             </Form>
//         </AuthLayout>
//     );
// }
