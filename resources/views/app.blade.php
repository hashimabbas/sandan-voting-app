<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Forced Light Mode --}}
        <script>
            document.documentElement.classList.remove('dark');
        </script>

        {{-- Inline style to set the HTML background color to white --}}
        <style>
            html {
                background-color: white;
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/logo-transparent.png" type="image/png">
        <link rel="apple-touch-icon" href="/logo-transparent.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|cairo:400,500,600,700" rel="stylesheet" />

        {{-- Ziggy routes MUST be included BEFORE your app.tsx script --}}
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-white text-slate-900">
        @inertia

    </body>
</html>
