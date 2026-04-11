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

    /**
     * Delete a comment (Owner or Admin).
     */
    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);
        $user = Auth::user();

        // Check if the user is the owner or an admin
        if ($user->id === $comment->user_id || $user->role === 'admin') {
            $comment->delete();
            return response()->json(['message' => 'Comment deleted successfully']);
        }

        return response()->json(['message' => 'Unauthorized!'], 403);
    }
}
