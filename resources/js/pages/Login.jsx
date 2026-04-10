import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const GOOGLE_AUTH_URL = import.meta.env.VITE_GOOGLE_AUTH_URL || `${window.location.origin}/auth/google`;

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [authMethod, setAuthMethod] = useState('idle');

    const debounceRef = useRef(null);

    useEffect(() => {
        if (!email) {
            setAuthMethod('idle');
            return;
        }

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            if (!email.includes('@')) {
                return;
            }

            setChecking(true);
            try {
                const res = await api.post('/accounts/check-email', { email });
                setAuthMethod(res.data.auth_method);
            } catch {
                setAuthMethod('idle');
            } finally {
                setChecking(false);
            }
        }, 600);

        return () => clearTimeout(debounceRef.current);
    }, [email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };



    const handleGoogleLogin = () => {
        window.location.href = GOOGLE_AUTH_URL;
    };

    const cardStyle = {
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    };
    const accentGreen = '#48bb78';
    const btnGreen = {
        backgroundColor: accentGreen,
        border: 'none',
        color: '#fff',
        fontWeight: '700',
    };
    const googleBtnStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        width: '100%',
        padding: '10px 0',
        border: '1.5px solid #d1d5db',
        borderRadius: '8px',
        backgroundColor: '#fff',
        color: '#3c4043',
        fontWeight: '600',
        fontSize: '15px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
    };

    const renderAuthPrompt = () => {
        if (authMethod === 'invalid') {
            return (
                <div className="alert alert-warning mt-2 py-2 small">
                    Only <strong>@aust.edu</strong> emails, or the admin account, are allowed.
                </div>
            );
        }

        if (authMethod === 'new') {
            return (
                <div className="alert alert-info mt-2 py-2 small">
                    No account found. <Link to="/register" style={{ color: accentGreen, fontWeight: 700 }}>Register here</Link>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '90vh', backgroundColor: '#1a202c' }}>
            <div className="card shadow-lg border-0" style={cardStyle}>
                <div className="card-body p-5">
                    <h2 className="text-center fw-bold mb-2" style={{ color: '#2d3748' }}>
                        Login to <span style={{ color: accentGreen }}>Austify</span>
                    </h2>
                    <p className="text-center text-muted mb-4">Welcome back, student!</p>

                    <button
                        id="btn-google-login"
                        style={googleBtnStyle}
                        onClick={handleGoogleLogin}
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
                        Continue with Google
                    </button>

                    {authMethod !== 'google' && (
                        <div className="d-flex align-items-center my-3">
                            <hr className="flex-grow-1" />
                            <span className="px-2 text-muted small">or</span>
                            <hr className="flex-grow-1" />
                        </div>
                    )}

                    {authMethod === 'google' ? (
                        <div className="alert alert-info text-center small mt-3 mb-0">
                            This account uses <strong>Google Sign-In</strong>.<br />
                            Click "Continue with Google" above to access your account.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ color: '#4a5568' }}>
                                    Email Address
                                    {checking && <span className="text-muted ms-2 small">(checking...)</span>}
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    className="form-control p-2"
                                    placeholder="name@aust.edu"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                                {renderAuthPrompt()}
                            </div>

                            {(authMethod === 'password' || authMethod === 'idle') && (
                                <div className="mb-4">
                                    <label className="form-label fw-semibold" style={{ color: '#4a5568' }}>Password</label>
                                    <input
                                        id="login-password"
                                        type="password"
                                        className="form-control p-2"
                                        placeholder="********"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            {authMethod !== 'invalid' && authMethod !== 'new' && (
                                <button
                                    id="btn-login-submit"
                                    type="submit"
                                    className="btn w-100 fw-bold py-2 text-white"
                                    style={btnGreen}
                                    disabled={loading || checking}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>
                            )}
                        </form>
                    )}

                    {error && <div className="alert alert-danger mt-3">{error}</div>}

                    <div className="text-center mt-4">
                        <p className="small text-muted">
                            New to the community?{' '}
                            <Link to="/register" className="fw-bold text-decoration-none" style={{ color: accentGreen }}>
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
