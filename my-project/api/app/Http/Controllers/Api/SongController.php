<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Song;
use App\Services\YouTubeService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class SongController extends Controller
{
    protected YouTubeService $youtubeService;

    public function __construct(YouTubeService $youtubeService)
    {
        $this->youtubeService = $youtubeService;
    }

    /**
     * Get top 5 songs
     */
    public function top5(): JsonResponse
    {
        Log::info('🎵 CONSULTANDO TOP 5 MÚSICAS', [
            'action' => 'get_top5',
            'user_id' => auth()->id(),
            'timestamp' => now()
        ]);

        $songs = Song::where('status', 'approved')
            ->orderBy('views', 'desc')
            ->limit(5)
            ->get();

        Log::info('✅ TOP 5 MÚSICAS RETORNADAS', [
            'count' => $songs->count(),
            'songs' => $songs->pluck('title', 'id')->toArray()
        ]);

        return response()->json($songs);
    }

    /**
     * Get paginated list of remaining songs (6th position onwards)
     */
    public function remaining(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 10);
        
        Log::info('🎵 CONSULTANDO MÚSICAS RESTANTES', [
            'action' => 'get_remaining',
            'per_page' => $perPage,
            'user_id' => auth()->id()
        ]);
        
        $songs = Song::where('status', 'approved')
            ->orderBy('views', 'desc')
            ->skip(5) // Skip top 5
            ->paginate($perPage);

        Log::info('✅ MÚSICAS RESTANTES RETORNADAS', [
            'total' => $songs->total(),
            'current_page' => $songs->currentPage(),
            'per_page' => $songs->perPage()
        ]);

        return response()->json($songs);
    }

    /**
     * Get songs by status (pending, approved, rejected)
     */
    public function getByStatus(Request $request, string $status): JsonResponse
    {
        $validStatuses = ['pending', 'approved', 'rejected'];
        
        if (!in_array($status, $validStatuses)) {
            Log::warning('❌ STATUS INVÁLIDO SOLICITADO', [
                'status' => $status,
                'valid_statuses' => $validStatuses,
                'user_id' => auth()->id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Status inválido. Use: pending, approved ou rejected'
            ], 400);
        }

        Log::info("🔍 CONSULTANDO MÚSICAS POR STATUS: $status", [
            'status' => $status,
            'user_id' => auth()->id(),
            'user_role' => auth()->check() ? auth()->user()->role : 'guest'
        ]);

        $perPage = $request->get('per_page', 15);
        $songs = Song::where('status', $status)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        Log::info("✅ MÚSICAS COM STATUS '$status' RETORNADAS", [
            'status' => $status,
            'count' => $songs->total(),
            'current_page' => $songs->currentPage()
        ]);

        return response()->json($songs);
    }

    /**
     * Submit a new song suggestion
     */
    public function suggest(Request $request): JsonResponse
    {
        Log::info('🎤 NOVA SUGESTÃO DE MÚSICA RECEBIDA', [
            'action' => 'suggest_song',
            'youtube_url' => $request->youtube_url,
            'user_id' => auth()->id(),
            'ip' => $request->ip()
        ]);

        $validator = Validator::make($request->all(), [
            'youtube_url' => 'required|url'
        ]);

        if ($validator->fails()) {
            Log::warning('❌ SUGESTÃO REJEITADA - URL INVÁLIDA', [
                'errors' => $validator->errors()->toArray(),
                'url' => $request->youtube_url
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Invalid YouTube URL',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $videoData = $this->youtubeService->extractVideoInfo($request->youtube_url);
            
            // Check if song already exists
            $existingSong = Song::where('youtube_id', $videoData['youtube_id'])->first();
            if ($existingSong) {
                Log::warning('❌ MÚSICA JÁ EXISTE', [
                    'youtube_id' => $videoData['youtube_id'],
                    'existing_song_id' => $existingSong->id,
                    'title' => $existingSong->title
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'This song has already been suggested'
                ], 409);
            }

            $song = Song::create([
                'title' => $videoData['title'],
                'artist' => $videoData['artist'] ?? 'Unknown Artist',
                'views' => $videoData['views'],
                'youtube_id' => $videoData['youtube_id'],
                'youtube_url' => $request->youtube_url,
                'thumbnail' => $videoData['thumbnail'],
                'status' => 'pending'
            ]);

            Log::info('✅ MÚSICA SUGERIDA COM SUCESSO', [
                'song_id' => $song->id,
                'title' => $song->title,
                'artist' => $song->artist,
                'youtube_id' => $song->youtube_id,
                'status' => $song->status
            ]);

            return response()->json([
                'message' => 'Song suggestion submitted successfully',
                'data' => $song
            ], 201);

        } catch (\Exception $e) {
            Log::error('❌ ERRO AO PROCESSAR SUGESTÃO', [
                'error' => $e->getMessage(),
                'youtube_url' => $request->youtube_url,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to process YouTube URL: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get all songs (admin only)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $status = $request->get('status', 'approved'); // Default to approved songs for public access

        $query = Song::query();
        
        // Only show approved songs for public access, unless user is admin
        if (auth()->check() && auth()->user()->canManageSongs()) {
            // Admin can see all songs and filter by status
            if ($request->has('status')) {
                $query->where('status', $request->get('status'));
            }
        } else {
            // Public access only shows approved songs
            $query->where('status', 'approved');
        }

        $songs = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($songs);
    }

    /**
     * Create a new song (admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Song::class);
        
        Log::info('👑 ADMIN CRIANDO NOVA MÚSICA', [
            'action' => 'admin_create_song',
            'admin_id' => auth()->id(),
            'data' => $request->only(['title', 'artist', 'youtube_url'])
        ]);
        
        // Additional check for admin role since policy allows all authenticated users to create
        if (!auth()->user()->isAdmin()) {
            Log::warning('❌ TENTATIVA DE CRIAÇÃO SEM PERMISSÃO ADMIN', [
                'user_id' => auth()->id(),
                'user_role' => auth()->user()->role
            ]);
            
            return response()->json([
                'message' => 'Only administrators can create songs directly.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'artist' => 'required|string',
            'youtube_url' => 'required|url'
        ]);

        if ($validator->fails()) {
            Log::warning('❌ DADOS INVÁLIDOS PARA CRIAÇÃO', [
                'errors' => $validator->errors()->toArray()
            ]);
            
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $videoData = $this->youtubeService->extractVideoInfo($request->youtube_url);
            
            $song = Song::create([
                'title' => $request->title,
                'artist' => $request->artist,
                'views' => $videoData['views'] ?? 0,
                'youtube_id' => $videoData['youtube_id'],
                'youtube_url' => $request->youtube_url,
                'thumbnail' => $videoData['thumbnail'] ?? null,
                'status' => 'approved' // Admin created songs are auto-approved
            ]);

            Log::info('✅ MÚSICA CRIADA PELO ADMIN', [
                'song_id' => $song->id,
                'title' => $song->title,
                'artist' => $song->artist,
                'admin_id' => auth()->id(),
                'auto_approved' => true
            ]);

            return response()->json([
                'message' => 'Song created successfully',
                'data' => $song
            ], 201);

        } catch (\Exception $e) {
            Log::error('❌ ERRO NA CRIAÇÃO PELO ADMIN', [
                'error' => $e->getMessage(),
                'admin_id' => auth()->id(),
                'data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to process YouTube URL: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Approve a song (admin only)
     */
    public function approve(Request $request, Song $song): JsonResponse
    {
        $this->authorize('update', $song);

        Log::info('👑 ADMIN APROVANDO MÚSICA', [
            'action' => 'approve_song',
            'song_id' => $song->id,
            'title' => $song->title,
            'previous_status' => $song->status,
            'admin_id' => auth()->id()
        ]);

        $song->update(['status' => 'approved']);

        Log::info('✅ MÚSICA APROVADA COM SUCESSO', [
            'song_id' => $song->id,
            'title' => $song->title,
            'new_status' => $song->status,
            'admin_id' => auth()->id()
        ]);

        return response()->json([
            'message' => 'Song approved successfully',
            'data' => $song
        ]);
    }

    /**
     * Reject a song (admin only)
     */
    public function reject(Request $request, Song $song): JsonResponse
    {
        $this->authorize('update', $song);

        Log::info('👑 ADMIN REJEITANDO MÚSICA', [
            'action' => 'reject_song',
            'song_id' => $song->id,
            'title' => $song->title,
            'previous_status' => $song->status,
            'admin_id' => auth()->id(),
            'reason' => $request->get('reason', 'Não especificado')
        ]);

        $song->update(['status' => 'rejected']);

        Log::info('❌ MÚSICA REJEITADA', [
            'song_id' => $song->id,
            'title' => $song->title,
            'new_status' => $song->status,
            'admin_id' => auth()->id()
        ]);

        return response()->json([
            'message' => 'Song rejected successfully',
            'data' => $song
        ]);
    }

    /**
     * Update song (admin only)
     */
    public function update(Request $request, Song $song): JsonResponse
    {
        $this->authorize('update', $song);

        Log::info('👑 ADMIN EDITANDO MÚSICA', [
            'action' => 'update_song',
            'song_id' => $song->id,
            'title' => $song->title,
            'admin_id' => auth()->id(),
            'changes' => $request->only(['title', 'artist', 'youtube_url', 'status'])
        ]);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string',
            'artist' => 'sometimes|string',
            'youtube_url' => 'sometimes|url',
            'status' => 'sometimes|in:pending,approved,rejected'
        ]);

        if ($validator->fails()) {
            Log::warning('❌ DADOS INVÁLIDOS PARA EDIÇÃO', [
                'song_id' => $song->id,
                'errors' => $validator->errors()->toArray()
            ]);
            
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $oldData = $song->toArray();
        
        if ($request->has('youtube_url') && $request->youtube_url !== $song->youtube_url) {
            try {
                $videoData = $this->youtubeService->extractVideoInfo($request->youtube_url);
                $song->update([
                    'youtube_url' => $request->youtube_url,
                    'youtube_id' => $videoData['youtube_id'],
                    'views' => $videoData['views'],
                    'thumbnail' => $videoData['thumbnail']
                ]);
                
                Log::info('🔄 DADOS DO YOUTUBE ATUALIZADOS', [
                    'song_id' => $song->id,
                    'new_youtube_id' => $videoData['youtube_id'],
                    'new_views' => $videoData['views']
                ]);
            } catch (\Exception $e) {
                Log::error('❌ ERRO AO ATUALIZAR DADOS DO YOUTUBE', [
                    'song_id' => $song->id,
                    'error' => $e->getMessage()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update YouTube data: ' . $e->getMessage()
                ], 400);
            }
        }

        // Atualizar outros campos
        $song->update($request->only(['title', 'artist', 'status']));

        Log::info('✅ MÚSICA EDITADA COM SUCESSO', [
            'song_id' => $song->id,
            'old_data' => $oldData,
            'new_data' => $song->fresh()->toArray(),
            'admin_id' => auth()->id()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Song updated successfully',
            'data' => $song->fresh()
        ]);
    }

    /**
     * Delete song (admin only)
     */
    public function destroy(Song $song): JsonResponse
    {
        $this->authorize('delete', $song);

        Log::info('👑 ADMIN EXCLUINDO MÚSICA', [
            'action' => 'delete_song',
            'song_id' => $song->id,
            'title' => $song->title,
            'artist' => $song->artist,
            'admin_id' => auth()->id()
        ]);

        $songData = $song->toArray();
        $song->delete();

        Log::info('🗑️ MÚSICA EXCLUÍDA DO BANCO', [
            'deleted_song' => $songData,
            'admin_id' => auth()->id(),
            'deleted_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Song deleted successfully'
        ]);
    }
}
