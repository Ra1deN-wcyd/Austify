<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Collaboration extends Model
{
    use HasFactory;
        protected $fillable = [
        'user_id',
        'title',
        'type',
        'tech_stack',
        'description',
        'status',
        'team_size',
        'contact'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function requests() {
    return $this->hasMany(CollaborationRequest::class);
}
}
