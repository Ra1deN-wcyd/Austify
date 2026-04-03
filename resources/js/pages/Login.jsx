import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '90vh', backgroundColor: '#1a202c' }}>
            <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '400px', backgroundColor: '#ffffff', borderRadius: '12px' }}>
                <div className="card-body p-5">
                    <h2 className="text-center fw-bold mb-2" style={{ color: '#2d3748' }}>
                        Login to <span style={{ color: '#48bb78' }}>Austify</span>
                    </h2>
                    <p className="text-center text-muted mb-4">Welcome back, student!</p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold" style={{ color: '#4a5568' }}>Email Address</label>
                            <input type="email" className="form-control p-2" placeholder="name@example.com"
                                value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="mb-4">
                            <label className="form-label fw-semibold" style={{ color: '#4a5568' }}>Password</label>
                            <input type="password" className="form-control p-2" placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn w-100 fw-bold py-2 text-white" style={{ backgroundColor: '#48bb78', border: 'none' }}>
                            Sign In
                        </button>
                    </form>

                    {error && <div className="alert alert-danger mt-3">{error}</div>}

                    <div className="text-center mt-4">
                        <p className="small text-muted">
                            New to the community?{' '}
                            <Link to="/register" className="fw-bold text-decoration-none" style={{ color: '#48bb78' }}>Create an account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;