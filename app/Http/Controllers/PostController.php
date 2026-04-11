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
        // Fetch posts with users, comments, and comment authors, paginated
        $posts = Post::with([
            'user:id,name', 
            'comments.user:id,name'
        ])
        ->withCount('likes') 
        ->latest()
        ->paginate(10);

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

    // 3. Multi-Reaction Toggle
    public function toggleLike($id, Request $request)
    {
        $post = Post::findOrFail($id);
        $user = Auth::user();
        $type = $request->input('type', 'like'); // default to 'like'

        // Check if this specific user already has ANY reaction on this specific post
        $existingReaction = $post->likes()->where('user_id', $user->id)->first();

        if ($existingReaction) {
            // If the reaction is the SAME type, delete it (unlike)
            if ($existingReaction->type === $type) {
                $existingReaction->delete();
                return response()->json([
                    'message' => 'Removed ' . $type, 
                    'likes_count' => $post->likes()->count()
                ]);
            }
            // If the reaction is a DIFFERENT type, update it
            $existingReaction->update(['type' => $type]);
            return response()->json([
                'message' => 'Updated to ' . $type, 
                'likes_count' => $post->likes()->count()
            ]);
        }

        // Otherwise, create a new reaction
        $post->likes()->create([
            'user_id' => $user->id,
            'type' => $type
        ]);

        return response()->json([
            'message' => 'Reacted with ' . $type, 
            'likes_count' => $post->likes()->count()
        ]);
    }

    // 4. Delete a post (Owner or Admin)
    public function destroy($id)
    {
        $post = Post::findOrFail($id);
        $user = Auth::user();

        // Check if the user is the owner or an admin
        if ($user->id === $post->user_id || $user->role === 'admin') {
            $post->delete(); 
            return response()->json(['message' => 'Post deleted successfully']);
        }

        return response()->json(['message' => 'Unauthorized!'], 403);
    }
}