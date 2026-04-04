import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const Problem = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [showPostBox, setShowPostBox] = useState(false);

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const response = await api.get('/post/wall');
            setPosts(response.data);
            setLoading(false);
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
            // PostController returns { message: 'Post created!', post: Object }
            const newPost = response.data.post;
            setPosts([newPost, ...posts]);
            setContent("");
            setShowPostBox(false);
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

    const handleDelete = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await api.delete(`/post/delete/${postId}`);
            setPosts(posts.filter(post => post.id !== postId));
        } catch (err) {
            alert("Error deleting post.");
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
        <div className="bg-light min-vh-100">
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
                            <div className="card shadow border-0 rounded-4">
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
                                {posts.map((post) => (
                                    <div key={post.id} className="card shadow-sm border-0 rounded-4">
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
                                                            onClick={() => handleDelete(post.id)} 
                                                            className="btn btn-danger btn-sm px-3 shadow-sm d-flex align-items-center gap-2" 
                                                            title="Delete Post"
                                                            style={{ borderRadius: '100px', fontSize: '0.85rem' }}
                                                        >
                                                            <span>🗑️</span>
                                                            <span className="fw-bold">Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="card-text fs-5 mb-4">{post.content}</p>
                                            
                                            <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
                                                {reactionTypes.map((r) => (
                                                    <button 
                                                        key={r.type}
                                                        onClick={() => handleReaction(post.id, r.type)}
                                                        className="btn btn-light btn-sm border shadow-sm rounded-pill px-3"
                                                        title={r.type.charAt(0).toUpperCase() + r.type.slice(1)}
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
                                                    {post.comments && post.comments.map((comment, idx) => (
                                                        <div key={idx} className="bg-light p-3 rounded-3 shadow-sm border">
                                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                                <span className="fw-bold text-success small">{comment.user?.name}</span>
                                                                <small className="text-muted" style={{ fontSize: '10px' }}>{new Date(comment.created_at).toLocaleTimeString()}</small>
                                                            </div>
                                                            <p className="mb-0 small">{comment.comment_text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <form onSubmit={(e) => handleComment(e, post.id)} className="input-group">
                                                    <input type="text" name="comment" className="form-control border-0 bg-light py-2 px-3" placeholder="Write a comment..." style={{ borderRadius: '20px 0 0 20px' }} />
                                                    <button className="btn btn-success px-4" type="submit" style={{ borderRadius: '0 20px 20px 0', backgroundColor: '#48bb78' }}>Post</button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Problem;