<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['required', 'in:admin,owner'],
            'email' => ['required_if:role,admin', 'string', 'email'],
            'username' => ['required_if:role,admin', 'string'],
            'password' => ['required_if:role,admin', 'string'],
            'phone_number' => ['required_if:role,owner', 'string'],
            'otp_code' => ['required_if:role,owner', 'string'],
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if ($this->role === 'admin') {
            $credentials = $this->only('username', 'password');

            if (! Auth::attempt($credentials, $this->boolean('remember'))) {
                RateLimiter::hit($this->throttleKey());
                throw ValidationException::withMessages([
                    'username' => __('auth.failed'),
                ]);
            }
        }

        if ($this->role === 'owner') {
            // Implement OTP check here
            $user = \App\Models\User::where('phone_number', $this->phone_number)->first();

            if (!$user || !$user->verifyOtp($this->otp_code)) {
                RateLimiter::hit($this->throttleKey());
                throw ValidationException::withMessages([
                    'otp_code' => __('auth.failed_otp'),
                ]);
            }

            Auth::login($user, $this->boolean('remember'));
        }

        RateLimiter::clear($this->throttleKey());
    }

    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) return;

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    public function throttleKey(): string
    {
        return ($this->role === 'admin' ? $this->string('username') : $this->string('phone_number'))
            ->lower()
            ->append('|'.$this->ip())
            ->transliterate()
            ->value();
    }
}
