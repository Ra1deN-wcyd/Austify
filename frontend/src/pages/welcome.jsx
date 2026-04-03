// src/pages/welcome.jsx
import { Link } from "react-router-dom";

export default function Welcome() {
    const features = [
        { title: "Post Problems", text: "Share academic or coding problems and get help from peers." },
        { title: "Find Teammates", text: "Connect with students and build project teams easily." },
        { title: "Real-time Chat", text: "Communicate instantly with other students." },
        { title: "Share Resources", text: "Upload and access previous semester questions & solutions." },
        { title: "Events", text: "Stay tuned for the upcoming events!! Participate, learn and grow together." },
        { title: "Earn Points", text: "Gain points and unlock admin privileges." },
    ];

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-dark text-white text-center py-5">
                <div className="container">
                    <h1 className="display-5 fw-bold text-success">Welcome to Austify</h1>
                    <p className="lead">A community platform for AUST CSE students to connect, collaborate, and grow.</p>
                    <Link to="/register" className="btn btn-success btn-lg me-2">Join Now</Link>
                    <a href="#" className="btn btn-outline-light btn-lg">Explore Problems</a>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-5">
                <div className="container">
                    <div className="row text-center">
                        {features.map((feature, idx) => (
                            <div key={idx} className="col-md-4 mb-4">
                                <div className="card shadow-sm h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">{feature.title}</h5>
                                        <p className="card-text">{feature.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
