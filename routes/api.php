<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CollaborationController;
use App\Http\Controllers\CollaborationRequestController;
use App\Http\Controllers\ChatController;

/*
|--------------------------------------------------------------------------
| Austify API Routes
|--------------------------------------------------------------------------
*/

// --- PUBLIC ACCESS ---
// http://127.0.0.1:8000/api/accounts/register
Route::post('/accounts/register', [AuthController::class, 'register']);

// http://127.0.0.1:8000/api/accounts/login
Route::post('/accounts/login', [AuthController::class, 'login']);



// --- PROTECTED ACCESS (Bearer Token Required) ---
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth Management
    Route::post('/accounts/logout', [AuthController::class, 'logout']);

    // Personal Profile
    // URL: http://127.0.0.1:8000/api/accounts/my-profile
    Route::get('/accounts/my-profile', [UserController::class, 'myProfile']);

    // User Discovery (POST for Body Search)
    // URL: http://127.0.0.1:8000/api/accounts/search-users
    Route::post('/accounts/search-users', [UserController::class, 'search']); 
    
    // External Profile View
    // URL: http://127.0.0.1:8000/api/accounts/public-profile/{id}
    Route::get('/accounts/public-profile/{id}', [UserController::class, 'showPublicProfile']);

    // URL: http://127.0.0.1:8000/api/accounts/update-profile
    Route::post('/accounts/update-profile', [UserController::class, 'updateProfile']);

    Route::prefix('post')->group(function () {
        
        // 1. View the Wall
        // get method
        // URL: http://127.0.0.1:8000/api/post/wall
        Route::get('/wall', [PostController::class, 'index']);

        // 2. Create a new Post
        // URL: http://127.0.0.1:8000/api/post/create-post
        Route::post('/create-post', [PostController::class, 'store']);

        // 3. Delete a Post
        // URL: http://127.0.0.1:8000/api/post/delete/{id}
        Route::delete('/delete/{id}', [PostController::class, 'destroy']);

        // URL: http://127.0.0.1:8000/api/post/like/{id}
        Route::post('/like/{id}', [PostController::class, 'toggleLike']);
        
    }); // ← closes Route::prefix('post')

    Route::prefix('collaborations')->group(function () {

        // 1. Create a new collaboration post
        // URL: http://127.0.0.1:8000/api/collaborations
        // Work: Logged-in user creates a collaboration post with title, description, required skills, etc.
        Route::post('/', [CollaborationController::class, 'store']);

        // 2. View all collaboration posts
        // URL: http://127.0.0.1:8000/api/collaborations
        // Work: Fetch all collaboration posts so users can browse projects and find teammates
        Route::get('/', [CollaborationController::class, 'index']);

        // 3. View a single collaboration post
        // URL: http://127.0.0.1:8000/api/collaborations/2
        // Work: Fetch details of a specific collaboration post
        Route::get('/{id}', [CollaborationController::class, 'show']);

        // 4. Update a collaboration post
        // URL: http://127.0.0.1:8000/api/collaborations/3
        // Work: Allows the creator to update the collaboration post
        Route::put('/{id}', [CollaborationController::class, 'update']);

        // 5. Delete a collaboration post
        // URL: http://127.0.0.1:8000/api/collaborations/3
        // Work: Allows the creator to delete their collaboration post
        Route::delete('/{id}', [CollaborationController::class, 'destroy']);

        // 6. Send request to join a collaboration
        // URL: http://127.0.0.1:8000/api/collaborations/1/requests
        // Work: Logged-in user sends request to join a collaboration
        Route::post('/{id}/requests', [CollaborationRequestController::class, 'store']);

        // 7. View the join requests at the particular collaboration
        // URL: http://127.0.0.1:8000/api/collaborations/1/requests
        // Work: Creator views join requests
        Route::get('/{id}/requests', [CollaborationRequestController::class, 'index']);

    }); // ← closes Route::prefix('collaborations')

    Route::prefix('collaboration-requests')->group(function () {
        Route::post('/{id}/acceptance', [CollaborationRequestController::class, 'accept']);
        Route::post('/{id}/rejection', [CollaborationRequestController::class, 'reject']);
    }); // ← closes Route::prefix('collaboration-requests')

    // Real-Time Chat API
    Route::prefix('chat')->group(function () {

        // URL: http://127.0.0.1:8000/api/chat/conversations
        // Work: Get all conversations the current user is part of
        Route::get('/conversations', [ChatController::class, 'index']);

        // URL: http://127.0.0.1:8000/api/chat/conversations/{id}/messages
        // Work: Get messages for a specific conversation (also auto-marks messages as seen)
        Route::get('/conversations/{id}/messages', [ChatController::class, 'show']);

        // URL: http://127.0.0.1:8000/api/chat/conversations/start
        // Work: Start a 1-on-1 conversation with another user (provide user_id)
        Route::post('/conversations/start', [ChatController::class, 'start']);

        // URL: http://127.0.0.1:8000/api/chat/messages
        // Work: Send a message to a conversation
        Route::post('/messages', [ChatController::class, 'store']);

        // URL: http://127.0.0.1:8000/api/chat/conversations/{id}/seen
        // Work: Explicitly mark all unread messages in a conversation as seen
        //       (use this on window focus, scroll-to-bottom, etc.)
        //       Broadcasts a MessageRead event so the sender's UI updates to ✓✓
        Route::post('/conversations/{id}/seen', [ChatController::class, 'markSeen']);

        // URL: http://127.0.0.1:8000/api/chat/typing
        // Work: Broadcast typing status to other participants in a conversation
        //       Body: { "conversation_id": 1, "is_typing": true|false }
        //       Send is_typing: true on keydown, is_typing: false after ~2s debounce
        //       Frontend listens via Echo.private(`conversation.{id}`).listen('.user.typing', ...)
        Route::post('/typing', [ChatController::class, 'typing']);

    }); // ← closes Route::prefix('chat')

}); // ← closes Route::middleware('auth:sanctum')