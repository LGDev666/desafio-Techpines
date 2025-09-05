<?php

namespace Tests\Feature;

use App\Models\Song;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SongTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_top5_songs(): void
    {
        // Create songs with different view counts
        Song::factory()->create(['views' => 1000000, 'status' => 'approved']);
        Song::factory()->create(['views' => 900000, 'status' => 'approved']);
        Song::factory()->create(['views' => 800000, 'status' => 'approved']);
        Song::factory()->create(['views' => 700000, 'status' => 'approved']);
        Song::factory()->create(['views' => 600000, 'status' => 'approved']);
        Song::factory()->create(['views' => 500000, 'status' => 'approved']);

        $response = $this->getJson('/api/songs/top5');

        $response->assertStatus(200)
                ->assertJsonCount(5);
    }

    public function test_can_get_paginated_songs(): void
    {
        Song::factory()->count(15)->create(['status' => 'approved']);

        $response = $this->getJson('/api/songs?page=1');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'data',
                    'current_page',
                    'last_page',
                    'per_page',
                    'total'
                ]);
    }

    public function test_user_can_suggest_song(): void
    {
        $response = $this->postJson('/api/songs/suggest', [
            'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        ]);

        $response->assertStatus(201)
                ->assertJson(['message' => 'Song suggestion submitted successfully']);

        $this->assertDatabaseHas('songs', [
            'youtube_id' => 'dQw4w9WgXcQ',
            'status' => 'pending'
        ]);
    }

    public function test_admin_can_create_song(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/songs', [
            'title' => 'Test Song',
            'artist' => 'Test Artist',
            'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('songs', ['title' => 'Test Song']);
    }

    public function test_regular_user_cannot_create_song(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/songs', [
            'title' => 'Test Song',
            'artist' => 'Test Artist',
            'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_approve_song(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test-token')->plainTextToken;
        
        $song = Song::factory()->create(['status' => 'pending']);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson("/api/songs/{$song->id}/approve");

        $response->assertStatus(200);
        $this->assertDatabaseHas('songs', [
            'id' => $song->id,
            'status' => 'approved'
        ]);
    }
}
