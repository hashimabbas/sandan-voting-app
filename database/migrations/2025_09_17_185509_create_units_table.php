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
        Schema::create('units', function (Blueprint $table) {
            $table->id();

            // المفتاح الأجنبي للمالك
            $table->string('owner_id_no', 50);
            $table->foreign('owner_id_no')
                ->references('owner_id_no')
                ->on('owners')
                ->onDelete('cascade');


            $table->string('unit_code'); // ex: 01/G0001

            // yearly claims
            $table->decimal('y2020', 10, 3)->default(0);
            $table->decimal('y2021', 10, 3)->default(0);
            $table->decimal('y2022', 10, 3)->default(0);
            $table->decimal('y2023', 10, 3)->default(0);
            $table->decimal('y2024', 10, 3)->default(0);
            $table->decimal('y2025', 10, 3)->default(0);
            $table->decimal('y2026', 10, 3)->default(0);

            $table->decimal('total', 10, 3)->default(0);
            $table->decimal('received', 10, 3)->default(0);
            $table->decimal('balance', 10, 3)->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
