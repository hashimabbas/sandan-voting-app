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
            // Drop the old global unique constraint
            $table->dropUnique(['voter_id_no']);
            
            // Add a composite unique constraint (election_id, voter_id_no)
            $table->unique(['election_id', 'voter_id_no']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voters', function (Blueprint $table) {
            $table->dropUnique(['election_id', 'voter_id_no']);
            $table->unique(['voter_id_no']);
        });
    }
};
