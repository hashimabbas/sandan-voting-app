import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

export default function OwnerLogin() {
    return (
        <AuthLayout
            title="Owner Login"
            description="Enter your phone number and OTP to log in"
        >
            <Head title="Owner Login" />

            <Form
                {...AuthenticatedSessionController.store.form()}
                resetOnSuccess={['otp_code']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Hidden role field */}
                        <input type="hidden" name="role" value="owner" />

                        <div className="grid gap-2">
                            <Label htmlFor="phone_number">Phone Number</Label>
                            <Input id="phone_number" type="text" name="phone_number" required />
                            <InputError message={errors.phone_number} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="otp_code">OTP Code</Label>
                            <Input id="otp_code" type="text" name="otp_code" required />
                            <InputError message={errors.otp_code} />
                        </div>

                        <Button type="submit" className="mt-4 w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Log in as Owner
                        </Button>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
