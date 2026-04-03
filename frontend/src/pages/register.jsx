// src/pages/register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";

export default function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [github, setGithub] = useState("");
    const [password, setPassword] = useState("");
    const [countdown, setCountdown] = useState(2);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await api.post("/accounts/register", { name, email, github_link: github, password });
            
            // Store token and user info
            localStorage.setItem("austify_token", res.data.token);
            localStorage.setItem("user_name", res.data.user.name);
            localStorage.setItem("user_id", res.data.user.id);
            localStorage.setItem("user_email", email);
            localStorage.setItem("user_github", github);

            setSuccess(true);
            let count = 2;
            const timer = setInterval(() => {
                count--;
                setCountdown(count);
                if (count === 0) {
                    clearInterval(timer);
                    // Force navbar to update by triggering storage event
                    window.dispatchEvent(new Event("storage"));
                    navigate("/home");
                }
            }, 1000);
        } catch (err) {
            const errData = err.response?.data;
            if (errData && typeof errData === "object") {
                // Flatten and join error messages for display
                const messages = Object.keys(errData).map(key => `${key}: ${errData[key]}`).join(", ");
                setError(messages);
            } else {
                setError(err.response?.data?.message || "Registration failed. Please check your details.");
            }
        }
    };


    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "90vh", backgroundColor: "#1a202c" }}>
            <div className="card shadow-lg border-0" style={{ width: "100%", maxWidth: "450px", borderRadius: "12px" }}>
                <div className="card-body p-5">
                    <h2 className="text-center fw-bold mb-2" style={{ color: "#2d3748" }}>
                        Join <span style={{ color: "#48bb78" }}>Austify</span>
                    </h2>
                    <p className="text-center text-muted mb-4">Start collaborating with your peers</p>

                    {!success ? (
                        <form onSubmit={handleRegister}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ color: "#4a5568" }}>Full Name</label>
                                <input type="text" className="form-control p-2" required placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ color: "#4a5568" }}>Email Address</label>
                                <input type="email" className="form-control p-2" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ color: "#4a5568" }}>GitHub Link (Optional)</label>
                                <input type="url" className="form-control p-2" placeholder="https://github.com/yourprofile" value={github} onChange={(e) => setGithub(e.target.value)} />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-semibold" style={{ color: "#4a5568" }}>Password</label>
                                <input type="password" className="form-control p-2" required placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <button type="submit" className="btn w-100 fw-bold py-2 text-white" style={{ backgroundColor: "#48bb78", border: "none" }}>Create Account</button>
                        </form>
                    ) : (
                        <div className="text-center mt-3">
                            <div className="alert alert-success">
                                Registration successful! Redirecting in <strong>{countdown}</strong> seconds...
                            </div>
                        </div>
                    )}

                    {error && <div className="alert alert-danger mt-3">{error}</div>}

                    <div className="text-center mt-4">
                        <p className="small text-muted">
                            Already have an account?{" "}
                            <Link to="/login" style={{ color: "#48bb78", fontWeight: "bold", textDecoration: "none" }}>Log in here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}