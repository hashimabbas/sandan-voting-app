<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $ziggy = class_exists(Ziggy::class) ? (new Ziggy)->toArray() : null;

        $authenticatedUser = null;
        if (Auth::guard('web')->check()) {
            $authenticatedUser = Auth::guard('web')->user();
        } else if (Auth::guard('owner')->check()) {
            $authenticatedUser = Auth::guard('owner')->user();
        }

        $userForFrontend = null;
        $userPermissions = [];
        $userRoles = [];
        $globalCan = []; // Global object for checking permissions

        if ($authenticatedUser) {
            if ($authenticatedUser instanceof \App\Models\User) { // Admin User
                $userForFrontend = [
                    'id' => $authenticatedUser->id,
                    'name' => $authenticatedUser->name,
                    'email' => $authenticatedUser->email,
                    'photo' => $authenticatedUser->photo ? asset('storage/' . $authenticatedUser->photo) : null,
                    'type' => 'admin',
                    'roles' => $authenticatedUser->getRoleNames(),
                    'permissions' => $authenticatedUser->getAllPermissions()->pluck('name'),
                ];
                // Hydrate the global 'can' object for permissions efficiently
                // 1. Get all available permission names for the 'web' guard once
                $allPermissionNames = Permission::where('guard_name', 'web')->pluck('name');

                // 2. Map them using the user's actual permissions (this is much faster than calling can() in a loop)
                $userPermissions = $authenticatedUser->getAllPermissions()->pluck('name')->flip()->map(fn() => true);

                foreach ($allPermissionNames as $permissionName) {
                    $globalCan[$permissionName] = isset($userPermissions[$permissionName]);
                }

                // Additional checks for specific flags if they are not standard permissions
                $globalCan['viewDashboard'] = $globalCan['viewDashboard'] ?? $authenticatedUser->can('viewDashboard');
                $globalCan['assignRoles'] = $globalCan['assignRoles'] ?? $authenticatedUser->hasPermissionTo('assignRoles');

            } elseif ($authenticatedUser instanceof \App\Models\Owner) { // Owner User
                $userForFrontend = [
                    'id' => $authenticatedUser->id,
                    'name' => $authenticatedUser->name,
                    'phone' => $authenticatedUser->phone,
                    'owner_id_no' => $authenticatedUser->owner_id_no,
                    'photo' => $authenticatedUser->photo,
                    'type' => 'owner',
                    // Owners typically don't have Spatie roles/permissions, but if they did, you'd add them here
                ];
                // Owner-specific 'can' if needed
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $userForFrontend,
            ],
            'can' => $globalCan,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'ziggy' => $ziggy,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'info'    => fn () => $request->session()->get('info'),
            ],
        ];
    }
}
