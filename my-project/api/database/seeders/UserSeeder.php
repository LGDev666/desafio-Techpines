<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@tiaocarreiro.com',
            'password' => Hash::make('password123'),
            'role' => 'admin'
        ]);

        // Create regular user
        User::create([
            'name' => 'User Test',
            'email' => 'user@tiaocarreiro.com',
            'password' => Hash::make('password123'),
            'role' => 'user'
        ]);
    }
}
