<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Auth;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:assignRoles');
    }

    public function index(): Response
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all()->groupBy(function($perm) {
            $name = strtolower($perm->name);
            if (str_contains($name, 'user') || str_contains($name, 'role')) return 'Personnel & Roles';
            if (str_contains($name, 'election') || str_contains($name, 'voting') || str_contains($name, 'candidate')) return 'Election Management';
            if (str_contains($name, 'owner')) return 'Owner Registry';
            if (str_contains($name, 'unit')) return 'Unit Management';
            if (str_contains($name, 'report') || str_contains($name, 'export')) return 'Analytics & Reports';
            if (str_contains($name, 'setting') || str_contains($name, 'import')) return 'System & Imports';
            return 'Other Operations';
        });

        return Inertia::render('Admin/Role/Index', [
            'roles' => $roles,
            'allPermissions' => $permissions,
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'Settings', 'url' => route('admin_settings_index')],
                ['label' => 'Roles & Permissions', 'url' => route('admin_roles_index')],
            ],
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        if ($role->name === 'super-admin' && !Auth::user()->hasRole('super-admin')) {
            return back()->with('error', '❌ Only a Super Admin can modify the Super Admin role.');
        }

        $role->syncPermissions($request->input('permissions'));

        return back()->with('success', "✅ Permissions updated for role: {$role->name}");
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name',
        ]);

        Role::create(['name' => $request->name, 'guard_name' => 'web']);

        return back()->with('success', "✅ New role '{$request->name}' created successfully.");
    }

    public function destroy(Role $role): RedirectResponse
    {
        if (in_array($role->name, ['super-admin', 'admin', 'manager'])) {
            return back()->with('error', '❌ System roles cannot be deleted.');
        }

        $role->delete();

        return back()->with('success', '🗑️ Role deleted successfully.');
    }
}
