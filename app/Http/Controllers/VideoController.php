<?php

namespace App\Http\Controllers;

use App\Models\Video;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VideoController extends Controller
{
    // 1. Getting all videos for a specific Course
    public function index(Request $request)
    {
        return Video::where('semester', $request->semester)
                    ->where('course', $request->course)
                    ->get();
    }

    // 2. Adding a new video or resource file to a course
    public function store(Request $request)
    {
        $user = Auth::user();

        $data = [
            'user_id'       => $user?->id,
            'uploader_name' => $user?->name ?? 'Anonymous',
            'semester'    => $request->semester,
            'course'      => $request->course,
            'title'       => $request->title,
            'url'         => $request->url,
            'description' => $request->description,
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $data['file_path'] = $file->store('resources', 'public');
            $data['original_name'] = $file->getClientOriginalName();
        }

        $video = Video::create($data);

        // Award +10 points to the uploader
        if ($user) {
            $user->increment('points', 10);
        }

        return $video;
    }
}