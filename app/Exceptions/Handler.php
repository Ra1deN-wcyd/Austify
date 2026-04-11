<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $exception)
    {
        if ($exception instanceof BadRequestException) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 400);
        }

        // Default response for unexpected exceptions (only in production)
        if (app()->environment('production')) {
            return response()->json([
                'error' => true,
                'message' => 'An unexpected error occurred',
            ], 500);
        }

        return parent::render($request, $exception);

    }

}
