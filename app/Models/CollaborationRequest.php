<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollaborationRequest extends Model
{
    use HasFactory;
    protected $fillable = [
        'collaboration_id',
        'user_id',
        'message',
        'status'
    ];
    // CollaborationRequest.php
public function collaboration() {
    return $this->belongsTo(Collaboration::class);
}

public function user() {
    return $this->belongsTo(User::class);
}
}
