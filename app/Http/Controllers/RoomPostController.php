<?php

namespace App\Http\Controllers;

use App\Models\RoomPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoomPostController extends Controller
{
    // =========================================================================
    // 1. List / Browse — GET /api/room-posts
    // =========================================================================

    public function index(Request $request)
    {
        $filters = $request->only([
            'type', 'gender', 'location', 'room_type',
            'budget_min', 'budget_max', 'smoker', 'gamer', 'status',
        ]);

        $posts = RoomPost::applyFilters($filters)->paginate(12);

        return response()->json($posts);
    }

    // =========================================================================
    // 2. Create — POST /api/room-posts
    // =========================================================================

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type'             => 'required|in:looking_for_room,looking_for_roommate',
            'gender_preference'=> 'required|in:male,female,any',
            'location'         => 'required|string|max:255',
            'room_type'        => 'required|in:single,shared,sublet,flat',
            'rent_budget_min'  => 'nullable|integer|min:0',
            'rent_budget_max'  => 'nullable|integer|min:0|gte:rent_budget_min',
            'smoker'           => 'required|in:smoker,non_smoker,no_preference',
            'gamer_type'       => 'required|in:gamer,mild_gamer,non_gamer,no_preference',
            'move_in_date'     => 'nullable|date|after_or_equal:today',
            'description'      => 'required|string|min:20|max:1000',
            'contact_info'     => 'required|string|max:255',
        ]);

        $post = RoomPost::create(array_merge($validated, [
            'user_id' => Auth::id(),
            'status'  => 'active',
        ]));

        return response()->json([
            'message' => 'Room post created successfully.',
            'data'    => $post->load('user:id,name'),
        ], 201);
    }

    // =========================================================================
    // 3. Show — GET /api/room-posts/{id}
    // =========================================================================

    public function show($id)
    {
        $post = RoomPost::with('user:id,name')->findOrFail($id);

        return response()->json([
            'data' => $post,
        ]);
    }

    // =========================================================================
    // 4. Update — PUT /api/room-posts/{id}
    // =========================================================================

    public function update(Request $request, $id)
    {
        $post = RoomPost::findOrFail($id);

        if ($post->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'type'             => 'required|in:looking_for_room,looking_for_roommate',
            'gender_preference'=> 'required|in:male,female,any',
            'location'         => 'required|string|max:255',
            'room_type'        => 'required|in:single,shared,sublet,flat',
            'rent_budget_min'  => 'nullable|integer|min:0',
            'rent_budget_max'  => 'nullable|integer|min:0|gte:rent_budget_min',
            'smoker'           => 'required|in:smoker,non_smoker,no_preference',
            'gamer_type'       => 'required|in:gamer,mild_gamer,non_gamer,no_preference',
            'move_in_date'     => 'nullable|date|after_or_equal:today',
            'description'      => 'required|string|min:20|max:1000',
            'contact_info'     => 'required|string|max:255',
        ]);

        $post->update($validated);

        return response()->json([
            'message' => 'Room post updated successfully.',
            'data'    => $post->load('user:id,name'),
        ]);
    }

    // =========================================================================
    // 5. Delete — DELETE /api/room-posts/{id}
    // =========================================================================

    public function destroy($id)
    {
        $post = RoomPost::findOrFail($id);

        if ($post->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Room post deleted successfully.']);
    }

    // =========================================================================
    // 6. Toggle Status — PATCH /api/room-posts/{id}/status
    // =========================================================================

    public function toggleStatus($id)
    {
        $post = RoomPost::findOrFail($id);

        if ($post->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $post->update([
            'status' => $post->status === 'active' ? 'filled' : 'active',
        ]);

        return response()->json([
            'message' => 'Status updated.',
            'data'    => $post->load('user:id,name'),
        ]);
    }
}
