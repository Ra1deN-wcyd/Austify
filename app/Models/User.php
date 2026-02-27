<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     * * We only include name, email, and password. 
     * Points and Role are NOT here for security.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'github_link',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Relationship: One user has many posts.
     * This is where they will earn their points!
     */
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Helper method to check if the user is an admin.
     */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }
}