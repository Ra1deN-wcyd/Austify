import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function OAuthCallback() {
    const { hydrateGoogleSession, loginWithToken } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Processing your Google login...');
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const error = params.get('error');
        const userRaw = params.get('user');

        if (error) {
            let message = 'Google sign-in failed. Please try again.';

            if (error === 'not_aust_email') {
                message = 'Only @aust.edu Google accounts are allowed. Please use your university email.';
            } else if (error === 'unverified_google_email') {
                message = 'Your Google email is not verified. Please verify it and try again.';
            } else if (error === 'google_account_conflict') {
                message = 'This Google account is already linked somewhere else. Please contact support.';
            }

            setStatus(message);
            setTimeout(() => navigate('/login', { replace: true }), 3000);
            return;
        }

        if (!token) {
            setStatus('Missing session data. Redirecting to login...');
            setTimeout(() => navigate('/login', { replace: true }), 2500);
            return;
        }

        const completeLogin = async () => {
            try {
                if (userRaw) {
                    const userData = JSON.parse(decodeURIComponent(userRaw));
                    loginWithToken(token, userData);
                } else {
                    await hydrateGoogleSession(token);
                }

                window.history.replaceState({}, document.title, '/auth/callback');
                navigate('/home', { replace: true });
            } catch {
                setStatus('Could not finish Google sign-in. Redirecting to login...');
                setTimeout(() => navigate('/login', { replace: true }), 2500);
            }
        };

        completeLogin();
    }, [hydrateGoogleSession, loginWithToken, navigate]);

    return (
        <div
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: '90vh', backgroundColor: '#1a202c' }}
        >
            <div
                className="text-center p-5"
                style={{
                    backgroundColor: '#2d3748',
                    borderRadius: '16px',
                    color: '#e2e8f0',
                    maxWidth: '400px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                }}
            >
                <div
                    className="spinner-border mb-3"
                    role="status"
                    style={{ color: '#48bb78', width: '3rem', height: '3rem' }}
                >
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="fw-semibold">{status}</h5>
            </div>
        </div>
    );
}

export default OAuthCallback;
