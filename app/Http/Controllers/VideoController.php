<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    // 1. Getting all videos for a specific Course
   public function index(Request $request)
{
    $query = Video::query();

    if ($request->has('semester')) {
        $query->where('semester', $request->semester);
    }

    if ($request->has('course')) {
        $query->where('course', $request->course);
    }

    return $query->get();
}

    // 2. Adding a new video to a course
    public function store(Request $request)
    {
        $request->validate([
            'semester'    => 'required|string',
            'course'      => 'required|string',
            'title'       => 'required|string|max:500',
            'url'         => 'required|string|max:2000',
            'description' => 'nullable|string|max:2000',
        ]);

        $video = Video::create([
            'user_id'     => auth()->id(),
            'semester'    => $request->semester,
            'course'      => $request->course,
            'title'       => $request->title,
            'url'         => $request->url,
            'description' => $request->description ?? null,
        ]);

        return response()->json($video, 201);
    }
}