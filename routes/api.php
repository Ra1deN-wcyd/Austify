<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostController;

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
        
    });








});