<x-mail::message>
# Admin Login OTP

Your One-Time Password (OTP) for admin login is:

**{{ $otp }}**

This code is valid for 5 minutes. If you did not request this, please ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
