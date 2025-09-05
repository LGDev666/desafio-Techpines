<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('songs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('artist')->default('Tião Carreiro & Pardinho'); // Added artist field
            $table->bigInteger('views')->default(0);
            $table->string('youtube_id')->unique();
            $table->string('youtube_url'); // Added full YouTube URL field
            $table->string('thumbnail');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['status', 'views']);
            $table->index(['artist']); // Added index for artist filtering
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('songs');
    }
};
