
@extends('layouts.app')

@section('content')

<!-- Hero Section -->
<section class="bg-dark text-white text-center py-5">
    <div class="container">
        <h1 class="display-5 fw-bold text-success">Welcome to Austify</h1>
        <p class="lead">A community platform for AUST CSE students to connect, collaborate, and grow.</p>
        <a href="#" class="btn btn-success btn-lg me-2">Join Now</a>
        <a href="#" class="btn btn-outline-light btn-lg">Explore Problems</a>
    </div>
</section>

<!-- Features Section -->
<section class="py-5">
    <div class="container">
        <div class="row text-center">

            <div class="col-md-4 mb-4">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">Post Problems</h5>
                        <p class="card-text">Share academic or coding problems and get help from peers.</p>
                    </div>
                </div>
            </div>

            <div class="col-md-4 mb-4">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">Find Teammates</h5>
                        <p class="card-text">Connect with students and build project teams easily.</p>
                    </div>
                </div>
            </div>

            <div class="col-md-4 mb-4">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">Real-time Chat</h5>
                        <p class="card-text">Communicate instantly with other students.</p>
                    </div>
                </div>
            </div>

        <div class="col-md-4 mb-4">
    <div class="card shadow-sm h-100">
        <div class="card-body">
            <h5 class="card-title">Share Resources</h5>
            <p class="card-text">Upload and access previous semester questions & solutions.</p>
        </div>
    </div>
</div>

<div class="col-md-4 mb-4">
    <div class="card shadow-sm h-100">
        <div class="card-body">
            <h5 class="card-title">Events</h5>
            <p class="card-text">
                Stay tuned for the upcoming events!! Participate, learn and grow together.
            </p>
        </div>
    </div>
</div>

<div class="col-md-4 mb-4">
    <div class="card shadow-sm h-100">
        <div class="card-body">
            <h5 class="card-title">Earn Points</h5>
            <p class="card-text">Gain points and unlock admin privileges.</p>
        </div>
    </div>
</div>

        </div>
    </div>
</section>

@endsection