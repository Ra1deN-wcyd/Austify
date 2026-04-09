import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
    const { user } = useContext(AuthContext);

    const features = [
        {
            icon: "🧩",
            title: "Post Problems",
            desc: "Share academic or coding problems and get help from peers.",
        },
        {
            icon: "👥",
            title: "Find Teammates",
            desc: "Connect with students and build project teams easily.",
        },
        {
            icon: "💬",
            title: "Real-time Chat",
            desc: "Communicate instantly with other students.",
        },
        {
            icon: "📂",
            title: "Share Resources",
            desc: "Upload and access previous semester questions & solutions.",
        },
        {
            icon: "🎯",
            title: "Events",
            desc: "Stay tuned for the upcoming events!! Participate, learn and grow together.",
        },
        {
            icon: "⭐",
            title: "Earn Points",
            desc: "Gain points and unlock admin privileges.",
        },
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="bg-dark text-white text-center py-5">
                <div className="container">
                    {user && (
                        <h2
                            className="fw-bold mb-1"
                            style={{
                                fontSize: "2.5rem",
                                color: "#48bb78",
                                letterSpacing: "1px",
                            }}
                        >
                            Hello, {user.name ?? user.username ?? user.full_name ?? "there"}
                        </h2>
                    )}
                    <h1 className="display-5 fw-bold text-success">
                        Welcome to Austify
                    </h1>
                    <p className="lead">
                        A community platform for AUST CSE students to connect,
                        collaborate, and grow.
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-5">
                <div className="container">
                    <div className="row text-center">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="col-md-4 mb-4"
                            >
                                <div className="card shadow-sm h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            {feature.icon} {feature.title}
                                        </h5>
                                        <p className="card-text">
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}