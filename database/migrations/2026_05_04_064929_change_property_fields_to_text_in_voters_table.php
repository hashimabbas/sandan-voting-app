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
            $table->text('building_no')->nullable()->change();
            $table->text('unit_name')->nullable()->change();
            $table->text('mulkiya_status')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voters', function (Blueprint $table) {
            $table->string('building_no')->nullable()->change();
            $table->string('unit_name')->nullable()->change();
            $table->string('mulkiya_status')->nullable()->change();
        });
    }
};
