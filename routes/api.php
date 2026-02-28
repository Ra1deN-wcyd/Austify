<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Public Routes
Route::post('/accounts/register', [AuthController::class, 'register']);
Route::post('/accounts/login', [AuthController::class, 'login']);

// Protected Routes (Requires Bearer Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/accounts/{id}', [AuthController::class, 'show']);
    Route::post('/accounts/logout', [AuthController::class, 'logout']);
});