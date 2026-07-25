import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        setMenuOpen(false);
        await logout();
        navigate('/login');
    };

    const close = () => setMenuOpen(false);

    const activeClass = ({ isActive }) => `pw-nav-link${isActive ? ' pw-nav-link--active' : ''}`;
    const bnClass    = ({ isActive }) => `pw-bn-item${isActive ? ' pw-bn-item--active' : ''}`;

    return (
        <>
            <style>{`
                /* ─────────────────────────────────────────
                   GOOGLE FONT
                ───────────────────────────────────────── */
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');

                /* ─────────────────────────────────────────
                   TOP NAVBAR
                ───────────────────────────────────────── */
                .pw-topnav {
                    background: #0f1117;
                    border-bottom: 1px solid rgba(72,187,120,0.12);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    user-select: none;
                }
                .pw-topnav-inner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 16px;
                    height: 54px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .pw-brand {
                    font-family: 'Syne', sans-serif;
                    font-size: 21px;
                    font-weight: 800;
                    color: #f0f6f0;
                    text-decoration: none;
                    letter-spacing: -0.5px;
                    flex-shrink: 0;
                }
                .pw-brand span { color: #48bb78; }
                .pw-brand:hover { color: #f0f6f0; }

                /* Desktop nav links */
                .pw-desktop-nav {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    flex: 1;
                    justify-content: center;
                }
                .pw-nav-link {
                    color: #8b9a8b;
                    font-size: 14px;
                    font-weight: 400;
                    padding: 6px 13px;
                    border-radius: 6px;
                    text-decoration: none;
                    transition: color 0.18s, background 0.18s;
                    white-space: nowrap;
                }
                .pw-nav-link:hover { color: #48bb78; background: rgba(72,187,120,0.08); }
                .pw-nav-link--active { color: #48bb78 !important; background: rgba(72,187,120,0.10); font-weight: 600; }

                /* Desktop user section */
                .pw-desktop-user {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-shrink: 0;
                }
                .pw-user-chip {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #f0f6f0;
                    font-size: 13px;
                    padding: 5px 13px;
                    border-radius: 100px;
                    background: rgba(72,187,120,0.08);
                    border: 1px solid rgba(72,187,120,0.18);
                    text-decoration: none;
                    transition: border-color 0.18s, color 0.18s;
                    white-space: nowrap;
                }
                .pw-user-chip:hover { border-color: rgba(72,187,120,0.45); color: #48bb78; }
                .pw-logout-btn {
                    background: rgba(252,129,129,0.08);
                    border: 1px solid rgba(252,129,129,0.22);
                    color: #fc8181;
                    font-size: 13px;
                    padding: 6px 16px;
                    border-radius: 100px;
                    cursor: pointer;
                    transition: background 0.15s, border-color 0.15s;
                    white-space: nowrap;
                }
                .pw-logout-btn:hover { background: rgba(252,129,129,0.18); border-color: #fc8181; }
                .pw-register-btn {
                    background: #48bb78;
                    color: #0f1117 !important;
                    font-weight: 700;
                    padding: 7px 18px;
                    border-radius: 100px;
                    font-size: 13px;
                    text-decoration: none;
                    transition: background 0.15s, transform 0.12s;
                    white-space: nowrap;
                }
                .pw-register-btn:hover { background: #68d391; transform: scale(1.03); }

                /* Hamburger button */
                .pw-hamburger {
                    background: transparent;
                    border: 1px solid rgba(72,187,120,0.3);
                    border-radius: 7px;
                    padding: 5px 10px;
                    cursor: pointer;
                    color: #48bb78;
                    font-size: 20px;
                    line-height: 1;
                    display: none;
                    transition: border-color 0.15s;
                }
                .pw-hamburger:hover { border-color: #48bb78; }

                /* ─────────────────────────────────────────
                   MOBILE DROPDOWN (top nav overflow)
                ───────────────────────────────────────── */
                .pw-mobile-drawer {
                    display: none;
                    flex-direction: column;
                    background: #131620;
                    border-top: 1px solid rgba(72,187,120,0.1);
                    overflow: hidden;
                    max-height: 0;
                    transition: max-height 0.28s ease;
                }
                .pw-mobile-drawer.open {
                    max-height: 400px;
                }
                .pw-mobile-drawer .pw-nav-link {
                    display: block;
                    padding: 12px 20px;
                    border-radius: 0;
                    font-size: 15px;
                    border-left: 3px solid transparent;
                }
                .pw-mobile-drawer .pw-nav-link:hover,
                .pw-mobile-drawer .pw-nav-link--active {
                    border-left-color: #48bb78;
                    background: rgba(72,187,120,0.06);
                }
                .pw-mobile-drawer-divider {
                    height: 1px;
                    background: rgba(72,187,120,0.09);
                    margin: 4px 16px;
                }
                .pw-mobile-drawer-user {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 20px;
                }

                /* ─────────────────────────────────────────
                   BOTTOM NAV (phones only)
                ───────────────────────────────────────── */
                .pw-bottom-nav {
                    display: none;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    z-index: 1001;
                    background: rgba(13,15,22,0.97);
                    border-top: 1px solid rgba(72,187,120,0.15);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    padding-bottom: env(safe-area-inset-bottom, 0px);
                }
                .pw-bottom-nav-row {
                    display: flex;
                    justify-content: space-around;
                    align-items: stretch;
                }
                .pw-bn-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 2px;
                    color: #607060;
                    text-decoration: none;
                    font-size: 10px;
                    font-weight: 500;
                    padding: 7px 6px 5px;
                    flex: 1;
                    position: relative;
                    transition: color 0.18s;
                    letter-spacing: 0.2px;
                }
                .pw-bn-item .pw-bn-icon {
                    font-size: 21px;
                    line-height: 1.1;
                    transition: transform 0.18s;
                }
                .pw-bn-item:hover { color: #48bb78; text-decoration: none; }
                .pw-bn-item:hover .pw-bn-icon { transform: translateY(-2px); }
                .pw-bn-item--active {
                    color: #48bb78;
                }
                .pw-bn-item--active .pw-bn-icon {
                    filter: drop-shadow(0 0 5px rgba(72,187,120,0.55));
                }
                .pw-bn-item--active::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 20%;
                    right: 20%;
                    height: 2px;
                    background: #48bb78;
                    border-radius: 0 0 3px 3px;
                }
                .pw-bn-logout {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 2px;
                    color: #fc8181;
                    background: none;
                    border: none;
                    font-size: 10px;
                    font-weight: 500;
                    padding: 7px 6px 5px;
                    flex: 1;
                    cursor: pointer;
                    letter-spacing: 0.2px;
                    transition: color 0.18s;
                }
                .pw-bn-logout .pw-bn-icon { font-size: 21px; line-height: 1.1; }
                .pw-bn-logout:hover { color: #feb2b2; }

                /* ─────────────────────────────────────────
                   RESPONSIVE BREAKPOINTS
                ───────────────────────────────────────── */
                @media (max-width: 767px) {
                    .pw-desktop-nav  { display: none; }
                    .pw-desktop-user { display: none; }
                    .pw-hamburger    { display: block; }
                    .pw-mobile-drawer { display: flex; }
                    .pw-bottom-nav  { display: block; }
                }
                @media (min-width: 768px) {
                    .pw-hamburger     { display: none !important; }
                    .pw-mobile-drawer { display: none !important; }
                    .pw-bottom-nav    { display: none !important; }
                }
            `}</style>

            {/* ── TOP NAV ── */}
            <nav className="pw-topnav">
                <div className="pw-topnav-inner">
                    <Link className="pw-brand" to="/">Austify<span>.</span></Link>

                    {/* Desktop centre links */}
                    <div className="pw-desktop-nav">
                        {user && <NavLink className={activeClass} to="/home">Home</NavLink>}
                        <NavLink className={activeClass} to="/collaborations">Collaborate</NavLink>
                        <NavLink className={activeClass} to="/chat">Chat</NavLink>
                        <NavLink className={activeClass} to="/problem">Problems</NavLink>
                        <NavLink className={activeClass} to="/find-room">Find Room</NavLink>
                        <NavLink className={activeClass} to="/resources">Resources</NavLink>
                    </div>

                    {/* Desktop right user area */}
                    <div className="pw-desktop-user">
                        {user ? (
                            <>
                                <Link className="pw-user-chip" to="/profile">👤 {user.name}</Link>
                                <button onClick={handleLogout} className="pw-logout-btn">Logout</button>
                            </>
                        ) : (
                            <>
                                <NavLink className={activeClass} to="/login">Login</NavLink>
                                <NavLink
                                    className={({ isActive }) => `pw-register-btn${isActive ? ' pw-register-btn--active' : ''}`}
                                    to="/register"
                                >Register</NavLink>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="pw-hamburger"
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label="Toggle navigation"
                    >
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile dropdown drawer */}
                <div className={`pw-mobile-drawer${menuOpen ? ' open' : ''}`}>
                    {user ? (
                        <>
                            <div className="pw-mobile-drawer-user">
                                <Link className="pw-user-chip" to="/profile" onClick={close}>👤 {user.name}</Link>
                                <button onClick={handleLogout} className="pw-logout-btn">Logout</button>
                            </div>
                            <div className="pw-mobile-drawer-divider" />
                        </>
                    ) : (
                        <>
                            <NavLink className={activeClass} to="/login" onClick={close}>Login</NavLink>
                            <NavLink className={activeClass} to="/register" onClick={close}>Register</NavLink>
                            <div className="pw-mobile-drawer-divider" />
                        </>
                    )}
                    {user && <NavLink className={activeClass} to="/home" onClick={close}>🏠 Home</NavLink>}
                    <NavLink className={activeClass} to="/collaborations" onClick={close}>👥 Collaborate</NavLink>
                    <NavLink className={activeClass} to="/chat" onClick={close}>💬 Chat</NavLink>
                    <NavLink className={activeClass} to="/problem" onClick={close}>🧩 Problems</NavLink>
                    <NavLink className={activeClass} to="/find-room" onClick={close}>🏠 Find Room</NavLink>
                    <NavLink className={activeClass} to="/resources" onClick={close}>📂 Resources</NavLink>
                    {user && <NavLink className={activeClass} to="/profile" onClick={close}>👤 Profile</NavLink>}
                </div>
            </nav>

            {/* ── BOTTOM NAVIGATION (mobile phones only) ── */}
            <nav className="pw-bottom-nav" aria-label="Mobile bottom navigation">
                <div className="pw-bottom-nav-row">
                    {user ? (
                        <>
                            <NavLink className={bnClass} to="/home">
                                <span className="pw-bn-icon">🏠</span>
                                <span>Home</span>
                            </NavLink>
                            <NavLink className={bnClass} to="/collaborations">
                                <span className="pw-bn-icon">👥</span>
                                <span>Teams</span>
                            </NavLink>
                            <NavLink className={bnClass} to="/chat">
                                <span className="pw-bn-icon">💬</span>
                                <span>Chat</span>
                            </NavLink>
                            <NavLink className={bnClass} to="/problem">
                                <span className="pw-bn-icon">🧩</span>
                                <span>Problems</span>
                            </NavLink>
                            <NavLink className={bnClass} to="/find-room">
                                <span className="pw-bn-icon">🏠</span>
                                <span>Rooms</span>
                            </NavLink>
                            <NavLink className={bnClass} to="/profile">
                                <span className="pw-bn-icon">👤</span>
                                <span>Profile</span>
                            </NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink className={bnClass} to="/">
                                <span className="pw-bn-icon">🏠</span>
                                <span>Home</span>
                            </NavLink>
                            <NavLink className={bnClass} to="/login">
                                <span className="pw-bn-icon">🔑</span>
                                <span>Login</span>
                            </NavLink>
                            <NavLink className={bnClass} to="/register">
                                <span className="pw-bn-icon">✍️</span>
                                <span>Register</span>
                            </NavLink>
                        </>
                    )}
                </div>
            </nav>
        </>
    );
}

export default Navbar;