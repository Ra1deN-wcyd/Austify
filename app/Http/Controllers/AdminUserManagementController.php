<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminUserManagementController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->select(['id', 'name', 'email', 'role', 'is_banned', 'timeout_until', 'created_at'])
            ->orderByRaw("CASE WHEN role = 'admin' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $users,
        ]);
    }

    public function timeout(Request $request, int $id)
    {
        $request->validate([
            'duration' => ['required', Rule::in(['2_days', '7_days', '1_month', '3_months'])],
        ]);

        $target = User::findOrFail($id);

        if ($target->isAdmin()) {
            return response()->json([
                'message' => 'Admin accounts cannot be timed out.',
            ], 422);
        }

        $until = match ($request->string('duration')->toString()) {
            '2_days' => now()->addDays(2),
            '7_days' => now()->addDays(7),
            '1_month' => now()->addMonth(),
            '3_months' => now()->addMonths(3),
        };

        $target->timeout_until = $until;
        $target->save();

        return response()->json([
            'message' => 'Timeout applied successfully.',
            'data' => $target->fresh(),
        ]);
    }

    public function untimeout(int $id)
    {
        $target = User::findOrFail($id);
        $target->is_banned = false;
        $target->timeout_until = null;
        $target->save();

        return response()->json([
            'message' => 'Timeout cleared successfully.',
            'data' => $target,
        ]);
    }

    public function ban(int $id)
    {
        $target = User::findOrFail($id);

        if ($target->isAdmin()) {
            return response()->json([
                'message' => 'Admin accounts cannot be banned.',
            ], 422);
        }

        $target->is_banned = true;
        $target->timeout_until = null;
        $target->save();
        $target->tokens()->delete();

        return response()->json([
            'message' => 'User banned successfully.',
            'data' => $target,
        ]);
    }

    public function unban(int $id)
    {
        $target = User::findOrFail($id);
        $target->is_banned = false;
        $target->timeout_until = null;
        $target->save();

        return response()->json([
            'message' => 'User unbanned successfully.',
            'data' => $target,
        ]);
    }
}
