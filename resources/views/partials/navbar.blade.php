<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
        <a class="navbar-brand fw-bold text-success" href="#">Austify</a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item"><a class="nav-link" href="#">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Problems</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Collaborate</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Resources</a></li>
                <a class="nav-link" href="{{ route('login') }}">Login</a>
                <a class="btn btn-success ms-2" href="{{ route('register') }}">Register</a>
            </ul>
        </div>
    </div>
</nav>