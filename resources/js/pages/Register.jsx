import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';

const GOOGLE_AUTH_URL = import.meta.env.VITE_GOOGLE_AUTH_URL || `${window.location.origin}/auth/google`;

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', github_link: '', password: '' });
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(4);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [registeredEmail, setRegisteredEmail] = useState('');

    const extractErrorMessage = (err) => {
        const payload = err.response?.data;

        if (typeof payload?.message === 'string' && payload.message.trim()) {
            return payload.message;
        }

        if (payload && typeof payload === 'object') {
            const firstFieldError = Object.values(payload).flat().find(Boolean);
            if (typeof firstFieldError === 'string') {
                return firstFieldError;
            }
        }

        return 'Registration failed.';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (name === 'email') {
            if (value && !value.toLowerCase().endsWith('@aust.edu')) {
                setEmailError('Only @aust.edu email addresses are allowed.');
            } else {
                setEmailError('');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.email.toLowerCase().endsWith('@aust.edu')) {
            setEmailError('Only @aust.edu email addresses are allowed.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/accounts/register', form);
            setRegisteredEmail(form.email.trim().toLowerCase());
            setSuccess(true);
            let count = 4;
            const timer = setInterval(() => {
                count -= 1;
                setCountdown(count);
                if (count === 0) {
                    clearInterval(timer);
                    navigate('/login');
                }
            }, 1000);
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        window.location.href = GOOGLE_AUTH_URL;
    };

    const accentGreen = '#48bb78';
    const btnGreen = { backgroundColor: accentGreen, border: 'none', color: '#fff', fontWeight: '700' };
    const googleBtnStyle = {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        width: '100%', padding: '10px 0',
        border: '1.5px solid #d1d5db', borderRadius: '8px',
        backgroundColor: '#fff', color: '#3c4043',
        fontWeight: '600', fontSize: '15px', cursor: 'pointer',
        transition: 'box-shadow 0.2s',
    };

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '90vh', backgroundColor: '#1a202c' }}>
            <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '450px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                <div className="card-body p-5">
                    <h2 className="text-center fw-bold mb-2" style={{ color: '#2d3748' }}>
                        Join <span style={{ color: accentGreen }}>Austify</span>
                    </h2>
                    <p className="text-center text-muted mb-4">Start collaborating with your peers</p>

                    {!success ? (
                        <>
                            <button
                                id="btn-google-register"
                                style={googleBtnStyle}
                                onClick={handleGoogleRegister}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                                type="button"
                            >
                                <svg width="20" height="20" viewBox="0 0 48 48">
                                    <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.2 33.6 29.6 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.5-4z"/>
                                    <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 16.6 19.2 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.5-17.7 11.7z"/>
                                    <path fill="#FBBC05" d="M24 45c5.5 0 10.4-1.9 14.2-5L31.5 34c-2 1.4-4.6 2.2-7.5 2.2-5.5 0-10.2-3.7-11.8-8.8l-7 5.4C8 39.8 15.4 45 24 45z"/>
                                    <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.8 2.5-2.4 4.6-4.6 6l6.7 5.2C41.8 36.2 45 30.5 45 24c0-1.3-.2-2.7-.5-4z"/>
                                </svg>
                                Sign up with Google (@aust.edu only)
                            </button>

                            <div className="d-flex align-items-center my-3">
                                <hr className="flex-grow-1" />
                                <span className="px-2 text-muted small">or register with email</span>
                                <hr className="flex-grow-1" />
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold" style={{ color: '#4a5568' }}>Full Name</label>
                                    <input
                                        id="register-name"
                                        type="text"
                                        name="name"
                                        className="form-control p-2"
                                        placeholder="Enter your name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold" style={{ color: '#4a5568' }}>Email Address</label>
                                    <input
                                        id="register-email"
                                        type="email"
                                        name="email"
                                        className={`form-control p-2 ${emailError ? 'is-invalid' : ''}`}
                                        placeholder="name@aust.edu"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    {emailError && <div className="invalid-feedback">{emailError}</div>}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold" style={{ color: '#4a5568' }}>GitHub Link (Optional)</label>
                                    <input
                                        id="register-github"
                                        type="url"
                                        name="github_link"
                                        className="form-control p-2"
                                        placeholder="https://github.com/yourprofile"
                                        value={form.github_link}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-semibold" style={{ color: '#4a5568' }}>Password</label>
                                    <input
                                        id="register-password"
                                        type="password"
                                        name="password"
                                        className="form-control p-2"
                                        placeholder="Min 8 characters"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <button
                                    id="btn-register-submit"
                                    type="submit"
                                    className="btn w-100 fw-bold py-2 text-white"
                                    style={btnGreen}
                                    disabled={loading || !!emailError}
                                >
                                    {loading ? 'Creating account...' : 'Create Account'}
                                </button>
                                {error && <div className="alert alert-danger mt-3">{error}</div>}
                            </form>
                        </>
                    ) : (
                        <div className="alert alert-success text-center">
                            Registration successful. You can log in now! Redirecting in <strong>{countdown}</strong> seconds...
                        </div>
                    )}

                    <div className="text-center mt-4">
                        <p className="small text-muted">
                            Already have an account?{' '}
                            <Link to="/login" className="fw-bold text-decoration-none" style={{ color: accentGreen }}>
                                Log in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
