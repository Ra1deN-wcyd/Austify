<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    use HasFactory;
   
    protected $fillable = ['user_id', 'uploader_name', 'semester', 'course', 'title', 'url', 'description', 'file_path', 'original_name'];

    public function uploader()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
