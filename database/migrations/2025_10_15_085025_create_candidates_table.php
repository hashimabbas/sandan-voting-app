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
            Schema::create('candidates', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('phone')->nullable(); // Optional contact for candidate
                $table->text('description')->nullable();
                $table->string('photo')->nullable(); // Profile photo for candidate
                $table->timestamps();
            });
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('candidates');
        }
    };
