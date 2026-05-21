<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // --- Create Roles ---
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $adminRole      = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $managerRole    = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);

        // --- Define Permissions ---
        $permissions = [
            // Dashboard
            'viewDashboard',

            // User Management
            'viewUsers',
            'createUsers',
            'editUsers',
            'deleteUsers',
            'assignRoles',

            // Owner Management
            'viewOwners',
            'createOwners',
            'editOwners',
            'deleteOwners',
            'importOwners',

            // Unit Management
            'viewUnits',
            'createUnits',
            'editUnits',
            'deleteUnits',
            'importUnits',

            // Reports
            'viewReports',
            'exportReports',
            'viewUnitsReport',
            'viewOwnersReport',
            'viewPaymentsReport',

            // Elections Management (NEW)
            'viewElections',
            'createElections',
            'editElections',
            'deleteElections',
            'viewElectionLiveResults', // New specific permission for live view


            // Voting System Management (Admin)
            'viewVotingStatus',
            'manageVotingSystem', // For activating/deactivating/resetting
            'viewVoters',
            'importVoters',
            'editVoters',
            'deleteVoters',
            'viewCandidates',
            'createCandidates',
            'editCandidates',
            'deleteCandidates',
            'viewVotingResults', // For seeing results page

            // Voters (now election-scoped)
            'viewVoters',
            'importVoters',
            'editVoters',
            'deleteVoters',

            // Candidates (now election-scoped)
            'viewCandidates',
            'createCandidates',
            'editCandidates',
            'deleteCandidates',

            // Results (now election-scoped, usually implies 'viewElections')
            'viewVotingResults', // Still exists for generic permission, but UI will link to election-specific results

            // Settings
            'accessSettings',
            'manageCommunityChargeImport',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // --- Assign all permissions to super-admin role ---
        $superAdminRole->givePermissionTo(Permission::all());

        // --- Assign default permissions to regular admin/manager roles (customize as needed) ---
        $adminRole->givePermissionTo([
            'viewDashboard',
            'viewUsers', 'createUsers', 'editUsers',
            'viewOwners', 'createOwners', 'editOwners',
            'viewUnits', 'createUnits', 'editUnits',
            'viewReports', 'viewUnitsReport', 'viewOwnersReport', 'viewPaymentsReport',
            'accessSettings',
            'manageCommunityChargeImport', // If admins can manage this import

            // Elections Management
            'viewElections',
            'createElections',
            'editElections',
            'viewElectionLiveResults', // Admins can view live results
            'manageVotingSystem', // Admins can manage election status/reset votes

            // Voters
            'viewVoters', 'importVoters', 'editVoters',

            // Candidates
            'viewCandidates', 'createCandidates', 'editCandidates',

            // Results
            'viewVotingResults',
        ]);

        // Manager role example (more restricted)
        $managerRole->givePermissionTo([
            'viewDashboard', // Managers should probably see a dashboard
            'viewOwners', 'editOwners',
            'viewUnits', 'editUnits',
            'viewReports', 'viewUnitsReport', 'viewOwnersReport', 'viewPaymentsReport',

            // Elections Management
            'viewElections',
            'viewElectionLiveResults', // Managers can view live results

            // Voters
            'viewVoters',

            // Candidates
            'viewCandidates',

            // Results
            'viewVotingResults',
        ]);


        // --- Create Super Admin User ---
        $superAdmin = User::firstOrCreate(
            ['email' => 'hashim267303@gmail.com'],
            [
                'name' => 'Hashim Abbas (Super Admin)',
                'password' => Hash::make('2673031992'),
                'email_verified_at' => now(),
                'otp_code' => null,
                'otp_expires_at' => null,
            ]
        );
        $superAdmin->assignRole('super-admin');
        $superAdmin = User::firstOrCreate(
            ['email' => 'waleednaseer1280@gmail.com'],
            [
                'name' => 'Walled Nasser (Super Admin)',
                'password' => Hash::make('123456789'),
                'email_verified_at' => now(),
                'otp_code' => null,
                'otp_expires_at' => null,
            ]
        );
        $superAdmin->assignRole('super-admin');

        // Example of a regular admin user
        $regularAdmin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Regular Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'otp_code' => null,
                'otp_expires_at' => null,
            ]
        );
        $regularAdmin->assignRole('admin');
    }
}
