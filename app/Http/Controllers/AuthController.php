<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Throwable;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email:rfc,dns|unique:users',
            'password' => 'required|string|min:8',
            'github_link' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $email = $this->normalizeEmail($request->email);

        if (! $this->isInstitutionEmail($email)) {
            return response()->json([
                'message' => 'Only @' . $this->allowedDomain() . ' email addresses are allowed to register.',
            ], 403);
        }

        if (! $this->verifyEmailExistsOverSmtp($email)) {
            return response()->json([
                'message' => 'This exact email address does not appear to exist. Please verify your department/ID and try again.',
            ], 422);
        }

        $user = DB::transaction(function () use ($request, $email) {
            $user = User::create([
                'name' => $request->name,
                'email' => $email,
                'password' => $request->password,
                'github_link' => $request->github_link,
            ]);

            return $user;
        });

        return response()->json([
            'message' => 'Registration successful. You can now log in.',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $email = $this->normalizeEmail($request->email);
        $user = User::where('email', $email)->first();

        if (! $this->canUsePasswordLogin($email, $user)) {
            return response()->json([
                'message' => 'Only @' . $this->allowedDomain() . ' email addresses are allowed.',
            ], 403);
        }

        if ($user && $user->google_id && ! $user->password) {
            return response()->json([
                'message' => 'This account uses Google Sign-In. Please use the "Continue with Google" button.',
            ], 403);
        }

        if (! $user || ! $user->password || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if ($user->is_banned) {
            return response()->json([
                'message' => 'Your account is permanently banned.',
            ], 403);
        }

        $token = $user->createToken('austify-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ], 200);
    }

    public function checkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $email = $this->normalizeEmail($request->email);

        if (! $this->isInstitutionEmail($email) && ! $this->isAdminBypassEmail($email)) {
            return response()->json(['auth_method' => 'invalid'], 200);
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            return response()->json(['auth_method' => 'new'], 200);
        }

        if ($user->google_id && ! $user->password) {
            return response()->json(['auth_method' => 'google'], 200);
        }

        return response()->json(['auth_method' => 'password'], 200);
    }

    public function resendVerificationEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $email = $this->normalizeEmail($request->email);

        if (! $this->isInstitutionEmail($email) && ! $this->isAdminBypassEmail($email)) {
            return response()->json(['message' => 'This email is not allowed for registration.'], 403);
        }

        $user = User::where('email', $email)->first();

        if (! $user || ! $user->password) {
            return response()->json(['message' => 'No password-based account was found for this email.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'This email is already verified.'], 200);
        }

        try {
            $user->sendEmailVerificationNotification();
        } catch (Throwable $exception) {
            Log::error('Resending verification email failed.', [
                'email' => $email,
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'We could not send the verification email right now. Please check the mail configuration and try again.',
            ], 503);
        }

        return response()->json(['message' => 'Verification email sent. Please check your inbox.'], 200);
    }

    public function verifyEmail(Request $request, int $id, string $hash)
    {
        $user = User::find($id);

        if (! $user) {
            return redirect($this->frontendUrl() . '/login?verification=invalid');
        }

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return redirect($this->frontendUrl() . '/login?verification=invalid');
        }

        if (! $request->hasValidSignature()) {
            return redirect($this->frontendUrl() . '/login?verification=expired');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return redirect($this->frontendUrl() . '/login?verification=success');
    }

    public function show($id)
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user, 200);
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();

            return response()->json(['message' => 'Successfully logged out.'], 200);
        }

        return response()->json(['message' => 'Not authenticated.'], 401);
    }

    private function normalizeEmail(string $email): string
    {
        return strtolower(trim($email));
    }

    private function allowedDomain(): string
    {
        return strtolower((string) config('auth.allowed_email_domain', 'aust.edu'));
    }

    private function isInstitutionEmail(string $email): bool
    {
        return str_ends_with($email, '@' . $this->allowedDomain());
    }

    private function isAdminBypassEmail(string $email): bool
    {
        return $email === strtolower((string) config('auth.admin_bypass_email', 'tamjid@gmail.com'));
    }

    private function canUsePasswordLogin(string $email, ?User $user): bool
    {
        if ($this->isInstitutionEmail($email) || $this->isAdminBypassEmail($email)) {
            return true;
        }

        return $user?->role === 'admin';
    }

    private function frontendUrl(): string
    {
        $frontendUrl = env('APP_FRONTEND_URL') ?: env('APP_URL', 'http://localhost:8100');

        return rtrim((string) $frontendUrl, '/');
    }

    private function verifyEmailExistsOverSmtp(string $email): bool
    {
        $domain = substr(strrchr($email, "@"), 1);
        
        if (!getmxrr($domain, $mxhosts) || empty($mxhosts)) {
            return false;
        }

        $mx = $mxhosts[0];
        $fp = @fsockopen($mx, 25, $errno, $errstr, 5);
        
        if (!$fp) {
            // If connection to port 25 fails, fallback to true so we don't break registration for network issues
            return true;
        }

        stream_set_timeout($fp, 5);
        fread($fp, 2048);
        fputs($fp, "HELO austify.edu\r\n");
        fread($fp, 2048);
        fputs($fp, "MAIL FROM: <noreply@austify.edu>\r\n");
        fread($fp, 2048);
        fputs($fp, "RCPT TO: <$email>\r\n");
        $res = fread($fp, 2048);
        fputs($fp, "QUIT\r\n");
        fclose($fp);

        if (strpos($res, '550') !== false) {
            return false;
        }

        return true;
    }
}
