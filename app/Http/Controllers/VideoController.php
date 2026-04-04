<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    // 1. Getting all videos for a specific Course
    public function index(Request $request)
    {
        return Video::where('semester', $request->semester)
                    ->where('course', $request->course)
                    ->get();
    }

    // 2. AddING a new video to a course
    public function store(Request $request)
    {
        return Video::create([
            'semester' => $request->semester,
            'course'   => $request->course,
            'title'    => $request->title,
            'url'      => $request->url,
        ]);
    }
}