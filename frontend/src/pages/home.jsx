// src/pages/home.jsx
import { useEffect, useState } from "react";

export default function Home() {
    const [userName, setUserName] = useState("");

    useEffect(() => {
        setUserName(localStorage.getItem("user_name") || "");
    }, []);

    return (
        <div>
            <section className="bg-dark text-white text-center py-5">
                <div className="container">
                    <h2
                        className="fw-bold mb-1"
                        style={{ fontSize: "2.5rem", color: "#48bb78", letterSpacing: "1px" }}
                    >
                        {userName && `Hello, ${userName}`}
                    </h2>
                    <h1 className="display-5 fw-bold text-success">Welcome to Austify</h1>
                    <p className="lead">A community platform for AUST CSE students to connect, collaborate, and grow.</p>
                </div>
            </section>

            <section className="py-5">
                <div className="container">
                    <div className="row text-center">
                        {[
                            { title: "🧩 Post Problems", text: "Share academic or coding problems and get help from peers." },
                            { title: "👥 Find Teammates", text: "Connect with students and build project teams easily." },
                            { title: "💬 Real-time Chat", text: "Communicate instantly with other students." },
                            { title: "📂 Share Resources", text: "Upload and access previous semester questions & solutions." },
                            { title: "🎯 Events", text: "Stay tuned for the upcoming events!! Participate, learn and grow together." },
                            { title: "⭐ Earn Points", text: "Gain points and unlock admin privileges." },
                        ].map((feature, idx) => (
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