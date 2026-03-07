<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends Model
{
    protected $fillable = ['user_id', 'post_id', 'comment_text'];

    // Who wrote this comment?
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Which post does this belong to?
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
