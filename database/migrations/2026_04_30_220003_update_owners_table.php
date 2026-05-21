<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('owners', function (Blueprint $table) {
            if (!Schema::hasColumn('owners', 'civil_id')) {
                $table->string('civil_id')->nullable()->after('owner_id_no');
            }
        });
    }

    public function down(): void
    {
        Schema::table('owners', function (Blueprint $table) {
            $table->dropColumn('civil_id');
        });
    }
};
