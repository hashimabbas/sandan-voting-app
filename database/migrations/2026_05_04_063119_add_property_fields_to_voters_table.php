<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('voters', function (Blueprint $table) {
            $table->string('building_no')->nullable()->after('number_of_units');
            $table->string('unit_name')->nullable()->after('building_no');
            $table->string('mulkiya_status')->nullable()->after('unit_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voters', function (Blueprint $table) {
            $table->dropColumn(['building_no', 'unit_name', 'mulkiya_status']);
        });
    }
};
