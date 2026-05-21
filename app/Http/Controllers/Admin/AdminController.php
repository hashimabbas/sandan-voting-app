<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User; // Ensure User model is imported
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Mail; // Import Mail facade
use App\Mail\AdminLoginOtpMail; // Import your Mailable
use Illuminate\Validation\ValidationException; // Import ValidationException
use Carbon\Carbon; // Import Carbon
use Illuminate\Support\Facades\Hash; // Import Hash facade for password checking

class AdminController extends Controller
{
    public function dashboard(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'message' => 'Welcome to the Admin Dashboard!'
        ]);
    }

    /**
     * Show the admin login form (email & password input).
     */
    public function showEmailLoginForm()
    {
        return Inertia::render('Auth/AdminLogin');
    }

    /**
     * Handle submission of email & password, then send OTP if credentials are correct.
     */
    public function sendEmailOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Check if 2FA is enabled
        $is2faEnabled = \App\Models\Setting::get('admin_2fa_enabled', '1') === '1';

        if (!$is2faEnabled) {
            Auth::guard('web')->login($user);
            $request->session()->regenerate();
            return redirect()->route('admin_dashboard')->with('success', 'Logged in successfully!');
        }

        // 2FA is enabled, proceed to generate and send OTP
        $otp = $user->generateOtp();

        try {
            Mail::to($user->email)->send(new AdminLoginOtpMail($otp));
        } catch (\Exception $e) {
            \Log::error("Failed to send Admin login OTP email to {$user->email}: " . $e->getMessage());
            return back()->with('error', 'Failed to send OTP email. Please try again.');
        }

        // Redirect to OTP verification form
        return redirect()->route('admin_show_email_otp_form', ['email' => $user->email])
            ->with('email', $user->email)
            ->with('success', 'OTP sent to your email.');
    }

    /**
     * Show the form for admin to enter OTP.
     */
    public function showEmailOtpForm(Request $request)
    {
        $email = $request->session()->get('email') ?? $request->input('email');
        if (!$email) {
            return redirect()->route('login')->with('error', 'Please re-enter your email to get an OTP.');
        }
        return Inertia::render('Auth/VerifyOtp', ['email' => $email]);
    }

    /**
     * Handle submission of OTP for verification and admin login.
     */
    public function verifyEmailOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp_code' => 'required|string|digits:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages(['email' => 'User not found.']);
        }

        if (!$user->verifyOtp($request->otp_code)) {
            throw ValidationException::withMessages(['otp_code' => 'Invalid or expired OTP.']);
        }

        // OTP is valid, clear it and log in the admin
        $user->clearOtp();
        Auth::guard('web')->login($user);

        $request->session()->regenerate();

        return redirect()->route('admin_dashboard')->with('success', 'Logged in successfully!');
    }

    /**
     * Log the admin out of the application.
     */
    public function logout(): RedirectResponse
    {
        Auth::guard('web')->logout();

        session()->invalidate();
        session()->regenerateToken();

        return redirect()->route('home')->with('success', 'Logged out successfully.');
    }
}
