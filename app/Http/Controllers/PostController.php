<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    // 1. Show all posts (The Wall)
    public function index()
    {
        // We add 'withCount' so every post automatically has a 'likes_count' attribute
        $posts = Post::with([
            'user:id,name', 
            'comments.user:id,name'
        ])
        ->withCount('likes') 
        ->latest()
        ->get();

        return response()->json($posts);
    }

    // 2. Create a new post
    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $post = Post::create([
            'user_id' => Auth::id(),
            'content' => $request->input('content'),
        ]);

        return response()->json([
            'message' => 'Post created!', 
            'post' => $post->load('user:id,name')
        ], 201);
    }

    // 3. Like / Unlike Toggle
    public function toggleLike($id)
    {
        $post = Post::findOrFail($id);
        $user = Auth::user();

        // Check if this specific user already liked this specific post
        $existingLike = $post->likes()->where('user_id', $user->id)->first();

        if ($existingLike) {
            $existingLike->delete(); // Unlike it
            return response()->json([
                'message' => 'Unliked', 
                'likes_count' => $post->likes()->count()
            ]);
        }

        // Otherwise, Create a new like
        $post->likes()->create([
            'user_id' => $user->id
        ]);

        return response()->json([
            'message' => 'Liked!', 
            'likes_count' => $post->likes()->count()
        ]);
    }

    // 4. Delete a post
    public function destroy($id)
    {
        $post = Post::findOrFail($id);
        $user = Auth::user();

        // Admin or Owner check
        if ($user->role === 'admin' || $user->id === $post->user_id) {
            $post->delete(); 
            return response()->json(['message' => 'Post deleted successfully']);
        }

        return response()->json(['message' => 'Unauthorized!'], 403);
    }
}