<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TestMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Check if the header exists and matches our secret
        if ($request->header('X-API-TOKEN') !== 'my-secret-token') {
            return response()->json([
                'message' => 'Unauthorized. Please provide a valid X-API-TOKEN header.'
            ], 401);
        }

        return $next($request);
    }
}