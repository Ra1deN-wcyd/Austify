// src/pages/login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await api.post("/accounts/login", { email, password });

            localStorage.setItem("austify_token", res.data.token);
            localStorage.setItem("user_name", res.data.user.name);
            localStorage.setItem("user_id", res.data.user.id);
            localStorage.setItem("user_email", email);
            localStorage.setItem("user_github", res.data.user.github_link || "");

            // Force navbar to update
            window.dispatchEvent(new Event("storage"));
            navigate("/home");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "90vh", backgroundColor: "#1a202c" }}>
            <div className="card shadow-lg border-0" style={{ width: "100%", maxWidth: "400px", borderRadius: "12px" }}>
                <div className="card-body p-5">
                    <h2 className="text-center fw-bold mb-2" style={{ color: "#2d3748" }}>
                        Login to <span style={{ color: "#48bb78" }}>Austify</span>
                    </h2>
                    <p className="text-center text-muted mb-4">Welcome back, student!</p>

                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold" style={{ color: "#4a5568" }}>Email Address</label>
                            <input
                                type="email"
                                className="form-control p-2"
                                required
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-semibold" style={{ color: "#4a5568" }}>Password</label>
                            <input
                                type="password"
                                className="form-control p-2"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn w-100 fw-bold py-2 text-white" style={{ backgroundColor: "#48bb78", border: "none" }} disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    {error && <div className="alert alert-danger mt-3">{error}</div>}

                    <div className="text-center mt-4">
                        <p className="small text-muted">
                            New to the community?{" "}
                            <Link to="/register" style={{ color: "#48bb78", fontWeight: "bold", textDecoration: "none" }}>Create an account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}