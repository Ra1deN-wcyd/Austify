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

    protected $appends = ['current_members', 'has_requested', 'user_request_status'];

    public function getCurrentMembersAttribute() {
        if ($this->relationLoaded('requests')) {
            return $this->requests->where('status', 'accepted')->count();
        }
        return $this->requests()->where('status', 'accepted')->count();
    }

    public function getHasRequestedAttribute() {
        if (!auth()->check()) return false;
        if ($this->relationLoaded('requests')) {
            return $this->requests->where('user_id', auth()->id())->isNotEmpty();
        }
        return $this->requests()->where('user_id', auth()->id())->exists();
    }

    public function getUserRequestStatusAttribute() {
        if (!auth()->check()) return null;
        if ($this->relationLoaded('requests')) {
            $req = $this->requests->where('user_id', auth()->id())->first();
            return $req ? $req->status : null;
        }
        $req = $this->requests()->where('user_id', auth()->id())->first();
        return $req ? $req->status : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function requests() {
        return $this->hasMany(CollaborationRequest::class);
    }
}
