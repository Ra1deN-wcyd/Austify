import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

/* ─────────────────────────────────────────────── styles ── */
const CSS = `
  .ft-page {
    background: #f0f2f5;
    min-height: 100vh;
    color: #333;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  /* ── Hero ── */
  .ft-hero {
    background: #fff;
    padding: 72px 0 56px;
    border-bottom: 1px solid #e0e0e0;
    position: relative;
    overflow: hidden;
  }
  .ft-hero-badge {
    display: inline-block;
    background: #e6f4ea;
    border: 1px solid #a8d5ba;
    color: #2e854b;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 100px;
    margin-bottom: 18px;
  }
  .ft-hero-title {
    font-size: 2.6rem;
    font-weight: 800;
    color: #111;
    letter-spacing: -0.03em;
    margin-bottom: 14px;
    line-height: 1.15;
  }
  .ft-hero-title span { color: #48bb78; }
  .ft-hero-sub {
    color: #555;
    font-size: 1rem;
    max-width: 520px;
    margin: 0 auto 32px;
    line-height: 1.65;
  }
  .ft-post-btn {
    background: #48bb78;
    color: #fff;
    font-weight: 700;
    font-size: 0.9rem;
    padding: 11px 28px;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    box-shadow: 0 4px 15px rgba(72,187,120,0.3);
  }
  .ft-post-btn:hover {
    background: #38a169;
    transform: scale(1.04);
  }

  /* ── Toolbar ── */
  .ft-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 32px;
  }
  .ft-count-label {
    color: #555;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .ft-count-label strong {
    color: #2e854b;
    font-weight: 700;
  }

  .ft-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(340px, 100%), 1fr));
    gap: 22px;
  }

  /* ── Card ── */
  .ft-card {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 18px;
    padding: 26px 24px 22px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: transform 0.25s, box-shadow 0.25s;
    cursor: default;
    position: relative;
    overflow: hidden;
  }
  .ft-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #48bb78, #38a169);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .ft-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.08);
  }
  .ft-card:hover::before { opacity: 1; }

  /* Full card */
  .ft-card.ft-full {
    border-color: #fbd38d;
    background: #fffaf0;
  }
  .ft-card.ft-full::before {
    background: linear-gradient(90deg, #fc8181, #e53e3e);
    opacity: 1;
  }

  .ft-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }
  .ft-card-title {
    font-size: 1.08rem;
    font-weight: 700;
    color: #222;
    line-height: 1.35;
    margin: 0;
  }
  .ft-card-title-link {
    color: #222;
    text-decoration: none;
    cursor: pointer;
  }
  .ft-card-title-link:hover { color: #48bb78; text-decoration: underline; }

  .ft-badge {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 100px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .ft-badge-full {
    background: #fed7d7;
    color: #c53030;
  }
  .ft-badge-open {
    background: #e6f4ea;
    color: #2e854b;
  }
  .ft-badge-owner {
    background: #ebf8ff;
    color: #2b6cb0;
  }

  .ft-card-desc {
    font-size: 0.875rem;
    color: #555;
    line-height: 1.65;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Skills tags */
  .ft-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .ft-tag {
    background: #f0f2f5;
    border: 1px solid #e0e0e0;
    color: #555;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 100px;
  }

  /* Meta row */
  .ft-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
    padding-top: 14px;
    border-top: 1px solid #e0e0e0;
  }
  .ft-creator {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ft-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #48bb78;
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .ft-creator-name {
    font-size: 0.8rem;
    color: #555;
    font-weight: 500;
  }
  .ft-member-count {
    font-size: 0.78rem;
    color: #555;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .ft-member-count strong { color: #2e854b; }

  /* Action button */
  .ft-action-btn {
    width: 100%;
    padding: 10px;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }
  .ft-action-btn.ft-join {
    background: #e6f4ea;
    border: 1px solid #a8d5ba;
    color: #2e854b;
  }
  .ft-action-btn.ft-join:hover {
    background: #48bb78;
    color: #fff;
    border-color: #48bb78;
  }
  .ft-action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .ft-action-btn.ft-sent {
    background: #ebf8ff;
    border: 1px solid #bee3f8;
    color: #2b6cb0;
  }
  .ft-action-btn.ft-manage {
    background: #ebf8ff;
    border: 1px solid #bee3f8;
    color: #2b6cb0;
  }
  .ft-action-btn.ft-manage:hover {
    background: #bee3f8;
  }

  /* Empty state */
  .ft-empty {
    text-align: center;
    padding: 80px 20px;
    color: #555;
  }
  .ft-empty-icon { font-size: 3.5rem; margin-bottom: 16px; }
  .ft-empty-title { font-size: 1.3rem; font-weight: 700; color: #222; margin-bottom: 8px; }
  .ft-empty-sub { font-size: 0.9rem; color: #555; }

  /* Spinner */
  .ft-spinner-wrap {
    text-align: center;
    padding: 80px 0;
  }

  /* Toast */
  .ft-toast {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 9999;
    padding: 14px 22px;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    animation: ftSlideIn 0.3s ease;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ft-toast.success {
    background: #e6f4ea;
    border: 1px solid #a8d5ba;
    color: #2e854b;
  }
  .ft-toast.error {
    background: #fed7d7;
    border: 1px solid #feb2b2;
    color: #c53030;
  }
  @keyframes ftSlideIn { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }

  /* ── Modal ── */
  .ft-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .ft-modal {
    background: #fff;
    border-radius: 22px;
    width: 100%;
    max-width: 520px;
    padding: 36px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.2);
    animation: ftPop 0.3s cubic-bezier(0.34,1.56,0.64,1);
    max-height: 90vh;
    overflow-y: auto;
  }
  @keyframes ftPop { from { opacity:0; transform: scale(0.88); } to { opacity:1; transform: scale(1); } }
  .ft-modal-title {
    font-size: 1.2rem;
    font-weight: 800;
    color: #222;
    margin: 0 0 24px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .ft-modal label {
    display: block;
    font-size: 0.72rem;
    font-weight: 700;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 7px;
  }
  .ft-modal input,
  .ft-modal textarea,
  .ft-modal select {
    width: 100%;
    background: #fff;
    border: 1px solid #ccc;
    color: #333;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
  }
  .ft-modal input:focus,
  .ft-modal textarea:focus {
    border-color: #48bb78;
    box-shadow: 0 0 0 2px rgba(72,187,120,0.1);
  }
  .ft-modal textarea { resize: vertical; min-height: 90px; }

  /* Skills tag input */
  .ft-tag-input-wrap {
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 10px;
    padding: 8px 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    min-height: 46px;
    cursor: text;
    transition: border-color 0.2s;
  }
  .ft-tag-input-wrap:focus-within {
    border-color: #48bb78;
    box-shadow: 0 0 0 2px rgba(72,187,120,0.1);
  }
  .ft-tag-pill {
    background: #e6f4ea;
    border: 1px solid #a8d5ba;
    color: #2e854b;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 100px;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .ft-tag-remove {
    background: none;
    border: none;
    color: #2e854b;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    font-size: 14px;
    opacity: 0.7;
  }
  .ft-tag-remove:hover { opacity: 1; }
  .ft-tag-input {
    background: transparent !important;
    border: none !important;
    color: #333 !important;
    padding: 2px 4px !important;
    font-size: 0.875rem;
    outline: none !important;
    box-shadow: none !important;
    min-width: 120px;
    flex: 1;
  }

  .ft-modal-submit {
    background: #48bb78;
    color: #fff;
    font-weight: 700;
    font-size: 0.9rem;
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    margin-top: 8px;
    transition: background 0.2s, transform 0.2s;
  }
  .ft-modal-submit:hover:not(:disabled) { background: #38a169; transform: scale(1.01); }
  .ft-modal-submit:disabled { opacity: 0.55; cursor: not-allowed; }

  .ft-modal-cancel {
    background: transparent;
    color: #555;
    font-size: 0.85rem;
    width: 100%;
    padding: 10px;
    border-radius: 12px;
    border: 1px solid #ccc;
    cursor: pointer;
    margin-top: 8px;
    transition: all 0.2s;
  }
  .ft-modal-cancel:hover { background: #f0f2f5; color: #222; }

  .ft-form-error {
    background: #fed7d7;
    border: 1px solid #feb2b2;
    color: #c53030;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 0.82rem;
    margin-bottom: 16px;
  }

  .ft-divider { height: 1px; background: #e0e0e0; margin: 20px 0; }
`;

/* ─────────────────────────────────────── CreateCollabModal ── */
function CreateCollabModal({ onClose, onCreated }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        members_needed: 2,
    });
    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    }

    function addSkill(raw) {
        const trimmed = raw.trim().replace(/,$/, '');
        if (trimmed && !skills.includes(trimmed)) {
            setSkills(prev => [...prev, trimmed]);
        }
        setSkillInput('');
    }

    function handleSkillKey(e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addSkill(skillInput);
        } else if (e.key === 'Backspace' && !skillInput && skills.length > 0) {
            setSkills(prev => prev.slice(0, -1));
        }
    }

    function removeSkill(s) {
        setSkills(prev => prev.filter(x => x !== s));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!form.title.trim()) { setError('Title is required.'); return; }
        if (!form.description.trim()) { setError('Description is required.'); return; }
        if (Number(form.members_needed) < 1) { setError('Members needed must be at least 1.'); return; }

        // Add any pending skill input
        const finalSkills = skillInput.trim()
            ? [...skills, skillInput.trim()]
            : skills;

        setSubmitting(true);
        try {
            const res = await api.post('/collaborations', {
                title: form.title.trim(),
                description: form.description.trim(),
                tech_stack: finalSkills.join(', '),
                team_size: Number(form.members_needed),
                type: 'Project',
                contact: 'Message via platform'
            });
            const created = res.data?.data ?? res.data;
            onCreated(created);
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message
                ?? err.response?.data?.error
                ?? 'Failed to create collaboration. Please try again.';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="ft-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="ft-modal">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 className="ft-modal-title">
                        🤝 Post a Collaboration
                    </h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#8b9a8b', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
                    >✕</button>
                </div>

                {error && <div className="ft-form-error">⚠ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 18 }}>
                        <label>Project Title</label>
                        <input
                            name="title"
                            placeholder="e.g. AI-powered Study Planner"
                            value={form.title}
                            onChange={handleChange}
                            autoFocus
                        />
                    </div>

                    <div style={{ marginBottom: 18 }}>
                        <label>Description</label>
                        <textarea
                            name="description"
                            placeholder="What is the project about? What will team members build?"
                            value={form.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ marginBottom: 18 }}>
                        <label>Required Skills / Tech Stack</label>
                        <div className="ft-tag-input-wrap">
                            {skills.map(s => (
                                <span key={s} className="ft-tag-pill">
                                    {s}
                                    <button type="button" className="ft-tag-remove" onClick={() => removeSkill(s)}>×</button>
                                </span>
                            ))}
                            <input
                                className="ft-tag-input"
                                placeholder={skills.length === 0 ? 'Type a skill and press Enter or comma…' : ''}
                                value={skillInput}
                                onChange={e => setSkillInput(e.target.value)}
                                onKeyDown={handleSkillKey}
                                onBlur={() => skillInput.trim() && addSkill(skillInput)}
                            />
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#4a5568', marginTop: 6 }}>Press Enter or comma to add each skill</div>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                        <label>Members Needed</label>
                        <input
                            type="number"
                            name="members_needed"
                            min="1"
                            max="20"
                            value={form.members_needed}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="ft-divider" />
                    <button className="ft-modal-submit" type="submit" disabled={submitting}>
                        {submitting ? 'Posting…' : '🚀 Post Collaboration'}
                    </button>
                    <button type="button" className="ft-modal-cancel" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────── CollabCard ── */
function CollabCard({ collab, currentUserId, onJoin, joiningId, onNavigate }) {
    const isOwner = Number(collab.user_id) === Number(currentUserId);
    const isFull = Number(collab.current_members ?? 0) >= Number(collab.team_size ?? 0);
    const hasSent = collab._userRequested === true;
    const reqStatus = collab.user_request_status || (hasSent ? 'pending' : null);

    const skills = collab.tech_stack
        ? collab.tech_stack.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const creatorName = collab.user?.name ?? collab.creator_name ?? 'Anonymous';
    const creatorInitial = creatorName[0]?.toUpperCase() ?? '?';

    return (
        <div className={`ft-card${isFull ? ' ft-full' : ''}`}>
            {/* Header */}
            <div className="ft-card-header">
                <p
                    className="ft-card-title"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onNavigate(collab.id)}
                >
                    <span className="ft-card-title-link">{collab.title}</span>
                </p>
                {isOwner ? (
                    <span className="ft-badge ft-badge-owner">Your Post</span>
                ) : isFull ? (
                    <span className="ft-badge ft-badge-full">Full</span>
                ) : (
                    <span className="ft-badge ft-badge-open">Open</span>
                )}
            </div>

            {/* Description */}
            <p className="ft-card-desc">{collab.description}</p>

            {/* Skills */}
            {skills.length > 0 && (
                <div className="ft-tags">
                    {skills.map(s => <span key={s} className="ft-tag">{s}</span>)}
                </div>
            )}

            {/* Meta */}
            <div className="ft-meta">
                <div className="ft-creator">
                    <div className="ft-avatar">{creatorInitial}</div>
                    <span className="ft-creator-name">{creatorName}</span>
                </div>
                <div className="ft-member-count">
                    👥 <strong>{collab.current_members ?? 0}</strong> / {collab.team_size} members
                </div>
            </div>

            {/* Action */}
            {isOwner ? (
                <button
                    className="ft-action-btn ft-manage"
                    onClick={() => onNavigate(collab.id)}
                >
                    ⚙ Manage &amp; View Requests
                </button>
            ) : reqStatus === 'accepted' ? (
                <button className="ft-action-btn ft-sent" style={{background: '#e6f4ea', color: '#2e854b', borderColor: '#a8d5ba'}} disabled>✓ Joined Team</button>
            ) : reqStatus === 'rejected' ? (
                <button className="ft-action-btn ft-sent" style={{background: '#fed7d7', color: '#c53030', borderColor: '#feb2b2'}} disabled>✕ Declined</button>
            ) : reqStatus === 'pending' || hasSent ? (
                <button className="ft-action-btn ft-sent" disabled>✓ Request Sent</button>
            ) : (
                <button
                    className="ft-action-btn ft-join"
                    disabled={isFull || joiningId === collab.id}
                    onClick={() => !isFull && onJoin(collab.id)}
                >
                    {joiningId === collab.id ? 'Sending…' : isFull ? '🚫 Full' : '✋ Send Join Request'}
                </button>
            )}
        </div>
    );
}

/* ──────────────────────────────────────── FindTeammates ── */
export default function FindTeammates() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [collabs, setCollabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

    // Track which collab IDs the user has already requested
    const [requestedIds, setRequestedIds] = useState(new Set());
    const [joiningId, setJoiningId] = useState(null);

    // Toast
    const [toast, setToast] = useState(null);

    const currentUserId = user?.id ?? Number(localStorage.getItem('user_id') ?? 0);

    /* ── Fetch collaborations ── */
    const fetchCollabs = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/collaborations?page=${page}`);
            const data = res.data?.data ?? [];
            setCollabs(data);
            setPagination({
                current_page: res.data?.current_page ?? 1,
                last_page: res.data?.last_page ?? 1,
                total: res.data?.total ?? 0
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError('Failed to load collaborations. Please refresh.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollabs(1);
    }, []);

    /* ── Show toast helper ── */
    function showToast(msg, type = 'success') {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    }

    /* ── Send join request ── */
    async function handleJoin(collabId) {
        if (requestedIds.has(collabId) || joiningId) return;
        setJoiningId(collabId);
        try {
            await api.post(`/collaborations/${collabId}/requests`);
            setRequestedIds(prev => new Set([...prev, collabId]));
            // Mark the collab as _userRequested in state
            setCollabs(prev =>
                prev.map(c => c.id === collabId ? { ...c, _userRequested: true } : c)
            );
            showToast('Join request sent successfully! ✓');
        } catch (err) {
            const msg = err.response?.data?.message ?? 'Could not send request. You may have already applied.';
            showToast(msg, 'error');
        } finally {
            setJoiningId(null);
        }
    }

    /* ── After create ── */
    function handleCreated(newCollab) {
        setCollabs(prev => [newCollab, ...prev]);
        showToast('Collaboration posted! 🎉');
    }

    /* ── Navigate to detail ── */
    function goToDetail(id) {
        navigate(`/collaborations/${id}`);
    }

    /* ─── Render with enriched _userRequested flag ─── */
    const enrichedCollabs = collabs.map(c => ({
        ...c,
        _userRequested: requestedIds.has(c.id) || c._userRequested || c.has_requested,
        user_request_status: c.user_request_status || (requestedIds.has(c.id) ? 'pending' : null),
    }));

    return (
        <div className="ft-page">
            <style>{CSS}</style>

            {/* ── Hero ── */}
            <section className="ft-hero">
                <div className="container text-center">
                    <div className="ft-hero-badge">👥 Find Teammates</div>
                    <h1 className="ft-hero-title">
                        Build Together,<br />
                        <span>Grow Together</span>
                    </h1>
                    <p className="ft-hero-sub">
                        Find students to collaborate with on projects, hackathons, and research.
                        Post your idea and assemble your dream team.
                    </p>
                    <button className="ft-post-btn" onClick={() => setShowModal(true)}>
                        + Post a Collaboration
                    </button>
                </div>
            </section>

            {/* ── Feed ── */}
            <main className="container py-5">
                <div className="ft-toolbar">
                    <span className="ft-count-label">
                        <strong>{enrichedCollabs.length}</strong> open collaborations
                    </span>
                    <div style={{display: 'flex', gap: 10}}>
                        <Link to="/collaborations/manage" className="ft-post-btn" style={{background: '#f8f9fa', color: '#555', border: '1px solid #ccc', boxShadow: 'none', textDecoration: 'none', fontSize: '0.82rem', padding: '8px 20px'}}>
                            Manage My Posts
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="ft-spinner-wrap">
                        <div className="spinner-border text-success" style={{ width: '3rem', height: '3rem' }} role="status">
                            <span className="visually-hidden">Loading…</span>
                        </div>
                        <p className="mt-4" style={{ color: '#8b9a8b' }}>Loading collaborations…</p>
                    </div>
                ) : error ? (
                    <div style={{
                        background: 'rgba(252,129,129,0.08)',
                        border: '1px solid rgba(252,129,129,0.2)',
                        borderRadius: 16, padding: 32, textAlign: 'center', color: '#fc8181'
                    }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠</div>
                        <p style={{ fontWeight: 600 }}>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{ background: 'rgba(252,129,129,0.15)', border: '1px solid rgba(252,129,129,0.3)', color: '#fc8181', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                        >
                            Try Again
                        </button>
                    </div>
                ) : enrichedCollabs.length === 0 ? (
                    <div className="ft-empty">
                        <div className="ft-empty-icon">🤝</div>
                        <div className="ft-empty-title">No collaborations yet</div>
                        <p className="ft-empty-sub">Be the first to post a project and find teammates!</p>
                        <button className="ft-post-btn" style={{ marginTop: 20 }} onClick={() => setShowModal(true)}>
                            + Post a Collaboration
                        </button>
                    </div>
                ) : (
                    <div className="ft-grid">
                        {enrichedCollabs.map(c => (
                            <CollabCard
                                key={c.id}
                                collab={c}
                                currentUserId={currentUserId}
                                onJoin={handleJoin}
                                joiningId={joiningId}
                                onNavigate={goToDetail}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {!loading && !error && pagination.last_page > 1 && (
                    <nav className="d-flex justify-content-center mt-5">
                        <ul className="pagination gap-2 border-0">
                            <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                                <button 
                                    className="btn btn-light bg-white border shadow-sm rounded-pill px-4 fw-bold text-success" 
                                    onClick={() => fetchCollabs(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    style={{ transition: 'all 0.2s' }}
                                >
                                    &laquo; Earlier
                                </button>
                            </li>
                            
                            {[...Array(pagination.last_page)].map((_, i) => (
                                <li key={i+1} className={`page-item ${pagination.current_page === i + 1 ? 'active' : ''}`}>
                                    <button 
                                        className={`btn border shadow-sm rounded-circle fw-bold mx-1 ${pagination.current_page === i + 1 ? 'btn-success text-white' : 'btn-light bg-white text-success'}`} 
                                        style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                        onClick={() => fetchCollabs(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                </li>
                            ))}

                            <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                                <button 
                                    className="btn btn-light bg-white border shadow-sm rounded-pill px-4 fw-bold text-success" 
                                    onClick={() => fetchCollabs(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    style={{ transition: 'all 0.2s' }}
                                >
                                    Next &raquo;
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}
            </main>

            {/* ── Create Modal ── */}
            {showModal && (
                <CreateCollabModal
                    onClose={() => setShowModal(false)}
                    onCreated={handleCreated}
                />
            )}

            {/* ── Toast ── */}
            {toast && (
                <div className={`ft-toast ${toast.type}`}>
                    {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
                </div>
            )}
        </div>
    );
}
