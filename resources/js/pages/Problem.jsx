import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const Problem = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [showPostBox, setShowPostBox] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, type: 'post' });

    useEffect(() => {
        fetchProblems(1);
    }, []);

    const fetchProblems = async (page = 1) => {
        setLoading(true);
        try {
            const response = await api.get(`/post/wall?page=${page}`);
            setPosts(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error("Feed could not be loaded.");
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            const response = await api.post('/post/create-post', { content });
            const newPost = response.data.post;
            setPosts([newPost, ...posts.slice(0, 9)]); 
            setContent("");
            setShowPostBox(false);
            fetchProblems(1); 
        } catch (err) {
            alert("Error posting your problem. Please try again.");
        }
    };

    const handleReaction = async (postId, type) => {
        try {
            const response = await api.post(`/post/like/${postId}`, { type });
            setPosts(posts.map(post => 
                post.id === postId 
                    ? { ...post, likes_count: response.data.likes_count } 
                    : post
            ));
        } catch (err) {
            console.error("Reaction failed");
        }
    };

    const handleComment = async (e, postId) => {
        e.preventDefault();
        const commentText = e.target.comment.value;
        if (!commentText.trim()) return;

        try {
            const response = await api.post(`/post/comment/${postId}`, { comment_text: commentText });
            setPosts(posts.map(post => 
                post.id === postId 
                    ? { ...post, comments: [...(post.comments || []), response.data.comment] } 
                    : post
            ));
            e.target.comment.value = "";
        } catch (err) {
            alert("Error posting comment.");
        }
    };

    const confirmDelete = (id, type = 'post') => {
        setDeleteModal({ show: true, id, type });
    };

    const handleDelete = async () => {
        const { id, type } = deleteModal;
        try {
            if (type === 'post') {
                await api.delete(`/post/delete/${id}`);
                setPosts(posts.filter(post => post.id !== id));
                if (posts.length === 1 && pagination.current_page > 1) {
                    fetchProblems(pagination.current_page - 1);
                } else {
                    fetchProblems(pagination.current_page);
                }
            } else {
                await api.delete(`/post/comment/${id}`);
                setPosts(posts.map(post => ({
                    ...post,
                    comments: (post.comments || []).filter(c => c.id !== id)
                })));
            }
            setDeleteModal({ show: false, id: null, type: 'post' });
        } catch (err) {
            alert(`Error deleting ${type}.`);
            setDeleteModal({ show: false, id: null, type: 'post' });
        }
    };

    const reactionTypes = [
        { type: 'like', icon: '👍' },
        { type: 'love', icon: '❤️' },
        { type: 'haha', icon: '😂' },
        { type: 'sad', icon: '😢' },
        { type: 'angry', icon: '😡' },
        { type: 'dislike', icon: '👎' },
    ];

    return (
        <div className="bg-light min-vh-100 position-relative">
            {/* Custom Delete Modal */}
            {deleteModal.show && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                    <div className="card border-0 shadow-lg rounded-4 p-4 animate__animated animate__zoomIn" style={{ maxWidth: '400px', width: '90%' }}>
                        <div className="text-center mb-4">
                            <div className="display-4 text-danger mb-3">⚠️</div>
                            <h4 className="fw-bold">Delete {deleteModal.type.charAt(0).toUpperCase() + deleteModal.type.slice(1)}?</h4>
                            <p className="text-muted">This action cannot be undone. Are you sure you want to remove this {deleteModal.type}?</p>
                        </div>
                        <div className="d-flex gap-3">
                            <button className="btn btn-light flex-grow-1 fw-bold rounded-pill py-2" onClick={() => setDeleteModal({ show: false, id: null, type: 'post' })}>Cancel</button>
                            <button className="btn btn-danger flex-grow-1 fw-bold rounded-pill py-2" onClick={handleDelete}>Delete Anyway</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="bg-dark text-white py-5 shadow-sm">
                <div className="container position-relative">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <div className="d-flex align-items-center gap-3 mb-2">
                                <h1 className="display-4 fw-bold text-success mb-0">Problem Feed</h1>
                                {user?.role === 'admin' && (
                                    <span className="badge bg-danger rounded-pill px-3 py-2 shadow-sm" style={{ fontSize: '0.9rem' }}>
                                        ADMIN ACCESS
                                    </span>
                                )}
                            </div>
                            <p className="lead text-gray-400">Share academic or technical challenges with the AUST CSE community.</p>
                        </div>
                        <div className="col-md-4 text-md-end mt-3 mt-md-0">
                            <button 
                                className="btn btn-success btn-lg px-4 fw-bold"
                                onClick={() => setShowPostBox(!showPostBox)}
                                style={{ borderRadius: '100px', backgroundColor: '#48bb78' }}
                            >
                                {showPostBox ? 'Close' : 'Post Problem'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container py-5">
                {showPostBox && (
                    <div className="row justify-content-center mb-5">
                        <div className="col-lg-8">
                            <div className="card shadow border-0 rounded-4 animate__animated animate__fadeInDown">
                                <div className="card-body p-4">
                                    <form onSubmit={handleSubmit}>
                                        <textarea
                                            className="form-control mb-3 border-0 bg-light p-3"
                                            rows="4"
                                            style={{ borderRadius: '12px', resize: 'none' }}
                                            placeholder="What's bothering you? Describe your problem..."
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                        />
                                        <div className="d-flex justify-content-end">
                                            <button className="btn btn-success px-5 fw-bold" style={{ borderRadius: '100px', backgroundColor: '#48bb78' }}>
                                                Post Now
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        {loading ? (
                            <div className="text-center py-5 text-success">
                                <div className="spinner-border mb-3" role="status"></div>
                                <p className="fw-bold">Loading problems...</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-4">
                                {posts.length === 0 ? (
                                    <div className="text-center py-5">
                                        <h3 className="text-muted">No problems posted yet.</h3>
                                        <p>Be the first to share a challenge!</p>
                                    </div>
                                ) : (
                                    posts.map((post) => (
                                        <div key={post.id} className="card shadow-sm border-0 rounded-4 hover-lift">
                                            <div className="card-body p-4">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: '45px', height: '45px', borderRadius: '12px', backgroundColor: '#48bb78' }}>
                                                            {post.user?.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="ms-3">
                                                            <h6 className="fw-bold mb-0">{post.user?.name}</h6>
                                                            <small className="text-muted">{new Date(post.created_at).toLocaleDateString()}</small>
                                                        </div>
                                                    </div>
                                                    {user && (String(user.id) === String(post.user_id) || user.role === 'admin') && (
                                                        <div className="d-flex align-items-center gap-2">
                                                            {user.role === 'admin' && String(user.id) !== String(post.user_id) && (
                                                                <span className="badge bg-soft-danger text-danger border border-danger fw-bold text-uppercase px-2 py-1" style={{ fontSize: '10px' }}>Admin Action</span>
                                                            )}
                                                            <button 
                                                                onClick={() => confirmDelete(post.id, 'post')} 
                                                                className="btn btn-outline-danger btn-sm px-3 d-flex align-items-center gap-2 border-0" 
                                                                title="Delete Post"
                                                                style={{ borderRadius: '100px', fontSize: '0.85rem' }}
                                                            >
                                                                <span>🗑️</span>
                                                                <span className="fw-bold">Delete</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="card-text fs-5 mb-4 text-dark">{post.content}</p>
                                                
                                                <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
                                                    {reactionTypes.map((r) => (
                                                        <button 
                                                            key={r.type}
                                                            onClick={() => handleReaction(post.id, r.type)}
                                                            className="btn btn-light btn-sm border shadow-sm rounded-pill px-3 transition-all"
                                                            title={r.type.charAt(0).toUpperCase() + r.type.slice(1)}
                                                            style={{ whiteSpace: 'nowrap' }}
                                                        >
                                                            {r.icon}
                                                        </button>
                                                    ))}
                                                    <span className="ms-auto align-self-center badge bg-light text-dark border fw-normal py-2 px-3 rounded-pill">
                                                        Reactions: {post.likes_count || 0}
                                                    </span>
                                                </div>

                                                <div className="border-top pt-4">
                                                    <h6 className="fw-bold mb-3">Comments</h6>
                                                    <div className="d-flex flex-column gap-3 mb-4">
                                                        {post.comments && post.comments.map((comment) => (
                                                            <div key={comment.id} className="bg-light p-3 rounded-3 shadow-sm border position-relative comment-container">
                                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                                    <span className="fw-bold text-success small">{comment.user?.name}</span>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <small className="text-muted" style={{ fontSize: '10px' }}>{new Date(comment.created_at).toLocaleTimeString()}</small>
                                                                        {user && (String(user.id) === String(comment.user_id) || user.role === 'admin') && (
                                                                            <button 
                                                                                onClick={() => confirmDelete(comment.id, 'comment')}
                                                                                className="btn btn-link text-danger p-0 border-0 lh-1 delete-comment-btn"
                                                                                title="Delete Comment"
                                                                                style={{ textDecoration: 'none' }}
                                                                            >
                                                                                &times;
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <p className="mb-0 small">{comment.comment_text}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <form onSubmit={(e) => handleComment(e, post.id)} className="input-group">
                                                        <input type="text" name="comment" className="form-control border-0 bg-light py-2 px-3 shadow-none" placeholder="Write a comment..." style={{ borderRadius: '20px 0 0 20px' }} />
                                                        <button className="btn btn-success px-4" type="submit" style={{ borderRadius: '0 20px 20px 0', backgroundColor: '#48bb78' }}>Post</button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {/* Pagination Controls */}
                                {pagination.last_page > 1 && (
                                    <nav className="d-flex justify-content-center mt-5">
                                        <ul className="pagination gap-2 border-0">
                                            <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link border-0 shadow-sm rounded-pill px-4 fw-bold text-success" 
                                                    onClick={() => fetchProblems(pagination.current_page - 1)}
                                                >
                                                    &laquo; Earlier
                                                </button>
                                            </li>
                                            
                                            {[...Array(pagination.last_page)].map((_, i) => (
                                                <li key={i+1} className={`page-item ${pagination.current_page === i + 1 ? 'active' : ''}`}>
                                                    <button 
                                                        className={`page-link border-0 shadow-sm rounded-circle fw-bold mx-1 ${pagination.current_page === i + 1 ? 'bg-success text-white' : 'text-success'}`} 
                                                        style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        onClick={() => fetchProblems(i + 1)}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                </li>
                                            ))}

                                            <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                                                <button 
                                                    className="page-link border-0 shadow-sm rounded-pill px-4 fw-bold text-success" 
                                                    onClick={() => fetchProblems(pagination.current_page + 1)}
                                                >
                                                    Next &raquo;
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
                .transition-all { transition: all 0.2s ease; }
                .transition-all:hover { transform: scale(1.1); }
                .bg-soft-danger { background-color: rgba(220, 53, 69, 0.1); }
                .animate__animated { animation-duration: 0.4s; }
                .comment-container .delete-comment-btn { display: none; font-size: 1.2rem; }
                .comment-container:hover .delete-comment-btn { display: inline-block; }
            `}</style>
        </div>
    );
};

export default Problem;
