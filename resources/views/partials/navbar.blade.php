<style>
    .nav-link {
        border-radius: 6px;
        transition: all 0.3s;
    }
    .nav-link:hover {
        background-color: #198754;
        color: white !important;
        padding: 6px 12px;
    }
</style>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
        <a class="navbar-brand fw-bold text-success" href="/">Austify</a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto align-items-center">
                <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Problems</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Collaborate</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Resources</a></li>
                
                <div id="auth-links" class="d-flex align-items-center ms-lg-3">
                    </div>
            </ul>
        </div>
    </div>
</nav>

<script>
    function updateNavbar() {
        const token = localStorage.getItem('austify_token');
        const userName = localStorage.getItem('user_name');
        const authLinks = document.getElementById('auth-links');

        if (token) {
            // User is logged in: Show Name and Logout
            authLinks.innerHTML = `
                <span class="text-light me-3">Hi, ${userName}</span>
                <button onclick="handleLogout()" class="btn btn-outline-danger btn-sm">Logout</button>
            `;
        } else {
            // User is logged out: Show Login and Register
            authLinks.innerHTML = `
                <a class="nav-link text-light" href="/login">Login</a>
                <a class="btn btn-success ms-2" href="/register">Register</a>
            `;
        }
    }

    async function handleLogout() {
        const token = localStorage.getItem('austify_token');
        
        // Optional: Notify backend to revoke token
        try {
            await fetch('/api/accounts/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
        } catch (e) { console.log("Logged out locally"); }

        localStorage.removeItem('austify_token');
        localStorage.removeItem('user_name');
        window.location.href = '/login';
    }

    // Initialize navbar on load
    document.addEventListener('DOMContentLoaded', updateNavbar);
</script>