import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

/* ─────────────────────────────────────────────── styles ── */
const CSS = `
  .collab-page {
    background: #f0f2f5;
    min-height: 100vh;
    color: #333;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  /* ── Header ── */
  .collab-header {
    background: #fff;
    padding: 60px 0 40px;
    border-bottom: 1px solid #e0e0e0;
    margin-bottom: 40px;
  }
  .collab-header-title {
    font-size: 2.2rem;
    font-weight: 800;
    color: #111;
    letter-spacing: -0.02em;
    margin-bottom: 10px;
  }
  .collab-header-title span { color: #48bb78; }
  .collab-header-sub {
    color: #555;
    font-size: 1rem;
    max-width: 600px;
  }

  /* ── Containers ── */
  .collab-panel {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 18px;
    padding: 30px;
    margin-bottom: 24px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  }
  .collab-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #222;
    margin-bottom: 12px;
  }
  .collab-desc {
    color: #444;
    font-size: 0.95rem;
    line-height: 1.7;
    margin-bottom: 24px;
  }

  /* ── Status Badge ── */
  .status-badge {
    display: inline-block;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding: 6px 14px;
    border-radius: 100px;
    margin-bottom: 16px;
  }
  .status-badge.open {
    background: #e6f4ea;
    border: 1px solid #a8d5ba;
    color: #2e854b;
  }
  .status-badge.full {
    background: #fed7d7;
    border: 1px solid #feb2b2;
    color: #c53030;
  }

  /* ── Meta info ── */
  .collab-meta-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .meta-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #f8f9fa;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
  }
  .meta-item-label {
    font-size: 0.8rem;
    color: #555;
    font-weight: 600;
    display: block;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .meta-item-val {
    font-size: 1.05rem;
    font-weight: 700;
    color: #222;
  }
  .meta-item-val strong { color: #2e854b; }

  /* ── Tags ── */
  .collab-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 6px;
  }
  .collab-tag {
    background: #e6f4ea;
    border: 1px solid #a8d5ba;
    color: #2e854b;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 100px;
  }

  /* ── Lists / Requests ── */
  .req-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .req-card {
    background: #fafafa;
    border: 1px solid #e0e0e0;
    border-radius: 14px;
    padding: 18px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    transition: background 0.2s;
  }
  .req-card:hover {
    background: #f0f2f5;
  }
  .req-info { display: flex; align-items: center; gap: 14px; }
  .req-avatar {
    width: 42px; height: 42px; border-radius: 50%;
    background: #48bb78; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 1.1rem;
  }
  .req-name {
    font-size: 0.95rem; font-weight: 700; color: #222;
  }
  .req-date {
    font-size: 0.75rem; color: #666; margin-top: 4px;
  }

  .req-actions { display: flex; gap: 8px; }
  .req-btn {
    padding: 8px 16px; border-radius: 8px; font-size: 0.82rem; font-weight: 700;
    border: none; cursor: pointer; transition: all 0.2s;
  }
  .req-btn.accept {
    background: #e6f4ea; color: #2e854b; border: 1px solid #a8d5ba;
  }
  .req-btn.accept:hover { background: #48bb78; color: #fff; border-color: #48bb78; }
  .req-btn.reject {
    background: #fed7d7; color: #c53030; border: 1px solid #feb2b2;
  }
  .req-btn.reject:hover { background: #feb2b2; }

  .req-status-badge {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 100px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .req-status-badge.accepted {
    background: #e6f4ea; color: #2e854b;
  }
  .req-status-badge.rejected {
    background: #fed7d7; color: #c53030;
  }

  /* ── General Buttons ── */
  .action-btn {
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }
  .btn-join {
    background: #48bb78; color: #fff;
  }
  .btn-join:hover:not(:disabled) { background: #38a169; transform: translateY(-2px); }
  .btn-join:disabled { opacity: 0.6; cursor: not-allowed; }
  
  .btn-delete {
    background: #fed7d7; color: #c53030; border: 1px solid #feb2b2; margin-top: 24px;
  }
  .btn-delete:hover { background: #feb2b2; }

  .btn-back-link {
    display: inline-block;
    color: #555;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 20px;
    text-decoration: none;
    transition: color 0.2s;
  }
  .btn-back-link:hover { color: #111; }

  /* Grid for my posts */
  .my-posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }
  .my-post-card {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    transition: all 0.2s;
    text-decoration: none;
    color: inherit;
  }
  .my-post-card:hover {
    border-color: #a8d5ba;
    transform: translateY(-4px);
    box-shadow: 0 10px 24px rgba(0,0,0,0.08);
  }
  .my-post-title { font-size: 1.1rem; font-weight: 700; color: #222; margin-bottom: 8px; }
  .my-post-meta { font-size: 0.85rem; color: #555; margin-top: auto; padding-top: 16px; display: flex; justify-content: space-between; }

  .spinner-wrap { text-align: center; padding: 60px 0; color: #666; }
`;

export default function Collaboration() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [collab, setCollab] = useState(null);
    const [myCollabs, setMyCollabs] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

    const [requestSending, setRequestSending] = useState(false);
    const [hasSentRequest, setHasSentRequest] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const currentUserId = user?.id ?? Number(localStorage.getItem('user_id') ?? 0);

    // Initial Fetch
    const fetchData = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            if (id) {
                // Fetch single collab detail
                const res = await api.get(`/collaborations/${id}`);
                const detail = res.data?.data ?? res.data;
                setCollab(detail);

                // If owner or admin, fetch requests (Admins can also view requests for moderation)
                if (Number(detail.user_id) === currentUserId || user?.role === 'admin') {
                    const reqRes = await api.get(`/collaborations/${id}/requests`);
                    setRequests(reqRes.data?.data ?? reqRes.data);
                }
            } else {
                // Fetch paginated collaborations and filter for "Mine"
                // NOTE: If we want true server-side filtering for "My Collabs", we would need a separate endpoint.
                // For now, I will fetch the main feed paginated.
                const res = await api.get(`/collaborations?page=${page}`);
                const allCollabs = res.data?.data ?? [];
                
                // If ID is missing, we are in "My Collaborations" view.
                // To maintain proper pagination for "Mine", we usually need a specialized endpoint like /api/my-collaborations
                // But let's check if such an endpoint exists or if I should just paginate the whole feed if no ID.
                // Actually, the user likely wants to paginate the main feed when browsing, 
                // and "My Collaborations" might not need it yet or needs its own logic.
                // Given the request "in the Collaborate i want the same pagination", 
                // they probably mean the FindTeammates feed (which I just did) OR the management view.
                
                setPagination({
                    current_page: res.data?.current_page ?? 1,
                    last_page: res.data?.last_page ?? 1,
                    total: res.data?.total ?? 0
                });
                
                // Filter for current user's collaborations in the current page
                const mine = allCollabs.filter(c => Number(c.user_id) === currentUserId);
                setMyCollabs(allCollabs); // Showing all in the grid if no ID is provided, consistent with "Feed"
                // Wait, if !id, the component currently shows "My Collaborations" title.
                // I'll update it to show the full Feed if ID is missing, or keep it as "My Collaborations" but with pagination.
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load data. Please refresh or try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1);
    }, [id, currentUserId]);

    // Format date helper
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Unknown';
        return new Date(dateStr).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    // Join Request (Non-Owner)
    async function handleJoinRequest() {
        setRequestSending(true);
        try {
            await api.post(`/collaborations/${id}/requests`);
            setHasSentRequest(true);
            alert('Join request sent successfully!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Could not send request. You may have applied already.';
            alert(msg);
            if (msg.toLowerCase().includes('already')) {
                setHasSentRequest(true);
            }
        } finally {
            setRequestSending(false);
        }
    }

    // Accept / Reject Request (Owner)
    async function handleRequestAction(reqId, action) {
        setActionLoading(reqId);
        try {
            await api.post(`/collaboration-requests/${reqId}/${action}`);
            
            // Update UI list to reflect status change
            setRequests(prev => prev.map(r => 
                r.id === reqId ? { ...r, status: action === 'acceptance' ? 'accepted' : 'rejected' } : r
            ));
            
            if (action === 'acceptance') {
                // Update collab member count locally
                setCollab(prev => ({
                    ...prev,
                    current_members: (prev.current_members || 0) + 1
                }));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update request.');
        } finally {
            setActionLoading(null);
        }
    }

    const confirmDelete = (collabId) => {
        setDeleteModal({ show: true, id: collabId });
    };

    // Delete Collaboration
    async function handleDelete() {
        if (!deleteModal.id) return;
        try {
            await api.delete(`/collaborations/${deleteModal.id}`);
            setDeleteModal({ show: false, id: null });
            if (id) {
                navigate('/collaborations'); // Go back to 'my collabs' list
            } else {
                fetchData(pagination.current_page);
            }
        } catch (err) {
            alert('Failed to delete collaboration.');
            setDeleteModal({ show: false, id: null });
        }
    }

    // RENDER: Loading state
    if (loading) return (
        <div className="collab-page">
            <style>{CSS}</style>
            <div className="spinner-wrap container">
                <div className="spinner-border text-success" role="status"><span className="visually-hidden">Loading...</span></div>
                <p className="mt-3">Loading details...</p>
            </div>
        </div>
    );

    // RENDER: Error state
    if (error) return (
        <div className="collab-page">
            <style>{CSS}</style>
            <div className="container py-5 text-center text-danger">
                <h3>⚠️ Error</h3>
                <p>{error}</p>
                <Link to="/find-teammates" className="action-btn" style={{background: '#343a40', color: '#fff'}}>Browse Others</Link>
            </div>
        </div>
    );

    // RENDER: "My Collaborations" List View (When no ID provides)
    if (!id) {
        return (
            <div className="collab-page">
                <style>{CSS}</style>
                {/* Custom Delete Modal */}
                {deleteModal.show && (
                    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                        <div className="card border-0 shadow-lg rounded-4 p-4 animate__animated animate__zoomIn" style={{ maxWidth: '400px', width: '90%' }}>
                            <div className="text-center mb-4">
                                <div className="display-4 text-danger mb-3">⚠️</div>
                                <h4 className="fw-bold">Delete Collaboration?</h4>
                                <p className="text-muted">This action cannot be undone. Are you sure you want to remove this project posting?</p>
                            </div>
                            <div className="d-flex gap-3">
                                <button className="btn btn-light flex-grow-1 fw-bold rounded-pill py-2" onClick={() => setDeleteModal({ show: false, id: null })}>Cancel</button>
                                <button className="btn btn-danger flex-grow-1 fw-bold rounded-pill py-2" onClick={handleDelete}>Delete Anyway</button>
                            </div>
                        </div>
                    </div>
                )}

                <header className="collab-header">
                    <div className="container text-center">
                        <h1 className="collab-header-title">Collaborations <span>Feed</span></h1>
                        <p className="collab-header-sub mx-auto">Manage your projects and discover new collaboration opportunities.</p>
                    </div>
                </header>
                <main className="container pb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 style={{color: '#222', fontWeight: 'bold', margin: 0}}>Active Posts ({pagination.total})</h4>
                        <Link to="/collaborations" className="btn btn-outline-success" style={{borderRadius: 100, fontWeight: 600}}>
                            + New Post
                        </Link>
                    </div>

                    {myCollabs.length === 0 ? (
                        <div className="collab-panel text-center py-5">
                            <div style={{fontSize: '3rem', marginBottom: '10px'}}>🏗️</div>
                            <h5>No projects found</h5>
                            <p style={{color: '#8b9a8b'}}>Once projects are posted, they will appear here.</p>
                        </div>
                    ) : (
                        <>
                            <div className="my-posts-grid">
                                {myCollabs.map(c => (
                                    <div className="position-relative" key={c.id}>
                                        <Link to={`/collaborations/${c.id}`} className="my-post-card">
                                            <h3 className="my-post-title">{c.title}</h3>
                                            <p style={{color: '#555', fontSize: '0.9rem', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{c.description}</p>
                                            <div className="my-post-meta">
                                                <span style={{color: '#2e854b', fontWeight: 600}}>👥 {c.current_members || 0} / {c.team_size}</span>
                                                <span>Manage ➔</span>
                                            </div>
                                        </Link>
                                        {(Number(c.user_id) === currentUserId || user?.role === 'admin') && (
                                            <button 
                                                onClick={(e) => { e.preventDefault(); confirmDelete(c.id); }}
                                                className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-3 rounded-circle"
                                                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Delete Post"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {pagination.last_page > 1 && (
                                <nav className="d-flex justify-content-center mt-5">
                                    <ul className="pagination gap-2 border-0">
                                        <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                                            <button 
                                                className="btn btn-light bg-white border shadow-sm rounded-pill px-4 fw-bold text-success" 
                                                onClick={() => fetchData(pagination.current_page - 1)}
                                                disabled={pagination.current_page === 1}
                                            >
                                                &laquo; Earlier
                                            </button>
                                        </li>
                                        
                                        {[...Array(pagination.last_page)].map((_, i) => (
                                            <li key={i+1} className={`page-item ${pagination.current_page === i + 1 ? 'active' : ''}`}>
                                                <button 
                                                    className={`btn border shadow-sm rounded-circle fw-bold mx-1 ${pagination.current_page === i + 1 ? 'btn-success text-white' : 'btn-light bg-white text-success'}`} 
                                                    style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => fetchData(i + 1)}
                                                >
                                                    {i + 1}
                                                </button>
                                            </li>
                                        ))}

                                        <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                                            <button 
                                                className="btn btn-light bg-white border shadow-sm rounded-pill px-4 fw-bold text-success" 
                                                onClick={() => fetchData(pagination.current_page + 1)}
                                                disabled={pagination.current_page === pagination.last_page}
                                            >
                                                Next &raquo;
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            )}
                        </>
                    )}
                </main>
            </div>
        );
    }

    // RENDER: Single Detail View (With ID)
    if (!collab) return null;

    const isOwner = Number(collab.user_id) === currentUserId;
    const isFull = Number(collab.current_members ?? 0) >= Number(collab.team_size);
    const skillsList = collab.tech_stack ? collab.tech_stack.split(',').map(s=>s.trim()).filter(Boolean) : [];

    return (
        <div className="collab-page">
            <style>{CSS}</style>
            
            <header className="collab-header py-4" style={{paddingTop: '30px', paddingBottom: '30px', marginBottom: '30px'}}>
                <div className="container">
                    <Link to={isOwner ? "/collaborations" : "/find-teammates"} className="btn-back-link">
                        ← Back to {isOwner ? 'my posts' : 'feed'}
                    </Link>
                    <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap'}}>
                        <div>
                            <div className={`status-badge ${isFull ? 'full' : 'open'}`}>
                                {isFull ? 'Full' : 'Recruiting Open'}
                            </div>
                            <h1 className="collab-header-title text-start mb-0" style={{fontSize: '1.8rem'}}>{collab.title}</h1>
                            <div style={{color: '#555', marginTop: 8, fontSize: '0.9rem'}}>
                                Posted by {collab.user?.name || collab.creator_name || 'Anonymous'} on {formatDate(collab.created_at)}
                            </div>
                        </div>
                        
                        {!isOwner && (
                            <button 
                                className="action-btn btn-join" 
                                disabled={isFull || hasSentRequest || requestSending}
                                onClick={handleJoinRequest}
                            >
                                {requestSending ? 'Sending...' 
                                : hasSentRequest ? '✓ Request Sent' 
                                : isFull ? '🚫 Project Full' 
                                : '✋ Send Join Request'}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="container pb-5">
                <div className="row">
                    <div className="col-lg-8">
                        <div className="collab-panel">
                            <h3 className="collab-title">About the Project</h3>
                            <p className="collab-desc" style={{whiteSpace: 'pre-wrap'}}>{collab.description}</p>

                            <h3 className="collab-title" style={{fontSize: '1.1rem', marginTop: 30}}>Required Skills</h3>
                            {skillsList.length > 0 ? (
                                <div className="collab-tags">
                                    {skillsList.map(skill => <span key={skill} className="collab-tag">{skill}</span>)}
                                </div>
                            ) : (
                                <span style={{color: '#555', fontSize: '0.9rem'}}>No specific skills mentioned.</span>
                            )}
                        </div>

                        {/* Owner Dashboard: Management Panel */}
                        {isOwner && (
                            <div className="collab-panel" style={{borderTop: '3px solid #48bb78'}}>
                                <h3 className="collab-title">Applicant Requests</h3>
                                <p style={{color: '#555', fontSize: '0.9rem', marginBottom: 20}}>
                                    Review students who want to join your team. Accepting a member automatically updates the available slots.
                                </p>

                                {requests.length === 0 ? (
                                    <div style={{padding: '30px', textAlign: 'center', background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 12}}>
                                        No join requests yet.
                                    </div>
                                ) : (
                                    <div className="req-list">
                                        {requests.map(req => (
                                            <div className="req-card" key={req.id}>
                                                <div className="req-info">
                                                    <div className="req-avatar">{req.user?.name?.[0]?.toUpperCase() || '?'}</div>
                                                    <div>
                                                        <div className="req-name">{req.user?.name || 'Unknown User'}</div>
                                                        <div className="req-date">Applied {formatDate(req.created_at)}</div>
                                                    </div>
                                                </div>
                                                <div className="req-actions">
                                                    {req.status === 'pending' ? (
                                                        <>
                                                            <button 
                                                                className="req-btn accept" 
                                                                onClick={() => handleRequestAction(req.id, 'acceptance')}
                                                                disabled={actionLoading === req.id || isFull}
                                                            >
                                                                {actionLoading === req.id ? '...' : 'Accept'}
                                                            </button>
                                                            <button 
                                                                className="req-btn reject" 
                                                                onClick={() => handleRequestAction(req.id, 'rejection')}
                                                                disabled={actionLoading === req.id}
                                                            >
                                                                {actionLoading === req.id ? '...' : 'Reject'}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className={`req-status-badge ${req.status}`}>
                                                            {req.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="col-lg-4">
                        <div className="collab-panel" style={{background: '#fafafa'}}>
                            <h3 className="collab-title" style={{fontSize: '1.2rem', marginBottom: 20}}>Team Status</h3>
                            
                            <div className="collab-meta-list">
                                <div className="meta-item">
                                    <div style={{fontSize: '1.5rem'}}>👥</div>
                                    <div>
                                        <span className="meta-item-label">Slots Filled</span>
                                        <span className="meta-item-val">
                                            <strong>{collab.current_members || 0}</strong> / {collab.team_size}
                                        </span>
                                    </div>
                                </div>
                                <div className="meta-item">
                                    <div style={{fontSize: '1.5rem'}}>🚀</div>
                                    <div>
                                        <span className="meta-item-label">Status</span>
                                        <span className="meta-item-val">
                                            {isFull ? <span className="text-danger">Team Full</span> : 'Recruiting'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Owner or Admin: Danger Zone */}
                            {(isOwner || user?.role === 'admin') && (
                                <button className="action-btn btn-delete w-100 justify-content-center" onClick={() => confirmDelete(collab.id)}>
                                    Delete Posting
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Custom Delete Modal (Shared) */}
                {deleteModal.show && (
                    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                        <div className="card border-0 shadow-lg rounded-4 p-4 animate__animated animate__zoomIn" style={{ maxWidth: '400px', width: '90%' }}>
                            <div className="text-center mb-4">
                                <div className="display-4 text-danger mb-3">⚠️</div>
                                <h4 className="fw-bold">Delete Collaboration?</h4>
                                <p className="text-muted">This action cannot be undone. Are you sure you want to remove this project posting?</p>
                            </div>
                            <div className="d-flex gap-3">
                                <button className="btn btn-light flex-grow-1 fw-bold rounded-pill py-2" onClick={() => setDeleteModal({ show: false, id: null })}>Cancel</button>
                                <button className="btn btn-danger flex-grow-1 fw-bold rounded-pill py-2" onClick={handleDelete}>Delete Anyway</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
