<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\OwnerController; // Add this line
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UnitController;

use App\Http\Controllers\Owner\OwnerDashboardController;
use App\Http\Controllers\Web\WelcomeController; // Add this import

use App\Http\Controllers\Admin\VoterController;    // <--- ADD THIS IMPORT
use App\Http\Controllers\Admin\CandidateController; // <--- ADD THIS IMPORT
use App\Http\Controllers\Admin\ElectionController;
use App\Http\Controllers\Admin\VoteController;     // <--- ADD THIS IMPORT
use App\Http\Controllers\Admin\ImportController; // <--- ADD THIS IMPORT
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\VotingController;
use App\Http\Controllers\Web\ReceiptVerificationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('welcome');
// })->name('home');

Route::get('/', [WelcomeController::class, 'index'])->name('home'); // <--- UPDATED
// ... (rest of your routes) ...

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// --- Public Receipt Verification Routes ---
Route::prefix('verify-vote')->group(function () {
    Route::get('/', [ReceiptVerificationController::class, 'showVerificationForm'])->name('receipt_verification_form');
    Route::post('/', [ReceiptVerificationController::class, 'verifyReceipt'])->name('receipt_verify_post');
});
// --- End Public Receipt Verification Routes ---

Route::middleware('owner')->prefix('owner')->group(function () {
    Route::get('/dashboard', [OwnerDashboardController::class , 'dashboard'])->name('owner_dashboard');
    Route::post('/logout', [OwnerDashboardController::class, 'logout'])->name('owner_logout');

    Route::prefix('vote')->group(function () {
        Route::get('/', [\App\Http\Controllers\Owner\VoteController::class, 'index'])->name('owner_voting_index'); // <--- NOW REQUIRES election_id query param
        Route::post('/', [\App\Http\Controllers\Owner\VoteController::class, 'castVote'])->name('owner_voting_cast_vote');
        Route::get('/status', [\App\Http\Controllers\Owner\VoteController::class, 'checkStatus'])->name('owner_voting_check_status');
    });

});



// --- NEW PUBLIC VOTING SYSTEM ROUTES (OTP BASED) ---
Route::prefix('vote')->group(function () {
    // Step 1: Show form for Voter ID / National ID
    Route::get('/', [VotingController::class, 'showVoterIdForm'])->name('vote_show_voter_id_form');
    Route::get('/buildings/{building}/units', [VotingController::class, 'getUnits'])->name('vote_get_units');
    Route::post('/login', [VotingController::class, 'voterLogin'])->name('vote_login');

    // Voting Page
    Route::get('/cast-vote', [VotingController::class, 'showCastVotePage'])->name('vote_cast_vote_page');
    Route::post('/cast-vote', [VotingController::class, 'castVote'])->name('vote_cast_vote');

    // 3. Thank you page
    Route::get('/thank-you', [VotingController::class, 'thankYou'])->name('vote_thank_you');
    Route::post('/logout', [VotingController::class, 'voterLogout'])->name('vote_logout');
});
// --- END NEW PUBLIC VOTING SYSTEM ROUTES ---

// Admin routes (requires 'auth' middleware for admin panel access)
Route::middleware(['auth', 'role:super-admin|admin|manager'])->prefix('admin')->group(function() {
    Route::get('/dashboard', [VoteController::class , 'index'])->name('admin_dashboard');

    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('admin_users_index');
        Route::get('/create', [UserController::class, 'create'])->name('admin_users_create');
        Route::post('/create', [UserController::class, 'store'])->name('admin_users_store');
        Route::get('/{user}/edit', [UserController::class, 'edit'])->name('admin_users_edit');
        Route::post('/{user}', [UserController::class, 'update'])->name('admin_users_update_post');
        Route::put('/{user}', [UserController::class, 'update'])->name('admin_users_update');
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('admin_users_destroy');
    });

    // Roles & Permissions
    Route::prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index'])->name('admin_roles_index');
        Route::post('/', [RoleController::class, 'store'])->name('admin_roles_store');
        Route::put('/{role}', [RoleController::class, 'update'])->name('admin_roles_update');
        Route::delete('/{role}', [RoleController::class, 'destroy'])->name('admin_roles_destroy');
    });

    // Settings / System Control
    Route::get('/settings', [SettingsController::class, 'index'])->name('admin_settings_index');
    Route::post('/settings', [SettingsController::class, 'update'])->name('admin_settings_update');
   // Owner CRUD routes - Individual definitions for clarity
    Route::get('/owners', [OwnerController::class, 'index'])->name('admin_owners_index');
    Route::get('/owner/create', [OwnerController::class, 'create'])->name('admin_owner_create');
    Route::post('/owner/create', [OwnerController::class, 'store'])->name('admin_owner_store');
    Route::get('/owner/{owner}/edit', [OwnerController::class, 'edit'])->name('admin_owner_edit');
    Route::put('/owner/{owner}/update', [OwnerController::class, 'update'])->name('admin_owner_update');
    Route::delete('/owner/{owner}', [OwnerController::class, 'destroy'])->name('admin_owner_destroy');

    Route::post('/owner/import', [OwnerController::class, 'import'])->name('admin_owner_import');


     // --- NEW ADMIN ELECTIONS MANAGEMENT ROUTES ---
    Route::prefix('elections')->group(function () {
        Route::get('/', [ElectionController::class, 'index'])->name('admin_elections_index');
        Route::get('/create', [ElectionController::class, 'create'])->name('admin_elections_create');
        Route::post('/create', [ElectionController::class, 'store'])->name('admin_elections_store');
        Route::get('/{election}/edit', [ElectionController::class, 'edit'])->name('admin_elections_edit');
        Route::put('/{election}', [ElectionController::class, 'update'])->name('admin_elections_update');
        Route::delete('/{election}', [ElectionController::class, 'destroy'])->name('admin_elections_destroy');

        // Election-specific actions
        Route::post('/{election}/toggle-status', [ElectionController::class, 'toggleStatus'])->name('admin_elections_toggle_status');
        Route::post('/{election}/toggle-results', [ElectionController::class, 'toggleShowResults'])->name('admin_elections_toggle_results');
        Route::post('/{election}/reset-votes', [ElectionController::class, 'resetVotes'])->name('admin_elections_reset_votes');
        Route::get('/{election}/results', [ElectionController::class, 'results'])->name('admin_elections_results');
        Route::get('/{election}/report', [ElectionController::class, 'report'])->name('admin_elections_report');
        Route::get('/{election}/export-csv', [ElectionController::class, 'exportCsv'])->name('admin_elections_export_csv');
        Route::get('/{election}/live-results', [ElectionController::class, 'liveResults'])->name('admin_elections_live_results');
        Route::get('/{election}/api/results', [ElectionController::class, 'getResultsApi'])->name('api_elections_results');
    });
    // --- END NEW ADMIN ELECTIONS MANAGEMENT ROUTES ---

    // --- NEW ADMIN VOTING SYSTEM ROUTES ---
    Route::prefix('voting')->group(function () {
        Route::get('/', [VoteController::class, 'index'])->name('admin_voting_index');
        Route::post('/toggle-status', [VoteController::class, 'toggleVoting'])->name('admin_voting_toggle_status');
        Route::post('/reset-votes', [VoteController::class, 'resetVoting'])->name('admin_voting_reset_votes');
        Route::get('/results', [VoteController::class, 'results'])->name('admin_voting_results');
        Route::get('/live-results', [VoteController::class, 'liveResults'])->name('admin_voting_live_results'); 
        Route::get('/api/results', [VoteController::class, 'getResultsApi'])->name('api_voting_results'); 

        // Admin voting for untransferred units
        Route::get('/untransferred', [VoteController::class, 'untransferredUnits'])->name('admin_voting_untransferred');
        Route::post('/admin-vote', [VoteController::class, 'adminVote'])->name('admin_voting_cast_admin_vote');

        // Voters Management
        Route::get('/voters', [VoterController::class, 'index'])->name('admin_voters_index');
        Route::post('/voters/import', [VoterController::class, 'import'])->name('admin_voters_import');
        Route::get('/voters/{voter}/edit', [VoterController::class, 'edit'])->name('admin_voters_edit');
        Route::match(['PUT', 'PATCH'], '/voters/{voter}', [VoterController::class, 'update'])->name('admin_voters_update');
        Route::delete('/voters/bulk-destroy', [VoterController::class, 'bulkDestroy'])->name('admin_voters_bulk_destroy');
        Route::delete('/voters/{voter}', [VoterController::class, 'destroy'])->name('admin_voters_destroy');

        // Candidates Management
        Route::get('/candidates', [CandidateController::class, 'index'])->name('admin_candidates_index');
        Route::get('/candidates/create', [CandidateController::class, 'create'])->name('admin_candidates_create');
        Route::post('/candidates/create', [CandidateController::class, 'store'])->name('admin_candidates_store');
        Route::get('/candidates/{candidate}/edit', [CandidateController::class, 'edit'])->name('admin_candidates_edit');
        Route::post('/candidates/{candidate}', [CandidateController::class, 'update'])->name('admin_candidates_update'); // Use POST for file uploads
        Route::delete('/candidates/{candidate}', [CandidateController::class, 'destroy'])->name('admin_candidates_destroy');
    });
    // --- END NEW ADMIN VOTING SYSTEM ROUTES ---

    Route::get('/settings', [SettingsController::class, 'index'])->name('admin_settings_index');
    Route::post('/logout', [AdminController::class, 'logout'])->name('admin_logout'); // Changed to POST for consistency

    // --- DATA IMPORT ROUTES ---
    Route::get('/import', [ImportController::class, 'index'])->name('admin_import_index');
    Route::post('/import', [ImportController::class, 'store'])->name('admin_import_store');
});

// Admin login/logout (no 'auth' middleware as it's for authentication)
Route::prefix('admin')->group(function() {
    Route::get('/login', [AdminController::class, 'showEmailLoginForm'])->name('admin_login'); // Show email input form
    Route::post('/login/send-otp', [AdminController::class, 'sendEmailOtp'])->name('admin_send_email_otp'); // Send OTP
    Route::get('/login/verify-otp', [AdminController::class, 'showEmailOtpForm'])->name('admin_show_email_otp_form'); // Show OTP input form
    Route::post('/login/verify-otp', [AdminController::class, 'verifyEmailOtp'])->name('admin_verify_email_otp'); // Verify OTP
});

// Public Owner OTP authentication routes
Route::get('/owner/login', [OwnerDashboardController::class , 'showLoginForm'])->name('owner_login');
// Route::post('/owner/send-otp', [OwnerAuthController::class, 'sendOtp'])->name('owner.sendOtp');
// Route::post('/owner/verify-otp', [OwnerAuthController::class, 'verifyOtp'])->name('owner.verifyOtp');
Route::post('/owner/login', [OwnerDashboardController::class, 'login'])->name('owner_login_submit');

// Protected Owner routes (requires 'owner' middleware)
Route::middleware('owner')->prefix('owner')->group(function () {
    Route::get('/dashboard', [OwnerDashboardController::class , 'dashboard'])->name('owner_dashboard');
    Route::post('/logout', [OwnerDashboardController::class, 'logout'])->name('owner_logout');
    // Route::match(['GET','POST'], '/logout', [OwnerDashboardController::class, 'logout'])->name('owner_logout');



    Route::prefix('vote')->group(function () {
        Route::get('/', [\App\Http\Controllers\Owner\VoteController::class, 'index'])->name('owner_voting_index');
        Route::post('/', [\App\Http\Controllers\Owner\VoteController::class, 'castVote'])->name('owner_voting_cast_vote');
        Route::get('/status', [\App\Http\Controllers\Owner\VoteController::class, 'checkStatus'])->name('owner_voting_check_status');
    });

});

// Existing routes for units upload
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/upload-units', function () {
        return Inertia::render('Admin/UploadUnits');
    })->name('upload.units.index');
    Route::post('/units/upload', [UnitController::class, 'uploadUnits'])->name('units.upload');
});

// Temporary route to fix storage symlink on shared hosting
Route::get('/create-link', function () {
    $target = storage_path('app/public');
    $link = public_path('storage');
    
    if (file_exists($link)) {
        return "The 'public/storage' directory already exists.";
    }

    if (symlink($target, $link)) {
        return "✅ Storage link created successfully!";
    } else {
        return "❌ Failed to create storage link.";
    }
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
