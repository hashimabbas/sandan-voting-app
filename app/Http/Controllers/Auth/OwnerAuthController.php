<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Owner;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OwnerAuthController extends Controller
{
    // Step 1: Send OTP
    public function sendOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|max:20',
        ], [
            'phone.required' => 'رقم الهاتف مطلوب.',
        ]);

        // --- Start Robust Phone Number Normalization ---
        $inputPhone = $request->phone;
        $cleanPhone = preg_replace('/[^0-9]/', '', $inputPhone); // Strip all non-digits

        $ownerPhone = $cleanPhone; // Start with the fully cleaned number

        // If it starts with '00968', remove '00'
        if (Str::startsWith($ownerPhone, '00968')) {
            $ownerPhone = Str::after($ownerPhone, '00'); // result: 968XXXXXXXX
        }
        // If it starts with '+968', remove '+'
        else if (Str::startsWith($ownerPhone, '968') && strlen($ownerPhone) == 12) {
            $ownerPhone = Str::after($ownerPhone, '968'); // Assuming input was '+968XXXXXXXX' and it became '968968XXXXXXXX' from previous strip.
                                                           // This needs to be very careful not to strip '968' if it was part of the canonical form.
            // Let's re-think this. The str_replace at the start already removes '+'
            // So if input was "+96812345678", cleanPhone would be "96812345678" (11 digits)
            // This case for removing +968 is likely not needed after preg_replace
        }


        // Ensure it has the '968' prefix and is 11 digits for Oman numbers
        if (strlen($ownerPhone) === 8) { // Assuming 8-digit local numbers
            $ownerPhone = '968' . $ownerPhone; // Prepend '968'
        } else if (strlen($ownerPhone) === 11 && Str::startsWith($ownerPhone, '968')) {
            // Already in canonical 968XXXXXXXX format, do nothing
        } else {
            // This means the number is neither 8 digits (without 968) nor 11 digits (with 968)
            // It could be an invalid input or another international format not handled.
            Log::warning("Phone number after cleaning is not standard Oman format (8 or 11 digits starting with 968): {$inputPhone} -> {$ownerPhone}");
            return back()->with([
                'error' => 'تنسيق رقم الهاتف غير صالح. يرجى إدخال رقم هاتف عماني صحيح.',
                'phone' => $inputPhone, // Return original input for user
                'otpSent' => false,
            ]);
        }
        // --- End Robust Phone Number Normalization ---

        // dd($ownerPhone); // <--- Add this back for one final test to confirm the value before query

        $owner = Owner::where('phone', $ownerPhone)->first();

        if (!$owner) {
            Log::warning("OTP attempt for unregistered phone: {$ownerPhone}");
            return back()->with([
                'error' => 'رقم الهاتف غير مسجل لدينا. يرجى الاتصال بالإدارة للتسجيل.',
                'phone' => $request->phone, // Pass original phone back to maintain input
                'otpSent' => false,
            ]);
        }

        // Generate OTP (6 digits)
        $otp = rand(100000, 999999);

        $owner->update([
            'otp_code' => $otp,
            'otp_expires_at' => Carbon::now()->addMinutes(5),
        ]);

        $username = env('ISMARTSMS_USERNAME');
        $password = env('ISMARTSMS_PASSWORD');
        $sender   = env('ISMARTSMS_SENDER');
        $message  = "Your OTP code is: {$otp}. Sandan Property.";
        $apiMobileNo = $ownerPhone; // Use the properly formatted phone for SMS API

        Log::info("Attempting to send SMS via iSmartSMS:", [
            "UserId"   => $username,
            "Password" => '********',
            "SenderId" => $sender,
            "MobileNo" => $apiMobileNo,
            "Lang" => 0,
            "Message"  => $message,
        ]);

        try {
            $response = Http::get("https://ismartsms.net/iBulkSMS/HttpWS/SMSDynamicAPI.aspx", [
                 "UserId"   => $username,
                 "Password" => $password,
                 "SenderId" => $sender,
                 "MobileNo" => $apiMobileNo,
                 "Lang" => 0,
                 "Message"  => $message,
                 "Flag"     => "0"
            ]);

            Log::info("iSmartSMS API Response Status: " . $response->status());
            Log::info("iSmartSMS API Response Body: " . $response->body());

            // --- You need to adjust this success check based on iSmartSMS documentation ---
            // Assuming '1' is the success code, '15' is an error, etc.
            if ($response->successful() && trim($response->body()) === '1') { // Example success check
                Log::info("SMS successfully initiated by iSmartSMS for phone: {$ownerPhone}");
                return back()->with([
                    'success' => 'تم إرسال رمز التحقق إلى رقمك بنجاح.',
                    'phone' => $ownerPhone,
                    'otpSent' => true,
                ]);
            } else {
                $responseCode = trim($response->body());
                $errorMessage = "فشل إرسال رمز التحقق: iSmartSMS responded with code: " . $responseCode;
                // Add more specific messages based on documentation
                if ($responseCode === '15') {
                    $errorMessage = "فشل إرسال رمز التحقق: بيانات اعتماد غير صالحة أو رصيد غير كافٍ. (Code 15)";
                } // Add other known error codes
                Log::error("SMS sending failed from iSmartSMS for phone: {$ownerPhone}. Response: {$responseCode}");
                return back()->with([
                    'error' => $errorMessage,
                    'phone' => $request->phone, // Return original input for user
                    'otpSent' => false,
                ]);
            }

        } catch (\Exception $e) {
            Log::error("Exception when calling iSmartSMS API: " . $e->getMessage(), ['phone' => $ownerPhone, 'exception' => $e]);
            return back()->with([
                'error' => 'فشل إرسال رمز التحقق بسبب خطأ بالنظام. الرجاء المحاولة مرة أخرى.',
                'phone' => $request->phone, // Return original input for user
                'otpSent' => false,
            ]);
        }
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'otp'   => 'required|string',
        ]);

        // Re-apply normalization to the phone coming from the hidden field to ensure consistency
        $cleanPhone = preg_replace('/[^0-9]/', '', $request->phone); // Strip all non-digits
        $ownerPhone = $cleanPhone;

        if (strlen($ownerPhone) === 8) {
            $ownerPhone = '968' . $ownerPhone;
        } else if (Str::startsWith($ownerPhone, '00968')) {
            $ownerPhone = Str::after($ownerPhone, '00');
        } // No need to handle 11-digit 968XXXXXXXX specifically, it will be untouched

        $owner = Owner::where('phone', $ownerPhone)->first();

        if (!$owner) {
            return back()->withErrors(['global' => 'Owner not found with this phone number. Please try sending OTP again.'])->withInput(['phone' => $request->phone]);
        }

        if ($owner->otp_code !== $request->otp || Carbon::now()->gt($owner->otp_expires_at)) {
            return back()->withErrors(['otp' => 'رمز التحقق غير صحيح أو منتهي الصلاحية.'])->withInput(['phone' => $request->phone]);
        }

        $owner->update([
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);

        auth()->guard('owner')->login($owner);

        return redirect()->route('owner_dashboard')->with('success', 'تم تسجيل الدخول بنجاح!');
    }
}

// namespace App\Http\Controllers\Auth;

// use App\Http\Controllers\Controller;
// use App\Models\Owner;
// use Carbon\Carbon;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Http;



// use Illuminate\Support\Facades\Auth; // Import Auth facade
// use Illuminate\Support\Facades\Hash; // Import Hash facade
// use Illuminate\Validation\ValidationException; // Import ValidationException
// use Illuminate\Http\RedirectResponse; // For explicit return type hint

// class OwnerAuthController extends Controller
// {
//     /**
//      * Show the owner login form.
//      */
//     public function showLoginForm()
//     {
//         // For blade views, you return view()
//         return Inertia::render('Owner/Auth/Login');
//         // If you were to use Inertia:
//         // return Inertia::render('OwnerLogin');
//     }

//     /**
//      * Handle an incoming owner authentication request.
//      *
//      * @throws \Illuminate\Validation\ValidationException
//      */
//     public function login(Request $request): RedirectResponse
//     {
//         $request->validate([
//             'phone'    => ['required', 'string'],
//             'password' => ['required', 'string'],
//         ]);

//         // Attempt to find the owner by phone and verify password
//         $owner = Owner::where('phone', $request->phone)->first();

//         if (!$owner || !Hash::check($request->password, $owner->password)) {
//             throw ValidationException::withMessages([
//                 'phone' => ['The provided credentials do not match our records.'],
//             ]);
//         }

//         // Log the owner in using the 'owner' guard
//         Auth::guard('owner')->login($owner, $request->boolean('remember'));

//         $request->session()->regenerate();

//         // Redirect to owner dashboard or intended page
//         return redirect()->intended(route('owner_dashboard'))->with('success', 'Logged in successfully!');
//     }

//     /**
//      * Log the owner out of the application.
//      */
//     public function logout(Request $request): RedirectResponse
//     {
//         Auth::guard('owner')->logout();

//         $request->session()->invalidate();
//         $request->session()->regenerateToken();

//         return redirect()->route('owner_login')->with('success', 'You have been logged out.');
//     }

//     // Removed the sendOtp and verifyOtp methods completely for this temporary setup.
// }
