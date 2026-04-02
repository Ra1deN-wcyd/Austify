// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

const Navbar = () => {
    const [userName, setUserName] = useState(null);
    const [token, setToken] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setToken(localStorage.getItem("austify_token"));
        setUserName(localStorage.getItem("user_name"));
    }, []);

    // Listen for storage changes (login/logout from other components)
    useEffect(() => {
        const handleStorageChange = () => {
            setToken(localStorage.getItem("austify_token"));
            setUserName(localStorage.getItem("user_name"));
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post("/accounts/logout");
        } catch (e) {
            console.log("Logged out locally");
        }
        localStorage.removeItem("austify_token");
        localStorage.removeItem("user_name");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_github");
        setToken(null);
        setUserName(null);
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand fw-bold text-success" to="/">
                    Austify
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`} id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center">
                        {token && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/home">
                                    Home
                                </Link>
                            </li>
                        )}
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                Problems
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                Collaborate
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                Resources
                            </a>
                        </li>

                        <div className="d-flex align-items-center ms-lg-3">
                            {token ? (
                                <>
                                    <Link className="nav-link text-light" to="/profile">
                                        👤 {userName}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="btn btn-danger ms-2"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link className="nav-link text-light" to="/login">
                                        Login
                                    </Link>
                                    <Link className="btn btn-success ms-2" to="/register">
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;