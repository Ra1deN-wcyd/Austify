<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class UserController extends Controller
{
    /**
     * SEARCH USERS BY NAME (POST)
     * Request Body: { "name": "Tam" }
     */
    public function search(Request $request)
    {
        // 1. Get name from JSON body
        $name = $request->input('name');

        // 2. Validation for empty search
        if (!$name || trim($name) === '') {
            return response()->json([
                'status' => 'error',
                'message' => 'Please provide a name in the request body.'
            ], 400);
        }

        // 3. Partial Match Logic (The "Search Bar" fix)
        // This finds "Tamjid Ahmed" even if you only type "Tam"
        $users = User::where('name', 'LIKE', '%' . $name . '%')
            ->select('id', 'name', 'role', 'github_link') // Role is public, Points/Email are hidden
            ->get();

        // 4. Case: No users found
        if ($users->isEmpty()) {
            return response()->json([
                'status' => 'success',
                'message' => 'No users found matching "' . $name . '"',
                'data' => []
            ], 200);
        }

        // 5. Success
        return response()->json([
            'status' => 'success',
            'count' => $users->count(),
            'data' => $users
        ], 200);
    }

    /**
     * PUBLIC PROFILE VIEW
     * GET /api/public-profile/{id}
     */
    public function showPublicProfile($id)
    {
        try {
            $user = User::findOrFail($id);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'name' => $user->name,
                    'role' => $user->role, // Visible to everyone
                    'github_link' => $user->github_link,
                    // Points and Email are NOT included here
                ]
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found.'
            ], 404);
        }
    }

    /**
     * PRIVATE PROFILE (Logged-in User Only)
     * GET /api/my-profile
     */
    public function myProfile(Request $request)
    {
        // $request->user() contains the full model including points/email
        return response()->json([
            'status' => 'success',
            'data' => $request->user()
        ], 200);
    }
/**
     * UPDATE PROFILE (Logged-in User Only)
     * POST /api/accounts/update-profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // 1. Validation
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'github_link' => 'sometimes|nullable|url',
        ]);

        // 2. Update only the allowed fields
        if ($request->has('name')) {
            $user->name = $request->input('name');
        }

        if ($request->has('github_link')) {
            $user->github_link = $request->input('github_link');
        }

        // 3. Save to Database
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully!',
            'data' => $user
        ], 200);
    }



}