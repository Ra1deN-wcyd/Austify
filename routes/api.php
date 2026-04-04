<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CollaborationController;
use App\Http\Controllers\CollaborationRequestController;
use App\Http\Controllers\VideoController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CommentController;

/*
|--------------------------------------------------------------------------
| Austify API Routes
|--------------------------------------------------------------------------
*/

// --- PUBLIC ACCESS ---

// URL: http://127.0.0.1:8000/api/accounts/register
Route::post('/accounts/register', [AuthController::class, 'register']);

// URL: http://127.0.0.1:8000/api/accounts/login
Route::post('/accounts/login', [AuthController::class, 'login']);



// --- PROTECTED ACCESS (Bearer Token Required) ---
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth Management

    // URL: http://127.0.0.1:8000/api/accounts/logout
    Route::post('/accounts/logout', [AuthController::class, 'logout']);


    // Personal Profile

    // URL: http://127.0.0.1:8000/api/accounts/my-profile
    Route::get('/accounts/my-profile', [UserController::class, 'myProfile']);


    // User Discovery

    // URL: http://127.0.0.1:8000/api/accounts/search-users
    Route::post('/accounts/search-users', [UserController::class, 'search']);


    // External Profile View

    // URL: http://127.0.0.1:8000/api/accounts/public-profile/{id}
    Route::get('/accounts/public-profile/{id}', [UserController::class, 'showPublicProfile']);


    // Update Profile

    // URL: http://127.0.0.1:8000/api/accounts/update-profile
    Route::post('/accounts/update-profile', [UserController::class, 'updateProfile']);


    // ================= POSTS =================
    Route::prefix('post')->group(function () {

        // 1. View Posts (Wall)
        // URL: http://127.0.0.1:8000/api/post/wall
        Route::get('/wall', [PostController::class, 'index']);

        // 2. Create Post
        // URL: http://127.0.0.1:8000/api/post/create-post
        Route::post('/create-post', [PostController::class, 'store']);

        // 3. Delete Post
        // URL: http://127.0.0.1:8000/api/post/delete/{id}
        Route::delete('/delete/{id}', [PostController::class, 'destroy']);

        // 4. Like / Unlike Post
        // URL: http://127.0.0.1:8000/api/post/like/{id}
        Route::post('/like/{id}', [PostController::class, 'toggleLike']);

        // 5. Comment on Post
        // URL: http://127.0.0.1:8000/api/post/comment/{id}
        Route::post('/comment/{id}', [CommentController::class, 'store']);

    });


    // ================= COLLABORATIONS =================
    Route::prefix('collaborations')->group(function () {

        // 1. Create Collaboration
        // URL: http://127.0.0.1:8000/api/collaborations
        Route::post('/', [CollaborationController::class, 'store']);

        // 2. Get All Collaborations
        // URL: http://127.0.0.1:8000/api/collaborations
        Route::get('/', [CollaborationController::class, 'index']);

        // 3. Get Single Collaboration
        // URL: http://127.0.0.1:8000/api/collaborations/{id}
        Route::get('/{id}', [CollaborationController::class, 'show']);

        // 4. Update Collaboration
        // URL: http://127.0.0.1:8000/api/collaborations/{id}
        Route::put('/{id}', [CollaborationController::class, 'update']);

        // 5. Delete Collaboration
        // URL: http://127.0.0.1:8000/api/collaborations/{id}
        Route::delete('/{id}', [CollaborationController::class, 'destroy']);

        // 6. Send Collaboration Request
        // URL: http://127.0.0.1:8000/api/collaborations/{id}/requests
        Route::post('/{id}/requests', [CollaborationRequestController::class, 'store']);

        // 7. View Collaboration Requests
        // URL: http://127.0.0.1:8000/api/collaborations/{id}/requests
        Route::get('/{id}/requests', [CollaborationRequestController::class, 'index']);

    });


    // ================= VIDEOS =================

    // URL: http://127.0.0.1:8000/api/videos
    Route::get('/videos', [VideoController::class, 'index']);

    // URL: http://127.0.0.1:8000/api/videos
    Route::post('/videos', [VideoController::class, 'store']);


    // ================= COLLABORATION REQUEST ACTIONS =================
    Route::prefix('collaboration-requests')->group(function () {

        // Accept Request
        // URL: http://127.0.0.1:8000/api/collaboration-requests/{id}/acceptance
        Route::post('/{id}/acceptance', [CollaborationRequestController::class, 'accept']);

        // Reject Request
        // URL: http://127.0.0.1:8000/api/collaboration-requests/{id}/rejection
        Route::post('/{id}/rejection', [CollaborationRequestController::class, 'reject']);

    });


    // ================= CHAT =================
    Route::prefix('chat')->group(function () {

        // 1. Get Conversations
        // URL: http://127.0.0.1:8000/api/chat/conversations
        Route::get('/conversations', [ChatController::class, 'index']);

        // 2. Get Messages
        // URL: http://127.0.0.1:8000/api/chat/conversations/{id}/messages
        Route::get('/conversations/{id}/messages', [ChatController::class, 'show']);

        // 3. Start Conversation
        // URL: http://127.0.0.1:8000/api/chat/conversations/start
        Route::post('/conversations/start', [ChatController::class, 'start']);

        // 4. Send Message
        // URL: http://127.0.0.1:8000/api/chat/messages
        Route::post('/messages', [ChatController::class, 'store']);

        // 5. Mark Messages as Seen
        // URL: http://127.0.0.1:8000/api/chat/conversations/{id}/seen
        Route::post('/conversations/{id}/seen', [ChatController::class, 'markSeen']);

        // 6. Typing Indicator
        // URL: http://127.0.0.1:8000/api/chat/typing
        Route::post('/typing', [ChatController::class, 'typing']);

    });

});