<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CollaborationController;
use App\Http\Controllers\CollaborationRequestController;
use App\Http\Controllers\VideoController;
use App\Http\Controllers\ChatController;

/*
|--------------------------------------------------------------------------
| Austify API Routes
|--------------------------------------------------------------------------
*/

// --- PUBLIC ACCESS ---
Route::post('/accounts/register', [AuthController::class, 'register']);
Route::post('/accounts/login', [AuthController::class, 'login']);


// --- PROTECTED ACCESS (Bearer Token Required) ---
Route::middleware('auth:sanctum')->group(function () {

    // Auth Management
    Route::post('/accounts/logout', [AuthController::class, 'logout']);

    // Personal Profile
    Route::get('/accounts/my-profile', [UserController::class, 'myProfile']);

    // User Discovery
    Route::post('/accounts/search-users', [UserController::class, 'search']);

    // External Profile View
    Route::get('/accounts/public-profile/{id}', [UserController::class, 'showPublicProfile']);

    // Update Profile
    Route::post('/accounts/update-profile', [UserController::class, 'updateProfile']);

    // Posts
    Route::prefix('post')->group(function () {
        Route::get('/wall', [PostController::class, 'index']);
        Route::post('/create-post', [PostController::class, 'store']);
        Route::delete('/delete/{id}', [PostController::class, 'destroy']);
        Route::post('/like/{id}', [PostController::class, 'toggleLike']);
        
    }); // ← closes Route::prefix('post')

    // Collaborations
    Route::prefix('collaborations')->group(function () {
        Route::post('/', [CollaborationController::class, 'store']);
        Route::get('/', [CollaborationController::class, 'index']);
        Route::get('/{id}', [CollaborationController::class, 'show']);
        Route::put('/{id}', [CollaborationController::class, 'update']);
        Route::delete('/{id}', [CollaborationController::class, 'destroy']);
        Route::post('/{id}/requests', [CollaborationRequestController::class, 'store']);
        Route::get('/{id}/requests', [CollaborationRequestController::class, 'index']);

    }); // ← closes Route::prefix('collaborations')





//for share resources

    Route::get('/videos', [VideoController::class, 'index']);
    Route::post('/videos', [VideoController::class, 'store']);

    // Collaboration Requests
    Route::prefix('collaboration-requests')->group(function () {
        Route::post('/{id}/acceptance', [CollaborationRequestController::class, 'accept']);
        Route::post('/{id}/rejection', [CollaborationRequestController::class, 'reject']);
    }); // ← closes Route::prefix('collaboration-requests')

    // Real-Time Chat
    Route::prefix('chat')->group(function () {
        Route::get('/conversations', [ChatController::class, 'index']);
        Route::get('/conversations/{id}/messages', [ChatController::class, 'show']);
        Route::post('/conversations/start', [ChatController::class, 'start']);
        Route::post('/messages', [ChatController::class, 'store']);
        Route::post('/conversations/{id}/seen', [ChatController::class, 'markSeen']);
        Route::post('/typing', [ChatController::class, 'typing']);

    }); // ← closes Route::prefix('chat')

}); // ← closes Route::middleware('auth:sanctum')