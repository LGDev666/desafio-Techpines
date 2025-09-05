<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RequestLogger
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        
        $this->logIncomingRequest($request, $startTime);

        $response = $next($request);
        
        $endTime = microtime(true);
        $duration = round(($endTime - $startTime) * 1000, 2);
        
        $this->logResponse($request, $response, $duration);

        return $response;
    }

    /**
     * Log da requisição recebida com formatação melhorada
     */
    private function logIncomingRequest(Request $request, float $startTime): void
    {
        $method = $request->method();
        $methodEmoji = $this->getMethodEmoji($method);
        $route = $request->route() ? $request->route()->getName() ?? $request->getPathInfo() : $request->getPathInfo();
        
        // Console colorido e detalhado
        echo "\n" . str_repeat("=", 80) . "\n";
        echo "🚀 NOVA REQUISIÇÃO - " . now()->format('H:i:s') . "\n";
        echo "📍 {$methodEmoji} {$method} → {$route}\n";
        echo "🌐 URL: {$request->fullUrl()}\n";
        echo "📱 IP: {$request->ip()}\n";
        
        if (auth()->check()) {
            echo "👤 Usuário: " . auth()->user()->name . " (ID: " . auth()->id() . ", Role: " . auth()->user()->role . ")\n";
        } else {
            echo "👤 Usuário: Não autenticado\n";
        }
        
        if ($request->hasFile()) {
            echo "📎 Arquivos: " . count($request->allFiles()) . " arquivo(s)\n";
        }
        
        if (!empty($request->all())) {
            echo "📦 Dados: " . json_encode($this->getFilteredBody($request), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
        }
        
        echo str_repeat("-", 80) . "\n";
        
        // Log estruturado para arquivo
        Log::info('🔵 REQUISIÇÃO RECEBIDA', [
            'method' => $method,
            'url' => $request->fullUrl(),
            'route' => $route,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => auth()->id(),
            'user_role' => auth()->check() ? auth()->user()->role : 'guest',
            'headers' => $this->getFilteredHeaders($request),
            'body' => $this->getFilteredBody($request),
            'timestamp' => now()->format('Y-m-d H:i:s')
        ]);
    }

    /**
     * Log da resposta com formatação melhorada
     */
    private function logResponse(Request $request, Response $response, float $duration): void
    {
        $statusCode = $response->getStatusCode();
        $method = $request->method();
        $methodEmoji = $this->getMethodEmoji($method);
        $statusEmoji = $this->getStatusEmoji($statusCode);
        $statusColor = $this->getStatusColor($statusCode);
        $route = $request->route() ? $request->route()->getName() ?? $request->getPathInfo() : $request->getPathInfo();
        
        // Console colorido com status
        echo "✅ RESPOSTA ENVIADA\n";
        echo "📍 {$methodEmoji} {$method} → {$route}\n";
        echo "📊 Status: {$statusEmoji} {$statusCode} {$statusColor}\n";
        echo "⏱️  Tempo: {$duration}ms\n";
        echo "📏 Tamanho: " . $this->formatBytes(strlen($response->getContent())) . "\n";
        
        if ($statusCode >= 400) {
            echo "⚠️  ERRO DETECTADO!\n";
        }
        
        echo str_repeat("=", 80) . "\n\n";
        
        // Log estruturado para arquivo
        $logLevel = $statusCode >= 400 ? 'error' : ($statusCode >= 300 ? 'warning' : 'info');
        $emoji = $statusCode >= 400 ? '🔴' : ($statusCode >= 300 ? '🟡' : '🟢');
        
        Log::$logLevel("$emoji RESPOSTA ENVIADA", [
            'method' => $method,
            'url' => $request->fullUrl(),
            'route' => $route,
            'status_code' => $statusCode,
            'status_text' => Response::$statusTexts[$statusCode] ?? 'Unknown',
            'duration_ms' => $duration,
            'user_id' => auth()->id(),
            'response_size' => strlen($response->getContent()),
            'memory_usage' => $this->formatBytes(memory_get_peak_usage(true)),
            'timestamp' => now()->format('Y-m-d H:i:s')
        ]);
    }

    /**
     * Retorna emoji para método HTTP
     */
    private function getMethodEmoji(string $method): string
    {
        return match($method) {
            'GET' => '📥',
            'POST' => '📤',
            'PUT' => '✏️',
            'PATCH' => '🔧',
            'DELETE' => '🗑️',
            default => '📋'
        };
    }

    /**
     * Retorna emoji para status code
     */
    private function getStatusEmoji(int $statusCode): string
    {
        return match(true) {
            $statusCode >= 200 && $statusCode < 300 => '✅',
            $statusCode >= 300 && $statusCode < 400 => '↩️',
            $statusCode >= 400 && $statusCode < 500 => '❌',
            $statusCode >= 500 => '💥',
            default => '❓'
        };
    }

    /**
     * Retorna descrição colorida do status
     */
    private function getStatusColor(int $statusCode): string
    {
        return match(true) {
            $statusCode >= 200 && $statusCode < 300 => '(SUCESSO)',
            $statusCode >= 300 && $statusCode < 400 => '(REDIRECIONAMENTO)',
            $statusCode >= 400 && $statusCode < 500 => '(ERRO DO CLIENTE)',
            $statusCode >= 500 => '(ERRO DO SERVIDOR)',
            default => '(DESCONHECIDO)'
        };
    }

    /**
     * Formata bytes em formato legível
     */
    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Filtra headers sensíveis
     */
    private function getFilteredHeaders(Request $request): array
    {
        $headers = $request->headers->all();
        $sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
        
        foreach ($sensitiveHeaders as $header) {
            if (isset($headers[$header])) {
                $headers[$header] = ['***HIDDEN***'];
            }
        }
        
        return $headers;
    }

    /**
     * Filtra dados sensíveis do body
     */
    private function getFilteredBody(Request $request): array
    {
        $body = $request->all();
        $sensitiveFields = ['password', 'password_confirmation', 'token'];
        
        foreach ($sensitiveFields as $field) {
            if (isset($body[$field])) {
                $body[$field] = '***HIDDEN***';
            }
        }
        
        return $body;
    }
}
