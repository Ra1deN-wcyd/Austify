<?php

use Illuminate\Support\Facades\Route;

<<<<<<< Updated upstream
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('pages.welcome');
}) -> name('welcome');


Route::get('/login', function () {
    return view('pages.login');
})->name('login');

Route::get('/register', function () {
    return view('pages.register');
})->name('register');

Route::get('/home',function(){
    return view('pages.home');
})->name('home');


Route::get('/profile',function(){
    return view('pages.profile');
})->name('profile');



=======
Route::get('/{any}', function () {
    return view('layouts.app');
})->where('any', '.*');
>>>>>>> Stashed changes
