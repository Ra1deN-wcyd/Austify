<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    // POST /api/accounts/register
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8',
            'github_link' => 'nullable|url'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'github_link' => $request->github_link,
        ]);

        return response()->json(['message' => 'Registration successful', 'user' => $user], 201);
    }

    // POST /api/accounts/login
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Generate the Bearer Token
        $token = $user->createToken('austify-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token // THIS is what you paste into Postman Auth
        ], 200);
    }

    // GET /api/accounts/{id}
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user, 200);
    }

    // POST /api/accounts/logout
   public function logout(Request $request)
{
    // Check if the user is actually authenticated
    if ($request->user()) {
        // This is the cleanest way. It tells the current token to delete itself.
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Successfully logged out.'], 200);
    }

    return response()->json(['message' => 'Not authenticated.'], 401);
}
}