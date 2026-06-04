import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

function Profile() {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState('');
    const [github, setGithub] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ msg: '', show: false, error: false });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileRef = useRef();

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            const res = await api.get('/accounts/my-profile');
            const u = res.data.data;
            setUser(u);
            setName(u.name || '');
            setGithub(u.github_link || '');
        } catch { showToast('Could not load profile.', true); }
    };

    const showToast = (msg, error = false) => {
        setToast({ msg, show: true, error });
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
    };

    const saveProfile = async () => {
        if (!name.trim()) return showToast('Name cannot be empty.', true);
        setSaving(true);
        try {
            const res = await api.post('/accounts/update-profile', { name, github_link: github || null });
            setUser(res.data.data);
            setEditMode(false);
            showToast('✅ Profile updated!');
        } catch { showToast('Update failed.', true); }
        finally { setSaving(false); }
    };

    const previewAvatar = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const r = new FileReader();
        r.onload = ev => setAvatarPreview(ev.target.result);
        r.readAsDataURL(file);
        showToast('📸 Photo preview updated');
    };

    if (!user) return <div className="text-center mt-5 text-white">Loading...</div>;

    const role = user.role || 'member';
    const points = user.points ?? user.bonus_points ?? 0;
    const timeoutUntilDate = user.timeout_until ? new Date(user.timeout_until) : null;
    const isReadOnly = role !== 'admin' && timeoutUntilDate && timeoutUntilDate.getTime() > Date.now();

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
            <style>{`
                :root {
                    --bg:#0d1f14; --forest:#1a4731; --leaf:#4ade80; --leaf2:#22c55e;
                    --glow:#4ade8033; --card:#f5f2eb; --ink:#0f1a12; --muted:#7a8c80;
                    --sand:#ede8df; --border:#e0dbd0; --danger:#ef4444;
                }
                body { background: var(--bg); font-family: 'Instrument Sans', sans-serif; }
                .page-wrap {
                    min-height: 100vh;
                    background: radial-gradient(ellipse 70% 50% at 50% 0%, #1a473188, transparent),
                                radial-gradient(ellipse 40% 40% at 90% 80%, #4ade801a, transparent), var(--bg);
                    display: flex; align-items: flex-start; justify-content: center; padding: 64px 16px 80px;
                }
                .pcard {
                    width: 100%; max-width: 560px; background: var(--card); border-radius: 28px;
                    overflow: hidden;
                    box-shadow: 0 0 0 1px rgba(74,222,128,.12), 0 32px 80px rgba(0,0,0,.45), 0 8px 20px rgba(0,0,0,.3);
                    animation: cardIn .5s cubic-bezier(.22,.68,0,1.2) both;
                }
                @keyframes cardIn { from{opacity:0;transform:translateY(32px) scale(.97)} to{opacity:1;transform:none} }
                .banner {
                    height: 130px;
                    background: linear-gradient(135deg, #0a2e1b 0%, #1a4731 45%, #2d6a4f 75%, #4ade8030 100%);
                    position: relative; overflow: hidden;
                }
                .banner::after {
                    content:''; position:absolute; inset:0;
                    background: repeating-linear-gradient(-55deg, transparent 0px, transparent 18px, rgba(255,255,255,.025) 18px, rgba(255,255,255,.025) 19px);
                }
                .b-orb { position:absolute; border-radius:50%; filter:blur(28px); pointer-events:none; }
                .b-orb-1 { width:120px; height:120px; background:#4ade8030; top:-30px; right:60px; }
                .b-orb-2 { width:80px; height:80px; background:#22c55e20; bottom:-20px; right:20px; }
                .identity { padding: 0 32px 28px; display:flex; align-items:flex-end; gap:20px; }
                .av-wrap { position:relative; flex-shrink:0; margin-top:-44px; }
                .av-ring {
                    width:88px; height:88px; border-radius:50%; border:4px solid var(--card);
                    background:var(--forest); display:flex; align-items:center; justify-content:center;
                    font-family:'Bricolage Grotesque',sans-serif; font-size:2rem; font-weight:800; color:var(--leaf);
                    overflow:hidden; box-shadow: 0 0 0 2px var(--leaf2), 0 8px 24px rgba(0,0,0,.25); transition:box-shadow .3s;
                }
                .av-ring:hover { box-shadow: 0 0 0 3px var(--leaf), 0 0 20px var(--glow), 0 8px 24px rgba(0,0,0,.25); }
                .av-cam {
                    position:absolute; bottom:2px; right:0; width:26px; height:26px;
                    background:var(--forest); border:2.5px solid var(--card); border-radius:50%;
                    cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:11px;
                    box-shadow: 0 2px 8px rgba(0,0,0,.2); transition: background .2s, transform .15s;
                }
                .av-cam:hover { background:var(--leaf2); transform:scale(1.1); }
                .id-meta { padding-bottom:4px; flex:1; }
                .id-name { font-family:'Bricolage Grotesque',sans-serif; font-size:1.55rem; font-weight:800; color:var(--ink); line-height:1.1; margin-bottom:8px; }
                .role-pill { display:inline-flex; align-items:center; gap:5px; padding:3px 11px 3px 8px; border-radius:999px; font-size:0.68rem; font-weight:600; letter-spacing:1px; text-transform:uppercase; }
                .pill-admin  { background:#fef3c7; color:#92400e; border:1px solid #fde68a; }
                .pill-member { background:#dcfce7; color:#166534; border:1px solid #bbf7d0; }
                .divider { height:1px; background:var(--border); margin:0 32px; }
                .points-band {
                    margin:24px 32px; background:var(--forest); border-radius:18px; padding:20px 28px;
                    display:flex; align-items:center; gap:16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,.1), inset 0 1px 0 rgba(255,255,255,.06);
                    position:relative; overflow:hidden;
                }
                .points-band::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 80% 80% at 110% 50%, #4ade8018, transparent); }
                .points-num { font-family:'Bricolage Grotesque',sans-serif; font-size:2.4rem; font-weight:800; color:var(--leaf); line-height:1; }
                .points-lbl { font-size:0.7rem; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:rgba(255,255,255,.4); margin-top:3px; }
                .points-right { margin-left:auto; opacity:.2; font-size:3.5rem; line-height:1; }
                .admin-cta-wrap { margin: 0 32px 20px; }
                .admin-cta {
                    width: 100%;
                    border: none;
                    border-radius: 14px;
                    padding: 14px 18px;
                    font-family: 'Bricolage Grotesque', sans-serif;
                    font-weight: 700;
                    font-size: 0.95rem;
                    color: #fff;
                    background: linear-gradient(135deg, #92400e, #b45309);
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 28px rgba(146,64,14,.25);
                }
                .readonly-note {
                    margin: 0 32px 20px;
                    border-radius: 14px;
                    padding: 12px 14px;
                    background: #fff7ed;
                    color: #9a3412;
                    border: 1px solid #fed7aa;
                    font-size: 0.84rem;
                    font-weight: 600;
                    line-height: 1.4;
                }
                .info-section { padding:0 32px 28px; }
                .section-title { font-size:0.65rem; font-weight:600; letter-spacing:2.5px; text-transform:uppercase; color:var(--muted); margin-bottom:12px; }
                .field {
                    display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:14px; margin-bottom:8px;
                    background:var(--sand); border:1px solid transparent; transition: border-color .2s, background .2s, box-shadow .2s;
                }
                .field.editable-active { background:#fff; border-color:var(--leaf2); box-shadow:0 0 0 3px #4ade8018; }
                .field-icon { width:36px; height:36px; background:rgba(26,71,49,.1); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
                .field-body { flex:1; min-width:0; }
                .field-label { font-size:0.6rem; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--muted); }
                .field-val { font-size:0.92rem; font-weight:500; color:var(--ink); margin-top:1px; }
                .field-val a { color:var(--forest); text-decoration:none; }
                .field-input { border:none; outline:none; background:transparent; font-size:0.92rem; font-weight:500; color:var(--ink); width:100%; font-family:'Instrument Sans',sans-serif; margin-top:2px; }
                .lock-icon { font-size:0.75rem; color:var(--muted); opacity:.4; margin-left:4px; flex-shrink:0; }
                .actions { padding:0 32px 32px; display:flex; gap:10px; }
                .btn-p { flex:1; background:var(--forest); color:#fff; border:none; border-radius:12px; padding:13px 24px; font-family:'Bricolage Grotesque',sans-serif; font-weight:700; font-size:0.82rem; letter-spacing:.5px; cursor:pointer; transition: background .2s, transform .15s; display:inline-flex; align-items:center; justify-content:center; gap:7px; }
                .btn-p:hover { background:#2d6a4f; transform:translateY(-1px); }
                .btn-s { flex:1; background:var(--leaf2); color:var(--forest); border:none; border-radius:12px; padding:13px 24px; font-family:'Bricolage Grotesque',sans-serif; font-weight:700; font-size:0.82rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:7px; }
                .btn-g { background:transparent; color:var(--muted); border:1.5px solid var(--border); border-radius:12px; padding:13px 20px; font-family:'Instrument Sans',sans-serif; font-weight:500; font-size:0.82rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; }
                .btn-g:hover { border-color:var(--danger); color:var(--danger); }
                #toast {
                    position:fixed; bottom:28px; left:50%; transform:translateX(-50%) translateY(12px);
                    z-index:9999; background:var(--forest); color:#fff; padding:11px 22px; border-radius:999px;
                    font-size:0.84rem; font-weight:500; box-shadow:0 8px 32px rgba(0,0,0,.3);
                    opacity:0; pointer-events:none; transition: opacity .3s, transform .3s; white-space:nowrap;
                }
                #toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
                #toast.error { background:var(--danger); }
                
                @media (max-width: 575px) {
                    .page-wrap {
                        padding: 24px 12px 80px;
                    }
                    .pcard {
                        border-radius: 20px;
                    }
                    .identity {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        padding: 0 16px 20px;
                        gap: 12px;
                    }
                    .av-wrap {
                        margin-top: -44px;
                        margin-bottom: 4px;
                    }
                    .id-meta {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .points-band {
                        margin: 16px 16px 20px;
                        padding: 16px 20px;
                    }
                    .admin-cta-wrap,
                    .readonly-note,
                    .info-section {
                        margin-left: 16px;
                        margin-right: 16px;
                        padding-left: 0;
                        padding-right: 0;
                    }
                    .info-section {
                        padding-bottom: 16px;
                    }
                    .divider {
                        margin: 0 16px;
                    }
                    .actions {
                        padding: 0 16px 24px;
                        flex-direction: column;
                        gap: 8px;
                    }
                    .btn-p, .btn-s, .btn-g {
                        width: 100%;
                        flex: none;
                    }
                }
            `}</style>

            <div className="page-wrap">
                <div className="pcard">
                    <div className="banner">
                        <div className="b-orb b-orb-1"></div>
                        <div className="b-orb b-orb-2"></div>
                    </div>

                    <div className="identity">
                        <div className="av-wrap">
                            <div className="av-ring">
                                {avatarPreview
                                    ? <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <span>{user.name?.charAt(0).toUpperCase()}</span>
                                }
                            </div>
                            <button className="av-cam" title="Change photo" onClick={() => fileRef.current.click()}>📷</button>
                            <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={previewAvatar} />
                        </div>
                        <div className="id-meta">
                            <div className="id-name">{user.name}</div>
                            <span className={`role-pill ${role === 'admin' ? 'pill-admin' : 'pill-member'}`}>
                                {role === 'admin' ? '👑 Admin' : '👤 Member'}
                            </span>
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="points-band">
                        <div style={{ fontSize: '2rem' }}>⭐</div>
                        <div>
                            <div className="points-num">{points}</div>
                            <div className="points-lbl">Points</div>
                        </div>
                        <div className="points-right">✦</div>
                    </div>

                    {role === 'admin' && (
                        <div className="admin-cta-wrap">
                            <Link to="/admin/dashboard" className="admin-cta">🛠️ Admin Dashboard</Link>
                        </div>
                    )}

                    {isReadOnly && (
                        <div className="readonly-note">
                            You are in read-only mode until {timeoutUntilDate.toLocaleString()} due to a community violation.
                        </div>
                    )}

                    <div className="info-section">
                        <div className="section-title">Profile Details</div>

                        <div className={`field ${editMode ? 'editable-active' : ''}`}>
                            <div className="field-icon">👤</div>
                            <div className="field-body">
                                <div className="field-label">Full Name</div>
                                {editMode
                                    ? <input className="field-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoFocus />
                                    : <div className="field-val">{user.name}</div>
                                }
                            </div>
                        </div>

                        <div className="field">
                            <div className="field-icon">📧</div>
                            <div className="field-body">
                                <div className="field-label">Email Address</div>
                                <div className="field-val">{user.email}</div>
                            </div>
                            <span className="lock-icon">🔒</span>
                        </div>

                        <div className={`field ${editMode ? 'editable-active' : ''}`}>
                            <div className="field-icon">🐙</div>
                            <div className="field-body">
                                <div className="field-label">GitHub Profile</div>
                                {editMode
                                    ? <input className="field-input" type="url" value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/username" />
                                    : <div className="field-val">
                                        {user.github_link
                                            ? <a href={user.github_link} target="_blank" rel="noreferrer">{user.github_link}</a>
                                            : 'Not provided'}
                                    </div>
                                }
                            </div>
                        </div>

                        <div className="field">
                            <div className="field-icon">🛡️</div>
                            <div className="field-body">
                                <div className="field-label">Role</div>
                                <div className="field-val">{role.charAt(0).toUpperCase() + role.slice(1)}</div>
                            </div>
                            <span className="lock-icon">🔒</span>
                        </div>
                    </div>

                    <div className="actions">
                        {!editMode ? (
                            <button className="btn-p" onClick={() => setEditMode(true)}>✏️ Edit Profile</button>
                        ) : (
                            <>
                                <button className="btn-s" onClick={saveProfile} disabled={saving}>
                                    {saving ? '⏳ Saving…' : '💾 Save Changes'}
                                </button>
                                <button className="btn-g" onClick={() => setEditMode(false)}>Cancel</button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div id="toast" className={`${toast.show ? 'show' : ''} ${toast.error ? 'error' : ''}`}>
                {toast.msg}
            </div>
        </>
    );
}

export default Profile;
