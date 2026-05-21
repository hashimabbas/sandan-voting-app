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
            // Add a nullable election_id first, then make it non-nullable after filling existing data
            $table->foreignId('election_id')->nullable()->after('id')->constrained('elections')->cascadeOnDelete();
        });

        Schema::table('candidates', function (Blueprint $table) {
            $table->foreignId('election_id')->nullable()->after('id')->constrained('elections')->cascadeOnDelete();
        });

        Schema::table('votes', function (Blueprint $table) {
            $table->foreignId('election_id')->nullable()->after('id')->constrained('elections')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voters', function (Blueprint $table) {
            $table->dropForeign(['election_id']);
            $table->dropColumn('election_id');
        });

        Schema::table('candidates', function (Blueprint $table) {
            $table->dropForeign(['election_id']);
            $table->dropColumn('election_id');
        });

        Schema::table('votes', function (Blueprint $table) {
            $table->dropForeign(['election_id']);
            $table->dropColumn('election_id');
        });
    }
};
