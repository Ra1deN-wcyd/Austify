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
    Schema::create('videos', function (Blueprint $table) {
        $table->id();
        $table->integer('semester');   // 1, 2, 3...
        $table->string('course');      // e.g., "Database Systems"
        $table->string('title');       // e.g., "Lecture 1: Intro"
        $table->string('url');         // The YouTube Link
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};
