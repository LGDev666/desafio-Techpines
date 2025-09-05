<?php

namespace Tests\Feature;

use App\Models\Song;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class SongManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $admin;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Criar usuário admin
        $this->admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@test.com'
        ]);
        
        // Criar usuário comum
        $this->user = User::factory()->create([
            'role' => 'user',
            'email' => 'user@test.com'
        ]);
    }

    /** @test */
    public function admin_can_approve_pending_song()
    {
        Log::shouldReceive('info')->atLeast()->once();
        
        $song = Song::factory()->create(['status' => 'pending']);
        
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/songs/{$song->id}/approve");
        
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Song approved successfully'
            ]);
        
        $this->assertDatabaseHas('songs', [
            'id' => $song->id,
            'status' => 'approved'
        ]);
    }

    /** @test */
    public function admin_can_reject_pending_song()
    {
        Log::shouldReceive('info')->atLeast()->once();
        
        $song = Song::factory()->create(['status' => 'pending']);
        
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/songs/{$song->id}/reject", [
                'reason' => 'Conteúdo inadequado'
            ]);
        
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Song rejected successfully'
            ]);
        
        $this->assertDatabaseHas('songs', [
            'id' => $song->id,
            'status' => 'rejected'
        ]);
    }

    /** @test */
    public function admin_can_edit_song_details()
    {
        Log::shouldReceive('info')->atLeast()->once();
        
        $song = Song::factory()->create([
            'title' => 'Título Original',
            'artist' => 'Artista Original'
        ]);
        
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/songs/{$song->id}", [
                'title' => 'Novo Título',
                'artist' => 'Novo Artista',
                'status' => 'approved'
            ]);
        
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Song updated successfully'
            ]);
        
        $this->assertDatabaseHas('songs', [
            'id' => $song->id,
            'title' => 'Novo Título',
            'artist' => 'Novo Artista',
            'status' => 'approved'
        ]);
    }

    /** @test */
    public function admin_can_delete_song()
    {
        Log::shouldReceive('info')->atLeast()->once();
        
        $song = Song::factory()->create();
        
        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/songs/{$song->id}");
        
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Song deleted successfully'
            ]);
        
        $this->assertSoftDeleted('songs', [
            'id' => $song->id
        ]);
    }

    /** @test */
    public function can_get_songs_by_status_pending()
    {
        Log::shouldReceive('info')->atLeast()->once();
        
        Song::factory()->count(3)->create(['status' => 'pending']);
        Song::factory()->count(2)->create(['status' => 'approved']);
        
        $response = $this->getJson('/api/songs/status/pending');
        
        $response->assertStatus(200);
        $data = $response->json();
        
        $this->assertEquals(3, $data['total']);
        foreach ($data['data'] as $song) {
            $this->assertEquals('pending', $song['status']);
        }
    }

    /** @test */
    public function can_get_songs_by_status_approved()
    {
        Log::shouldReceive('info')->atLeast()->once();
        
        Song::factory()->count(5)->create(['status' => 'approved']);
        Song::factory()->count(2)->create(['status' => 'pending']);
        
        $response = $this->getJson('/api/songs/status/approved');
        
        $response->assertStatus(200);
        $data = $response->json();
        
        $this->assertEquals(5, $data['total']);
        foreach ($data['data'] as $song) {
            $this->assertEquals('approved', $song['status']);
        }
    }

    /** @test */
    public function can_get_songs_by_status_rejected()
    {
        Log::shouldReceive('info')->atLeast()->once();
        
        Song::factory()->count(2)->create(['status' => 'rejected']);
        Song::factory()->count(3)->create(['status' => 'approved']);
        
        $response = $this->getJson('/api/songs/status/rejected');
        
        $response->assertStatus(200);
        $data = $response->json();
        
        $this->assertEquals(2, $data['total']);
        foreach ($data['data'] as $song) {
            $this->assertEquals('rejected', $song['status']);
        }
    }

    /** @test */
    public function returns_error_for_invalid_status()
    {
        Log::shouldReceive('warning')->atLeast()->once();
        
        $response = $this->getJson('/api/songs/status/invalid');
        
        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Status inválido. Use: pending, approved ou rejected'
            ]);
    }

    /** @test */
    public function regular_user_cannot_approve_songs()
    {
        $song = Song::factory()->create(['status' => 'pending']);
        
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/songs/{$song->id}/approve");
        
        $response->assertStatus(403);
    }

    /** @test */
    public function regular_user_cannot_delete_songs()
    {
        $song = Song::factory()->create();
        
        $response = $this->actingAs($this->user, 'sanctum')
            ->deleteJson("/api/songs/{$song->id}");
        
        $response->assertStatus(403);
    }

    /** @test */
    public function regular_user_cannot_edit_songs()
    {
        $song = Song::factory()->create();
        
        $response = $this->actingAs($this->user, 'sanctum')
            ->putJson("/api/songs/{$song->id}", [
                'title' => 'Tentativa de Edição'
            ]);
        
        $response->assertStatus(403);
    }

    /** @test */
    public function logging_is_triggered_on_song_operations()
    {
        // Verificar se o logging está sendo chamado
        Log::shouldReceive('info')
            ->with('🎵 CONSULTANDO TOP 5 MÚSICAS', \Mockery::type('array'))
            ->once();
        
        Log::shouldReceive('info')
            ->with('✅ TOP 5 MÚSICAS RETORNADAS', \Mockery::type('array'))
            ->once();
        
        $response = $this->getJson('/api/songs/top5');
        $response->assertStatus(200);
    }
}
