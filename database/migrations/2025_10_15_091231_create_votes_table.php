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
            Schema::create('votes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('voter_id')->constrained('voters')->cascadeOnDelete();
                $table->foreignId('candidate_id')->constrained('candidates')->cascadeOnDelete();
                $table->integer('vote_weight')->default(1); // For future flexibility, currently 1 per vote cast

                $table->timestamps();

                // Optional: Unique constraint to prevent multiple votes from the same voter_id for the same candidate
                // within a single "election" if you implement election periods.
                // For now, each record is a single 'voice'.
            });
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('votes');
        }
    };
