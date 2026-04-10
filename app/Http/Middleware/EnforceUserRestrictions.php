<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceUserRestrictions
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        if ($user->isAdmin()) {
            return $next($request);
        }

        if ($user->is_banned) {
            $user->currentAccessToken()?->delete();

            return response()->json([
                'message' => 'Your account is permanently banned.',
            ], 403);
        }

        if ($user->timeout_until && now()->gte($user->timeout_until)) {
            $user->timeout_until = null;
            $user->save();
        }

        if (
            $user->timeout_until &&
            now()->lt($user->timeout_until) &&
            ! in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'], true)
        ) {
            return response()->json([
                'message' => 'You are in read-only mode until ' . $user->timeout_until->toDateTimeString() . ' due to a community violation.',
                'timeout_until' => $user->timeout_until->toISOString(),
            ], 403);
        }

        return $next($request);
    }
}
