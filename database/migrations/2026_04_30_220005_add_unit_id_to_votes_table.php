<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('votes', function (Blueprint $table) {
            $table->foreignId('unit_id')->nullable()->constrained()->onDelete('cascade');
            // Make voter_id nullable for admin votes
            $table->foreignId('voter_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('votes', function (Blueprint $table) {
            $table->dropForeign(['unit_id']);
            $table->dropColumn('unit_id');
            $table->foreignId('voter_id')->nullable(false)->change();
        });
    }
};
