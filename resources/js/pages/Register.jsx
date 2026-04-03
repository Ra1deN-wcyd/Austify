import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

function Register() {
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', github_link: '', password: '' });
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(2);
    const [error, setError] = useState('');

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/api/accounts/register', form);
            setSuccess(true);
            let count = 2;
            const timer = setInterval(() => {
                count--;
                setCountdown(count);
                if (count === 0) { clearInterval(timer); navigate('/login'); }
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || JSON.stringify(err.response?.data || 'Registration failed.'));
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '90vh', backgroundColor: '#1a202c' }}>
            <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '450px', backgroundColor: '#ffffff', borderRadius: '12px' }}>
                <div className="card-body p-5">
                    <h2 className="text-center fw-bold mb-2" style={{ color: '#2d3748' }}>
                        Join <span style={{ color: '#48bb78' }}>Austify</span>
                    </h2>
                    <p className="text-center text-muted mb-4">Start collaborating with your peers</p>

                    {!success ? (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ color: '#4a5568' }}>Full Name</label>
                                <input type="text" name="name" className="form-control p-2" placeholder="Enter your name"
                                    value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ color: '#4a5568' }}>Email Address</label>
                                <input type="email" name="email" className="form-control p-2" placeholder="name@example.com"
                                    value={form.email} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ color: '#4a5568' }}>GitHub Link (Optional)</label>
                                <input type="url" name="github_link" className="form-control p-2" placeholder="https://github.com/yourprofile"
                                    value={form.github_link} onChange={handleChange} />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-semibold" style={{ color: '#4a5568' }}>Password</label>
                                <input type="password" name="password" className="form-control p-2" placeholder="Min 8 characters"
                                    value={form.password} onChange={handleChange} required />
                            </div>
                            <button type="submit" className="btn w-100 fw-bold py-2 text-white" style={{ backgroundColor: '#48bb78', border: 'none' }}>
                                Create Account
                            </button>
                            {error && <div className="alert alert-danger mt-3">{error}</div>}
                        </form>
                    ) : (
                        <div className="alert alert-success text-center">
                            Registration successful! Redirecting in <strong>{countdown}</strong> seconds...
                        </div>
                    )}

                    <div className="text-center mt-4">
                        <p className="small text-muted">
                            Already have an account?{' '}
                            <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#48bb78' }}>Log in here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
