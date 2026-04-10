<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::unguarded(function () {
            User::updateOrCreate(
                ['email' => 'tamjid@gmail.com'],
                [
                    'name' => 'Tamjid Ahmed',
                    'password' => 'tamjid123',
                    'role' => 'admin',
                    'points' => 999999,
                    'github_link' => 'https://github.com/Ra1deN-wcyd',
                ]
            );
        });
    }
}
