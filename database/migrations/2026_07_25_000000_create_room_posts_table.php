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
        Schema::create('room_posts', function (Blueprint $table) {
            $table->id();

            // The user who created the post
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Post type: looking for a room vs. looking for a roommate
            $table->enum('type', ['looking_for_room', 'looking_for_roommate']);

            // Lifestyle & preference fields
            $table->enum('gender_preference', ['male', 'female', 'any']);
            $table->string('location'); // Area / neighbourhood e.g. "Uttara", "Mirpur"
            $table->enum('room_type', ['single', 'shared', 'sublet', 'flat']);
            $table->integer('rent_budget_min')->nullable()->unsigned();
            $table->integer('rent_budget_max')->nullable()->unsigned();
            $table->enum('smoker', ['smoker', 'non_smoker', 'no_preference']);
            $table->enum('gamer_type', ['gamer', 'mild_gamer', 'non_gamer', 'no_preference']);

            // Timeline & details
            $table->date('move_in_date')->nullable();
            $table->text('description');
            $table->string('contact_info');

            // Post lifecycle
            $table->enum('status', ['active', 'filled'])->default('active');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_posts');
    }
};
