<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Verify OTP</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Vite CSS/JS (assuming you're using Vite for assets) -->
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body class="font-sans antialiased bg-gray-100 flex items-center justify-center min-h-screen">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl border border-gray-200">
        <div class="text-center">
            <h2 class="text-3xl font-extrabold text-gray-900">
                Verify Your Login
            </h2>
            <p class="mt-2 text-sm text-gray-600">
                An OTP has been sent to your email: <strong class="text-indigo-600">{{ $email }}</strong>
            </p>
        </div>

        {{-- Flash Messages --}}
        @if (session('success'))
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong class="font-bold">Success!</strong>
                <span class="block sm:inline">{{ session('success') }}</span>
            </div>
        @endif
        @if (session('error'))
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong class="font-bold">Error!</strong>
                <span class="block sm:inline">{{ session('error') }}</span>
            </div>
        @endif
        @if ($errors->any())
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong class="font-bold">Whoops!</strong>
                <span class="block sm:inline">There were some problems with your input.</span>
                <ul class="mt-2 list-disc list-inside text-sm">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form action="{{ route('admin_verify_email_otp') }}" method="post" class="space-y-6">
            @csrf

            {{-- Hidden field to pass email context --}}
            <input type="hidden" name="email" value="{{ $email }}">

            <div>
                <label for="otp_code" class="block text-sm font-medium text-gray-700">Enter OTP</label>
                <div class="mt-1">
                    <input
                        id="otp_code"
                        name="otp_code"
                        type="text"
                        required
                        inputmode="numeric" {{-- Suggest numeric keyboard --}}
                        pattern="[0-9]*" {{-- Restrict to numbers --}}
                        maxlength="6"
                        class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="••••••"
                        value="{{ old('otp_code') }}"
                    >
                </div>
                @error('otp_code')
                    <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>

            <div>
                <button
                    type="submit"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Verify OTP
                </button>
            </div>
        </form>
    </div>
</body>
</html>
