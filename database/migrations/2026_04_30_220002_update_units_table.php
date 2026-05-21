<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('units', function (Blueprint $table) {
            // Check if owner_id_no exists before dropping
            if (Schema::hasColumn('units', 'owner_id_no')) {
                $table->dropForeign(['owner_id_no']);
                $table->dropColumn('owner_id_no');
            }

            $table->foreignId('building_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('unit_name')->nullable();
            $table->string('ownership_status')->default('pending'); // محولة or otherwise
        });
    }

    public function down(): void
    {
        Schema::table('units', function (Blueprint $table) {
            $table->dropForeign(['building_id']);
            $table->dropColumn(['building_id', 'unit_name', 'ownership_status']);
            $table->string('owner_id_no', 50)->nullable();
        });
    }
};
