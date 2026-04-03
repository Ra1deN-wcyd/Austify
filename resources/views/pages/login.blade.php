@extends('layouts.app')

@section('content')

<div class="d-flex align-items-center justify-content-center" style="min-height: 90vh; background-color: #1a202c;">
    <div class="card shadow-lg border-0" style="width: 100%; max-width: 400px; background-color: #ffffff; border-radius: 12px;">
        <div class="card-body p-5">

            <h2 class="text-center fw-bold mb-2" style="color: #2d3748;">
                Login to <span style="color: #48bb78;">Austify</span>
            </h2>
            <p class="text-center text-muted mb-4">Welcome back, student!</p>

            <form id="loginForm">

                <div class="mb-3">
                    <label class="form-label fw-semibold" style="color: #4a5568;">Email Address</label>
                    <input type="email" id="email" class="form-control p-2" placeholder="name@example.com" required>
                </div>

                <div class="mb-4">
                    <label class="form-label fw-semibold" style="color: #4a5568;">Password</label>
                    <input type="password" id="password" class="form-control p-2" placeholder="••••••••" required>
                </div>

                <button type="submit" class="btn w-100 fw-bold py-2 text-white" style="background-color: #48bb78; border: none;">
                    Sign In
                </button>

            </form>

            <!-- error message -->
            <div id="errorBox" class="alert alert-danger mt-3" style="display:none;"></div>

            <div class="text-center mt-4">
                <p class="small text-muted">
                    New to the community?
                    <a href="/register" class="fw-bold text-decoration-none" style="color: #48bb78;">Create an account</a>
                </p>
            </div>

        </div>
    </div>
</div>

<script>
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const response = await fetch('/api/accounts/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            email:    document.getElementById('email').value,
            password: document.getElementById('password').value
        })
    });

    const result = await response.json();

    if (response.ok) {

        // save all user data to localStorage
        localStorage.setItem('austify_token', result.token);
        localStorage.setItem('user_name',     result.user.name);
        localStorage.setItem('user_id',       result.user.id);
        localStorage.setItem('user_email',    document.getElementById('email').value);
        localStorage.setItem('user_github',   result.user.github_link || '');

        window.location.href = '/home';

    } else {
        const errorBox = document.getElementById('errorBox');
        errorBox.style.display = 'block';
        errorBox.textContent = result.message || 'Invalid credentials. Please try again.';
    }
});
</script>

@endsection