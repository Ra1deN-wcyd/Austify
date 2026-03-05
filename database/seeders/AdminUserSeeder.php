<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
   public function run(): void
{
    \App\Models\User::create([
        'name' => 'Tamjid Ahmed',
        'email' => 'tamjid@gmail.com', // Use your real email
        'password' => Hash::make('tamjid123'), // Set your password
        'role' => 'admin',
        'points' => 999999,
        'github_link' => 'https://github.com/Ra1deN-wcyd',
    ]);
}
}
