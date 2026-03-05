@extends('layouts.app')

@section('content')
<div class="d-flex align-items-center justify-content-center" style="min-height: 90vh; background-color: #1a202c;">
    <div class="card shadow-lg border-0" style="width: 100%; max-width: 450px; background-color: #ffffff; border-radius: 12px;">
        <div class="card-body p-5">
            <h2 class="text-center fw-bold mb-2" style="color: #2d3748;">Join <span style="color: #48bb78;">Austify</span></h2>
            <p class="text-center text-muted mb-4">Start collaborating with your peers</p>

            <form id="registerForm">
                <div class="mb-3">
                    <label class="form-label fw-semibold" style="color: #4a5568;">Full Name</label>
                    <input type="text" id="name" class="form-control p-2 border-secondary-subtle" placeholder="Enter your name" required>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-semibold" style="color: #4a5568;">Email Address</label>
                    <input type="email" id="email" class="form-control p-2 border-secondary-subtle" placeholder="name@example.com" required>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-semibold" style="color: #4a5568;">GitHub Link (Optional)</label>
                    <input type="url" id="github_link" class="form-control p-2 border-secondary-subtle" placeholder="https://github.com/yourprofile">
                </div>
                <div class="mb-4">
                    <label class="form-label fw-semibold" style="color: #4a5568;">Password</label>
                    <input type="password" id="password" class="form-control p-2 border-secondary-subtle" placeholder="Min 8 characters" required>
                </div>
                
                <button type="submit" class="btn w-100 fw-bold py-2 text-white" style="background-color: #48bb78; border: none;">
                    Create Account
                </button>
            </form>

            <div class="text-center mt-4">
                <p class="small text-muted">Already have an account? <a href="/login" class="fw-bold text-decoration-none" style="color: #48bb78;">Log in here</a></p>
            </div>
        </div>
    </div>
</div>

<script>
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const response = await fetch('/api/accounts/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                github_link: document.getElementById('github_link').value,
                password: document.getElementById('password').value
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Registration successful! You can now log in.");
            window.location.href = '/login';
        } else {
            // Displays validation errors from AuthController
            alert("Registration failed: " + JSON.stringify(result));
        }
    });
</script>
@endsection