<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    private ?bool $supportsGoogleId = null;

    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->stateless()
            ->scopes(['openid', 'profile', 'email'])
            ->with([
                'hd' => config('services.google.allowed_domain', 'aust.edu'),
                'prompt' => 'select_account',
            ])
            ->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (Throwable $e) {
            report($e);

            return redirect($this->frontendUrl() . '/login?error=google_failed');
        }

        $email = strtolower(trim((string) $googleUser->getEmail()));
        $googleId = (string) $googleUser->getId();
        $isVerified = filter_var($googleUser->user['verified_email'] ?? false, FILTER_VALIDATE_BOOL);

        if ($email === '' || ! $isVerified) {
            return redirect($this->frontendUrl() . '/login?error=unverified_google_email');
        }

        if (! $this->isInstitutionEmail($email)) {
            return redirect($this->frontendUrl() . '/login?error=not_aust_email');
        }

        $user = User::where('email', $email)->first();
        $supportsGoogleId = $this->supportsGoogleIdColumn();

        if ($supportsGoogleId) {
            $linkedUser = User::where('google_id', $googleId)->first();
            if ($linkedUser && strtolower($linkedUser->email) !== $email) {
                return redirect($this->frontendUrl() . '/login?error=google_account_conflict');
            }
        }

        if ($user) {
            $updates = [];

            if ($supportsGoogleId && ! $user->google_id) {
                $updates['google_id'] = $googleId;
            }

            if (! $user->email_verified_at) {
                $updates['email_verified_at'] = Carbon::now();
            }

            if ($updates !== []) {
                $user->update($updates);
            }
        } else {
            $attributes = [
                'name' => $googleUser->getName() ?: 'AUST User',
                'email' => $email,
                'email_verified_at' => Carbon::now(),
            ];

            if ($supportsGoogleId) {
                $attributes['google_id'] = $googleId;
                $attributes['password'] = null;
            } else {
                // Fallback for databases that have not received the google_id migration yet.
                $attributes['password'] = Str::random(40);
            }

            $user = User::create($attributes);
        }

        if ($user->is_banned) {
            return redirect($this->frontendUrl() . '/login?error=account_banned');
        }

        $token = $user->createToken('austify-google-token')->plainTextToken;

        return redirect("{$this->frontendUrl()}/auth/callback?token={$token}");
    }

    private function isInstitutionEmail(string $email): bool
    {
        $domain = strtolower((string) config('services.google.allowed_domain', 'aust.edu'));

        return str_ends_with($email, '@' . $domain);
    }

    private function frontendUrl(): string
    {
        $frontendUrl = env('APP_FRONTEND_URL') ?: env('APP_URL', 'http://localhost:8100');

        return rtrim((string) $frontendUrl, '/');
    }

    private function supportsGoogleIdColumn(): bool
    {
        return $this->supportsGoogleId ??= Schema::hasColumn('users', 'google_id');
    }
}
