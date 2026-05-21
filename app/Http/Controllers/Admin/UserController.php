<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function __construct()
    {
        // Permission system simplified as requested
    }

    /**
     * Display a listing of admin users.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $users = User::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->with('roles')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'photo' => $user->photo ? asset('storage/' . $user->photo) : null,
                'roles' => $user->getRoleNames(),
                'created_at' => $user->created_at,
            ]);

        return Inertia::render('Admin/User/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
            ],
            'user_id' => Auth::id(),
            'breadcrumbs' => [
                ['label' => 'Users', 'href' => route('admin_users_index')],
            ],
        ]);
    }

    /**
     * Show the form for creating a new admin user.
     */
    public function create(): Response
    {
        $roles = Role::where('guard_name', 'web')
            ->when(!Auth::user()->hasRole('super-admin'), function ($query) {
                $query->where('name', '!=', 'super-admin');
            })
            ->get(['id', 'name']);

        return Inertia::render('Admin/User/Create', [
            'roles' => $roles,
            'breadcrumbs' => [
                ['label' => 'Users', 'href' => route('admin_users_index')],
                ['label' => 'Create User', 'href' => route('admin_users_create')],
            ],
        ]);
    }

    /**
     * Store a newly created admin user in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'photo' => 'nullable|image|max:2048',
            'roles' => 'required|array|min:1',
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('profile-photos', 'public');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'photo' => $photoPath,
        ]);

        // Validate and assign roles
        $rolesToAssign = $request->roles;
        if (!Auth::user()->hasRole('super-admin')) {
            $rolesToAssign = array_diff($rolesToAssign, ['super-admin']);
        }
        
        $user->assignRole($rolesToAssign);

        return redirect()->route('admin_users_index')->with('success', '✅ Admin user created successfully!');
    }

    /**
     * Show the form for editing the specified admin user.
     */
    public function edit(User $user): Response
    {
        $roles = Role::where('guard_name', 'web')
            ->when(!Auth::user()->hasRole('super-admin'), function ($query) {
                $query->where('name', '!=', 'super-admin');
            })
            ->get(['id', 'name']);

        return Inertia::render('Admin/User/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'photo' => $user->photo ? asset('storage/' . $user->photo) : null,
                'roles' => $user->getRoleNames(),
            ],
            'roles' => $roles,
            'auth_user_id' => Auth::id(),
            'breadcrumbs' => [
                ['label' => 'Users', 'href' => route('admin_users_index')],
                ['label' => 'Edit User', 'href' => route('admin_users_edit', $user->id)],
            ],
        ]);
    }

    /**
     * Update the specified admin user in storage.
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'photo' => 'nullable|image|max:2048',
            'roles' => 'required|array|min:1',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        if ($request->hasFile('photo')) {
            if ($user->photo) {
                Storage::disk('public')->delete($user->photo);
            }
            $user->photo = $request->file('photo')->store('profile-photos', 'public');
        } elseif ($request->boolean('remove_photo')) {
            if ($user->photo) {
                Storage::disk('public')->delete($user->photo);
                $user->photo = null;
            }
        }

        $user->save();

        // Sync roles
        $rolesToSync = $request->roles;
        if (!Auth::user()->hasRole('super-admin')) {
            // Keep super-admin if they already had it and we aren't allowed to change it
            if ($user->hasRole('super-admin')) {
                $rolesToSync[] = 'super-admin';
            }
            // Ensure they don't add super-admin if they weren't one
            $rolesToSync = array_diff($rolesToSync, ['super-admin']);
        }
        
        $user->syncRoles($rolesToSync);

        return redirect()->route('admin_users_index')->with('success', '✅ User updated successfully!');
    }

    /**
     * Remove the specified admin user from storage.
     */
    public function destroy(User $user)
    {
        // Prevent self-deletion
        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', '❌ You cannot terminate your own active session!');
        }

        if ($user->photo) {
            Storage::disk('public')->delete($user->photo);
        }

        $user->delete();

        return redirect()->route('admin_users_index')->with('success', '✅ User access revoked successfully!');
    }
}
