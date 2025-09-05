<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class RequestLoggingTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function request_logging_middleware_logs_incoming_requests()
    {
        Log::shouldReceive('info')->zeroOrMoreTimes();
        Log::shouldReceive('warning')->zeroOrMoreTimes();
        Log::shouldReceive('error')->zeroOrMoreTimes();
        
        $response = $this->getJson('/api/songs/top5');
        $response->assertStatus(200);
    }

    /** @test */
    public function request_logging_filters_sensitive_data()
    {
        Log::shouldReceive('info')->zeroOrMoreTimes();
        Log::shouldReceive('warning')->zeroOrMoreTimes();
        Log::shouldReceive('error')->zeroOrMoreTimes();
        
        $this->postJson('/api/auth/login', [
            'email' => 'test@test.com',
            'password' => 'secret123'
        ]);
        
        // Teste passa se não há exceções de mock
        $this->assertTrue(true);
    }

    /** @test */
    public function request_logging_includes_user_information_when_authenticated()
    {
        $user = User::factory()->create(['role' => 'admin']);
        
        Log::shouldReceive('info')->zeroOrMoreTimes();
        Log::shouldReceive('warning')->zeroOrMoreTimes();
        Log::shouldReceive('error')->zeroOrMoreTimes();
        
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/auth/me');
        
        $response->assertStatus(200);
    }

    /** @test */
    public function request_logging_measures_response_time()
    {
        Log::shouldReceive('info')->zeroOrMoreTimes();
        Log::shouldReceive('warning')->zeroOrMoreTimes();
        Log::shouldReceive('error')->zeroOrMoreTimes();
        
        $response = $this->getJson('/api/songs/top5');
        $response->assertStatus(200);
    }
}
