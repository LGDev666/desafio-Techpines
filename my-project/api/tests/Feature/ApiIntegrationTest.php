<?php

namespace Tests\Feature;

use App\Models\Song;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class ApiIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    /** @test */
    public function complete_song_lifecycle_workflow()
    {
        Log::shouldReceive('info')->zeroOrMoreTimes();
        Log::shouldReceive('warning')->zeroOrMoreTimes();
        Log::shouldReceive('error')->zeroOrMoreTimes();

        // 1. Criar música diretamente como admin
        $song = Song::factory()->pending()->create();

        // 2. Verificar que aparece nas pendentes
        $response = $this->getJson('/api/songs/status/pending');
        $response->assertStatus(200);
        $this->assertGreaterThan(0, $response->json()['total']);

        // 3. Aprovar a música
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/songs/{$song->id}/approve");
        
        $response->assertStatus(200);

        // 4. Verificar que aparece nas aprovadas
        $response = $this->getJson('/api/songs/status/approved');
        $response->assertStatus(200);
        
        $approvedSongs = collect($response->json()['data']);
        $this->assertTrue($approvedSongs->contains('id', $song->id));

        // 5. Editar a música
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/songs/{$song->id}", [
                'title' => 'Título Editado',
                'artist' => 'Artista Editado'
            ]);
        
        $response->assertStatus(200);
        $this->assertEquals('Título Editado', $response->json()['data']['title']);

        // 6. Rejeitar a música
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/songs/{$song->id}/reject", [
                'reason' => 'Teste de rejeição'
            ]);
        
        $response->assertStatus(200);

        // 7. Verificar que aparece nas rejeitadas
        $response = $this->getJson('/api/songs/status/rejected');
        $response->assertStatus(200);
        
        $rejectedSongs = collect($response->json()['data']);
        $this->assertTrue($rejectedSongs->contains('id', $song->id));

        // 8. Excluir a música
        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/songs/{$song->id}");
        
        $response->assertStatus(200);

        // 9. Verificar que não aparece mais em nenhuma lista
        $this->assertSoftDeleted('songs', ['id' => $song->id]);
    }

    /** @test */
    public function api_returns_consistent_data_structure()
    {
        Log::shouldReceive('info')->zeroOrMoreTimes();
        Log::shouldReceive('warning')->zeroOrMoreTimes();
        Log::shouldReceive('error')->zeroOrMoreTimes();

        Song::factory()->approved()->count(10)->create();

        // Testar estrutura do top5
        $response = $this->getJson('/api/songs/top5');
        $response->assertStatus(200);
        $this->assertIsArray($response->json());
        $this->assertLessThanOrEqual(5, count($response->json()));

        // Testar estrutura das restantes
        $response = $this->getJson('/api/songs/remaining');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'title', 'artist', 'views', 'status']
            ],
            'current_page',
            'total'
        ]);

        // Testar estrutura por status
        $response = $this->getJson('/api/songs/status/approved');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'title', 'artist', 'views', 'status']
            ],
            'current_page',
            'total'
        ]);
    }

    /** @test */
    public function pagination_works_correctly()
    {
        Log::shouldReceive('info')->zeroOrMoreTimes();
        Log::shouldReceive('warning')->zeroOrMoreTimes();
        Log::shouldReceive('error')->zeroOrMoreTimes();

        Song::factory()->approved()->count(25)->create();

        // Testar paginação padrão
        $response = $this->getJson('/api/songs/remaining');
        $response->assertStatus(200);
        $data = $response->json();
        $this->assertEquals(1, $data['current_page']);
        $this->assertEquals(10, $data['per_page']);

        // Testar paginação customizada
        $response = $this->getJson('/api/songs/remaining?per_page=5&page=2');
        $response->assertStatus(200);
        $data = $response->json();
        $this->assertEquals(2, $data['current_page']);
        $this->assertEquals(5, $data['per_page']);
    }
}
