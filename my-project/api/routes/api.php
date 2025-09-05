<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SongController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now(),
        'service' => 'tiao-carreiro-api'
    ]);
});

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Public song routes
Route::get('/songs/top5', [SongController::class, 'top5']);
Route::get('/songs/remaining', [SongController::class, 'remaining']);
Route::get('/songs', [SongController::class, 'index']);
Route::post('/songs/suggest', [SongController::class, 'suggest']);

Route::get('/songs/status/{status}', [SongController::class, 'getByStatus']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/auth/user', [AuthController::class, 'me']);
    
    // Admin song management routes
    Route::post('/songs', [SongController::class, 'store']);
    Route::put('/songs/{song}', [SongController::class, 'update']);
    Route::delete('/songs/{song}', [SongController::class, 'destroy']);
    Route::post('/songs/{song}/approve', [SongController::class, 'approve']);
    Route::post('/songs/{song}/reject', [SongController::class, 'reject']);
});
