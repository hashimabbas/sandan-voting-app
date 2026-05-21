<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Setting;

class SettingsController extends Controller
{
    /**
     * Display the admin settings page.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Settings/Index', [
            'settings' => [
                'admin_2fa_enabled' => Setting::get('admin_2fa_enabled', '1') === '1',
            ],
            'breadcrumbs' => [
                ['label' => 'Dashboard', 'url' => route('admin_dashboard')],
                ['label' => 'System Control', 'url' => route('admin_settings_index')],
            ],
        ]);
    }

    /**
     * Update system settings.
     */
    public function update(Request $request)
    {
        $request->validate([
            'admin_2fa_enabled' => 'required|boolean',
        ]);

        Setting::set('admin_2fa_enabled', $request->admin_2fa_enabled ? '1' : '0');

        return back()->with('success', '✅ System protocols updated successfully!');
    }
}
