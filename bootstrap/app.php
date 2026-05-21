<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Cookie encryption exceptions
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Redirect guests to admin login
        $middleware->redirectTo(
            guests: '/admin/login',
            users: '/admin/dashboard'
        );

        // ✅ Add your middleware aliases here
        $middleware->alias([
            'web' => \App\Http\Middleware\User::class,
            'owner' => \App\Http\Middleware\Owner::class,

            // 🟡 Add Spatie Permission middleware aliases 👇
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'voting.check' => \App\Http\Middleware\CheckVotingStatus::class,
        ]);

        // Global web middleware stack
        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
