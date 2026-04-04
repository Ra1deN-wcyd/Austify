import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout(); // AuthContext handles API call + token removal
        navigate('/login');
    };

    return (
        <>
            <style>{`
                .nav-link {
                    border-radius: 6px;
                    transition: all 0.3s;
                }
                .nav-link:hover {
                    background-color: #198754;
                    color: white !important;
                    padding: 6px 12px;
                }
            `}</style>

            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <Link className="navbar-brand fw-bold text-success" to="/">Austify</Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto align-items-center">

                            {user && (
                                <li className="nav-item">
                                    <Link className="nav-link" to="/home">Home</Link>
                                </li>
                            )}

                            <li className="nav-item">
                                <Link className="nav-link" to="/collaborations">Collaborate</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/chat">Chat</Link>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Problems</a>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/resources">Resources</Link>
                            </li>

                            <div className="d-flex align-items-center ms-lg-3">
                                {user ? (
                                    <>
                                        <Link className="nav-link text-light me-2" to="/profile">
                                            👤 {user.name}
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="btn btn-danger btn-sm"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link className="nav-link text-light" to="/login">Login</Link>
                                        <Link className="btn btn-success ms-2" to="/register">Register</Link>
                                    </>
                                )}
                            </div>

                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;