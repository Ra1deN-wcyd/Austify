<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
// use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Store a new comment on a post.
     */
    public function store(Request $request, $postId)
    {
        $request->validate([
            'comment_text' => 'required|string|max:500',
        ]);

        $post = Post::findOrFail($postId);

        $comment = Comment::create([
            'user_id' => Auth::id(),
            'post_id' => $post->id,
            'comment_text' => $request->input('comment_text'),
        ]);

        return response()->json([
            'message' => 'Comment added!',
            'comment' => $comment->load('user:id,name'),
        ], 201);
    }
}
