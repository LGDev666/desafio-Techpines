<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TestApiEndpoints extends Command
{
    protected $signature = 'api:test {--host=http://localhost:8000}';
    protected $description = 'Testa todos os endpoints da API e exibe logs detalhados';

    public function handle()
    {
        $host = $this->option('host');
        
        $this->info('🚀 INICIANDO TESTES DOS ENDPOINTS DA API');
        $this->info("Host: $host");
        $this->newLine();

        // Teste de saúde
        $this->testHealthEndpoint($host);
        
        // Testes públicos
        $this->testPublicEndpoints($host);
        
        // Testes com autenticação
        $this->testAuthenticatedEndpoints($host);
        
        $this->newLine();
        $this->info('✅ TESTES CONCLUÍDOS! Verifique os logs para detalhes completos.');
    }

    private function testHealthEndpoint($host)
    {
        $this->info('🔍 Testando endpoint de saúde...');
        
        try {
            $response = Http::get("$host/api/health");
            
            if ($response->successful()) {
                $this->info('✅ Health check: OK');
                Log::info('🧪 TESTE HEALTH ENDPOINT', [
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
            } else {
                $this->error('❌ Health check falhou');
            }
        } catch (\Exception $e) {
            $this->error("❌ Erro no health check: {$e->getMessage()}");
        }
    }

    private function testPublicEndpoints($host)
    {
        $this->info('🔍 Testando endpoints públicos...');
        
        $endpoints = [
            'GET /api/songs/top5' => "$host/api/songs/top5",
            'GET /api/songs/remaining' => "$host/api/songs/remaining",
            'GET /api/songs' => "$host/api/songs",
            'GET /api/songs/status/pending' => "$host/api/songs/status/pending",
            'GET /api/songs/status/approved' => "$host/api/songs/status/approved",
            'GET /api/songs/status/rejected' => "$host/api/songs/status/rejected",
        ];

        foreach ($endpoints as $name => $url) {
            try {
                $response = Http::get($url);
                
                if ($response->successful()) {
                    $this->info("✅ $name: OK");
                    Log::info('🧪 TESTE ENDPOINT PÚBLICO', [
                        'endpoint' => $name,
                        'status' => $response->status(),
                        'data_count' => is_array($response->json()) ? count($response->json()) : 'N/A'
                    ]);
                } else {
                    $this->error("❌ $name: Falhou ({$response->status()})");
                }
            } catch (\Exception $e) {
                $this->error("❌ $name: Erro - {$e->getMessage()}");
            }
        }
    }

    private function testAuthenticatedEndpoints($host)
    {
        $this->info('🔍 Testando endpoints autenticados...');
        $this->warn('⚠️  Para testes completos, execute os testes PHPUnit com: php artisan test');
        
        Log::info('🧪 TESTES DE ENDPOINTS AUTENTICADOS', [
            'message' => 'Endpoints protegidos requerem autenticação',
            'suggestion' => 'Execute: php artisan test --filter=SongManagementTest'
        ]);
    }
}
