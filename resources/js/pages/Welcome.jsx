import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Welcome() {
    const { user } = useAuth();

    return (
        <>
            <section className="bg-dark text-white text-center py-5">
                <div className="container">
                    {user && (
                        <h2 className="fw-bold mb-1" style={{ fontSize: '2.5rem', color: '#48bb78', letterSpacing: '1px' }}>
                            Hello, {user.name}
                        </h2>
                    )}
                    <h1 className="display-5 fw-bold text-success">Welcome to Austify</h1>
                    <p className="lead">A community platform for AUST CSE students to connect, collaborate, and grow.</p>
                    {!user && (
                        <>
                            <Link to="/register" className="btn btn-success btn-lg me-2">Join Now</Link>
                            <Link to="/home" className="btn btn-outline-light btn-lg">Explore Problems</Link>
                        </>
                    )}
                </div>
            </section>

            <section className="py-5">
                <div className="container">
                    <div className="row text-center">
                        {[
                            { icon: '🧩', title: 'Post Problems', desc: 'Share academic or coding problems and get help from peers.' },
                            { icon: '👥', title: 'Find Teammates', desc: 'Connect with students and build project teams easily.' },
                            { icon: '💬', title: 'Real-time Chat', desc: 'Communicate instantly with other students.' },
                            { icon: '📂', title: 'Share Resources', desc: 'Upload and access previous semester questions & solutions.' },
                            { icon: '🎯', title: 'Events', desc: 'Stay tuned for the upcoming events!! Participate, learn and grow together.' },
                            { icon: '⭐', title: 'Earn Points', desc: 'Gain points and unlock admin privileges.' },
                        ].map((f, i) => (
                            <div className="col-md-4 mb-4" key={i}>
                                <div className="card shadow-sm h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">{f.icon} {f.title}</h5>
                                        <p className="card-text">{f.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="bg-dark text-white text-center py-3 mt-5">
                <small>© 2026 Austify | Built for AUST CSE Students</small>
            </footer>
        </>
    );
}

export default Welcome;