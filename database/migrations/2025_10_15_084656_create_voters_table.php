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
            Schema::create('voters', function (Blueprint $table) {
                $table->id();
                $table->string('voter_id_no')->unique(); // ID from the XLS file
                $table->string('name');
                $table->string('phone');
                $table->integer('number_of_units')->default(0); // Voting power
                $table->boolean('has_voted')->default(false); // Tracks if they submitted a vote
                $table->string('token')->nullable(); // For temporary voting session/link

                $table->timestamps();
            });
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('voters');
        }
    };
