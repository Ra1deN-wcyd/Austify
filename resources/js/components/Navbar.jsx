import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <>
            <style>{`
                .pw-nav {
                    background: #0f1117;
                    border-bottom: 1px solid rgba(72,187,120,0.1);
                    padding: 12px 0;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .pw-nav .navbar-brand {
                    font-family: 'Syne', sans-serif;
                    font-size: 20px;
                    font-weight: 800;
                    color: #f0f6f0 !important;
                    letter-spacing: -0.5px;
                }
                .pw-nav .navbar-brand span { color: #48bb78; }
                .pw-nav .nav-link {
                    color: #8b9a8b !important;
                    font-size: 14px;
                    font-weight: 400;
                    border-radius: 6px;
                    transition: color 0.2s;
                    padding: 6px 12px;
                }
                .pw-nav .nav-link:hover {
                    color: #48bb78 !important;
                    background: rgba(72,187,120,0.08);
                }
                .pw-nav .nav-link.active-link {
                    color: #48bb78 !important;
                }
                .pw-nav .navbar-toggler {
                    border-color: rgba(72,187,120,0.3);
                }
                .pw-nav .navbar-toggler-icon {
                    filter: invert(1);
                }
                .pw-user-chip {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #f0f6f0 !important;
                    font-size: 14px;
                    padding: 6px 12px;
                    border-radius: 100px;
                    background: rgba(72,187,120,0.08);
                    border: 1px solid rgba(72,187,120,0.15);
                    text-decoration: none;
                    transition: border-color 0.2s;
                }
                .pw-user-chip:hover {
                    border-color: rgba(72,187,120,0.4);
                    color: #48bb78 !important;
                }
                .pw-logout-btn {
                    background: rgba(252,129,129,0.1);
                    border: 1px solid rgba(252,129,129,0.2);
                    color: #fc8181;
                    font-size: 13px;
                    padding: 6px 16px;
                    border-radius: 100px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .pw-logout-btn:hover {
                    background: rgba(252,129,129,0.2);
                    border-color: #fc8181;
                }
                .pw-register-btn {
                    background: #48bb78;
                    color: #0f1117 !important;
                    font-weight: 700;
                    padding: 7px 18px;
                    border-radius: 100px;
                    font-size: 13px;
                    text-decoration: none;
                    transition: background 0.15s, transform 0.15s;
                }
                .pw-register-btn:hover {
                    background: #68d391;
                    transform: scale(1.03);
                    color: #0f1117 !important;
                }
            `}</style>

            <nav className="navbar navbar-expand-lg pw-nav">
                <div className="container">
                    <Link className="navbar-brand" to="/">
                        Austify
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto align-items-center gap-1">

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
                                <Link className="nav-link" to="/problem">Problem</Link>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Resources</a>
                            </li>

                            <div className="d-flex align-items-center ms-lg-3 gap-2">
                                {user ? (
                                    <>
                                        <Link className="pw-user-chip" to="/profile">
                                            👤 {user.name}
                                        </Link>
                                        <button onClick={handleLogout} className="pw-logout-btn">
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link className="nav-link" to="/login">Login</Link>
                                        <Link className="pw-register-btn" to="/register">Register</Link>
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