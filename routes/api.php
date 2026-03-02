<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

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


    // update profile 
    Route::post('/accounts/update-profile', [UserController::class, 'updateProfile']);

});