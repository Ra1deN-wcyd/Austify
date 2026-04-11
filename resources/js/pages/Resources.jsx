import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/api';

const courseMap = {
    "1.1": ["Introduction to Programming", "Discrete Mathematics", "English Communication", "Physics", "Math-1"],
    "1.2": ["Object Oriented Programming", "Data Structures", "Calculus", "Chemistry", "Electrical Circuits"],
    "2.1": ["Algorithms", "Database Systems", "Computer Architecture", "Math-2", "Statistics"],
    "2.2": ["Operating Systems", "Computer Networks", "Software Engineering", "Numerical Methods", "Economy"],
    "3.1": ["Compiler Design", "Artificial Intelligence", "Theory of Computation", "Signal Processing", "Ethics"],
    "3.2": ["Machine Learning", "Web Technologies", "Information Security", "Simulation", "Entrepreneurship"],
    "4.1": ["Distributed Systems", "Computer Graphics", "Digital Image Processing", "Project-1", "Elective-1"],
    "4.2": ["Thesis/Project-2", "Cloud Computing", "IoT", "Elective-2", "Elective-3"],
};

const semesters = ["1.1", "1.2", "2.1", "2.2", "3.1", "3.2", "4.1", "4.2"];

/**
 * Extracts a YouTube embeddable URL from various formats.
 */
function getEmbedUrl(url) {
    if (!url) return '';
    try {
        const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regExp);
        return match && match[1]
            ? 'https://www.youtube.com/embed/' + match[1]
            : url;
    } catch {
        return url;
    }
}

export default function Resources() {
    const [semester, setSemester] = useState(null);
    const [course, setCourse] = useState(null);
    const [courseSearch, setCourseSearch] = useState('');
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [activeYoutubeClip, setActiveYoutubeClip] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', url: '', description: '', file: null });
    const [uploadType, setUploadType] = useState('link'); // 'link' | 'file'
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (semester && course) {
            loadResources(semester, course);
        }
    }, [semester, course]);

    async function loadResources(sem, crs) {
        setLoading(true);
        setResources([]);
        setFetchError(null);
        setActiveYoutubeClip(null);
        try {
            const res = await api.get('/videos', {
                params: { semester: sem, course: crs }
            });
            setResources(Array.isArray(res.data) ? res.data : []);
            setCurrentPage(1);
        } catch (err) {
            console.error('Failed to load resources:', err);
            setFetchError('Could not load resources. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }

    const filteredCourses = useMemo(() => {
        if (!semester) return [];
        return (courseMap[semester] || []).filter(c =>
            c.toLowerCase().includes(courseSearch.toLowerCase())
        );
    }, [semester, courseSearch]);

    const paginatedResources = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return resources.slice(start, start + itemsPerPage);
    }, [resources, currentPage]);

    const totalPages = Math.ceil(resources.length / itemsPerPage);

    function handleSemesterClick(s) {
        setSemester(s);
        setCourse(null);
        setCourseSearch('');
        setResources([]);
        setActiveYoutubeClip(null);
        setFetchError(null);
    }

    function handleCourseClick(c) {
        setCourse(c);
        setActiveYoutubeClip(null);
        setFetchError(null);
        // Better scrolling to the video section
        setTimeout(() => {
            const el = document.getElementById('vids');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    function handleFormChange(e) {
        if (e.target.name === 'file') {
            setForm(prev => ({ ...prev, file: e.target.files[0] }));
        } else {
            setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        }
        setFormError('');
    }

    async function handleAddResource(e) {
        e.preventDefault();
        setFormError('');

        // Basic validation
        if (!form.title.trim()) {
            setFormError('Title is required.');
            return;
        }
        if (!form.url.trim() && !form.file) {
            setFormError('You must provide either a link or upload a file.');
            return;
        }

        // No URL format restriction — any link is valid (YouTube, Google Drive, etc.)

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('semester', semester);
            formData.append('course', course);
            if (form.url) formData.append('url', form.url);
            if (form.file) formData.append('file', form.file);

            const res = await api.post('/videos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newResource = res.data;
            setResources(prev => [newResource, ...prev]);
            setForm({ title: '', url: '', description: '', file: null });
            setShowModal(false);
        } catch (err) {
            console.error('Add resource error:', err);
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to add resource. The server encountered an issue.';
            setFormError(msg);
        } finally {
            setSubmitting(false);
        }
    }

    function openModal() {
        setForm({ title: '', url: '', description: '', file: null });
        setUploadType('link');
        setFormError('');
        setShowModal(true);
    }

    return (
        <div className="res-page-wrapper">
            <style>{`
  .res-page-wrapper {
                    background: #f0f2f5;
                    min-height: 100vh;
                    color: #333;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }
                
                .res-hero {
                    background: #fff;
                    padding: 80px 0 60px;
                    border-bottom: 1px solid #e0e0e0;
                    position: relative;
                    overflow: hidden;
                }
                .res-hero::after {
                    content: '';
                    position: absolute;
                    bottom: -50px; right: -50px;
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, rgba(72,187,120,0.06) 0%, transparent 70%);
                    pointer-events: none;
                }
                
                .res-label {
                    color: #222;
                    font-weight: 700;
                    font-size: 1.1rem;
                    margin-bottom: 20px;
                    letter-spacing: -0.01em;
                }

                .res-semester-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 12px;
                    margin-bottom: 40px;
                }

                .res-semester-btn {
                    background: #fff;
                    border: 1px solid #e0e0e0;
                    color: #555;
                    border-radius: 12px;
                    padding: 14px 10px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    text-align: center;
                }
                .res-semester-btn:hover {
                    border-color: #48bb78;
                    color: #2e854b;
                    transform: translateY(-2px);
                    background: #e6f4ea;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                }
                .res-semester-btn.res-active {
                    background: #48bb78;
                    border-color: #48bb78;
                    color: #fff;
                    box-shadow: 0 8px 24px rgba(72,187,120,0.3);
                }

                .res-courses-section {
                    animation: resFadeIn 0.5s ease;
                }
                @keyframes resFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .res-search-input {
                    background: #fff;
                    border: 1px solid #ccc;
                    color: #333;
                    padding: 10px 16px;
                    border-radius: 10px;
                    width: 100%;
                    max-width: 300px;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }
                .res-search-input:focus {
                    outline: none;
                    border-color: #48bb78;
                    box-shadow: 0 0 0 2px rgba(72,187,120,0.2);
                }

                .res-course-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 16px;
                    margin-top: 20px;
                }

                .res-course-card {
                    background: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 14px;
                    padding: 24px 20px;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: #444;
                    font-weight: 600;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    min-height: 80px;
                }
                .res-course-card::before {
                    content: '📚';
                    margin-right: 12px;
                    font-size: 1.2rem;
                    opacity: 0.7;
                }
                .res-course-card:hover {
                    border-color: #48bb78;
                    color: #222;
                    background: #f8f9fa;
                    transform: scale(1.02);
                }
                .res-course-card.res-active {
                    border-color: #48bb78;
                    background: #e6f4ea;
                    color: #2e854b;
                    box-shadow: inset 0 0 0 1px #48bb78;
                }

                .res-video-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 24px;
                    margin-top: 30px;
                }

                .res-video-card {
                    background: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 16px;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                }
                .res-video-card:hover {
                    border-color: #48bb78;
                    transform: translateY(-8px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.1);
                }
                .res-video-card.res-playing {
                    border-color: #48bb78;
                    cursor: default;
                    transform: none;
                }

                .res-thumb-wrap {
                    aspect-ratio: 16/9;
                    background: #eee;
                    position: relative;
                }
                .res-thumb-wrap iframe {
                    width: 100%; height: 100%; border:0;
                }
                .res-play-overlay {
                    position: absolute; inset: 0;
                    background: rgba(0,0,0,0.2);
                    display: flex; align-items: center; justify-content: center;
                    transition: background 0.3s;
                }
                .res-video-card:hover .res-play-overlay {
                    background: rgba(0,0,0,0.05);
                }
                .res-play-btn {
                    width: 60px; height: 60px;
                    background: #48bb78;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 0 20px rgba(72,187,120,0.5);
                    transform: scale(1);
                    transition: transform 0.2s;
                }
                .res-video-card:hover .res-play-btn {
                    transform: scale(1.1);
                }

                .res-video-info { padding: 20px; }
                .res-video-tag {
                    color: #48bb78; font-size: 0.75rem; font-weight: 750;
                    text-transform: uppercase; margin-bottom: 8px; display: block;
                }
                .res-video-title {
                    font-size: 1.05rem; font-weight: 700; color: #222;
                    line-height: 1.4; margin-bottom: 10px;
                    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
                }
                .res-video-desc {
                    font-size: 0.88rem; color: #666; line-height: 1.6;
                    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
                }

                .res-toolbar {
                    background: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    padding: 12px 20px;
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 30px;
                }
                
                .res-btn-back {
                    background: transparent; border: 0; color: #555;
                    font-size: 0.85rem; font-weight: 600; cursor: pointer;
                    display: flex; align-items: center; transition: color 0.2s;
                }
                .res-btn-back:hover { color: #111; }
                .res-btn-back svg { margin-right: 6px; }

                /* Premium Scrollbar */
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #f0f2f5; }
                ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #aaa; }

                .res-backdrop {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px); z-index: 2000;
                    display: flex; align-items: center; justify-content: center; padding: 20px;
                }
                .res-modal {
                    background: #fff; border: 1px solid #ccc; border-radius: 20px;
                    width: 100%; max-width: 500px; padding: 32px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                    animation: resPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                @keyframes resPop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
            `}</style>

            <header className="res-hero">
                <div className="container text-center">
                    <span className="badge bg-success-subtle text-success mb-3 px-3 py-2 rounded-pill fw-bold">E-LEARNING PORTAL</span>
                    <h1 className="display-4 fw-bolder mb-3">Academic <span className="text-success">Resources</span></h1>
                    <p className="lead text-secondary opacity-75 mx-auto" style={{ maxWidth: '600px' }}>
                        Curated lecture videos and materials shared by senior students to help you ace your CSE journey at AUST.
                    </p>
                </div>
            </header>

            <main className="container py-5">
                {/* Semester Selection */}
                <section>
                    <div className="d-flex justify-content-between align-items-end mb-4">
                        <h2 className="res-label m-0">1. Select Semester</h2>
                        {semester && <button onClick={() => setSemester(null)} className="btn btn-link text-secondary p-0 text-decoration-none small">Clear All</button>}
                    </div>
                    <div className="res-semester-grid">
                        {semesters.map(s => (
                            <div
                                key={s}
                                className={`res-semester-btn ${semester === s ? 'res-active' : ''}`}
                                onClick={() => handleSemesterClick(s)}
                            >
                                {s} Semester
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="my-5 border-secondary opacity-25" />

                {/* Courses Selection */}
                {semester ? (
                    <section className="res-courses-section">
                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                            <h2 className="res-label m-0">2. Browse Courses for {semester}</h2>
                            <input
                                type="text"
                                className="res-search-input"
                                placeholder="Search courses..."
                                value={courseSearch}
                                onChange={(e) => setCourseSearch(e.target.value)}
                            />
                        </div>

                        {filteredCourses.length > 0 ? (
                            <div className="res-course-grid">
                                {filteredCourses.map(c => (
                                    <div
                                        key={c}
                                        className={`res-course-card ${course === c ? 'res-active' : ''}`}
                                        onClick={() => handleCourseClick(c)}
                                    >
                                        {c}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-5 text-secondary opacity-50">
                                🔍 No courses found matching "{courseSearch}"
                            </div>
                        )}
                    </section>
                ) : (
                    <div className="text-center py-5 text-secondary opacity-50">
                        <div style={{ fontSize: '3rem' }} className="mb-3">👆</div>
                        <p>Unlock course materials by selecting a semester above.</p>
                    </div>
                )}

                <hr className="my-5 border-secondary opacity-25" />

                {/* Video Results Area */}
                {course && (
                    <section className="res-courses-section" id="vids">
                        <div className="res-toolbar">
                            <div className="d-flex flex-column">
                                <button className="res-btn-back mb-1" onClick={() => setCourse(null)}>
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                    All Courses
                                </button>
                                <span className="small text-secondary fw-semibold">
                                    {semester} › <span className="text-success">{course}</span>
                                </span>
                            </div>
                            <button className="btn btn-success rounded-3 px-4 fw-bold shadow-sm" onClick={openModal}>
                                + Add Resource
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-4 text-secondary">Fetching the best resources for you...</p>
                            </div>
                        ) : fetchError ? (
                            <div className="alert alert-danger bg-danger-subtle border-0 rounded-4 p-4 text-center">
                                <h4 className="alert-heading fw-bold">Oops! Something went wrong</h4>
                                <p className="mb-3">{fetchError}</p>
                                <button className="btn btn-danger px-4" onClick={() => loadResources(semester, course)}>Try Again</button>
                            </div>
                        ) : resources.length === 0 ? (
                            <div className="text-center py-5 border border-secondary border-dashed rounded-4" style={{ borderStyle: 'dashed' }}>
                                <div style={{ fontSize: '3.5rem' }}>📂</div>
                                <h3 className="mt-4 fw-bold">No resources yet</h3>
                                <p className="text-secondary pb-4">Be the first to share a lecture or resource for this course!</p>
                                <button className="btn btn-success btn-lg px-5 rounded-pill" onClick={openModal}>+ Add Resource</button>
                            </div>
                        ) : (
                            <>
                                <div className="res-video-grid">
                                    {paginatedResources.map(v => {
                                        const isFile = !!v.file_path;
                                    const isYoutube = !isFile && !!v.url && /youtu\.be|youtube\.com/.test(v.url);
                                    const isExternalLink = !isFile && !isYoutube && !!v.url;
                                    const isPlaying = activeYoutubeClip === v.id;
                                    const embedUrl = isYoutube ? getEmbedUrl(v.url) : null;

                                    return (
                                        <div
                                            key={v.id}
                                            className={`res-video-card ${isPlaying ? 'res-playing' : ''}`}
                                            onClick={() => {
                                                if (isFile || isExternalLink) {
                                                    const href = isFile
                                                        ? `${(import.meta.env.VITE_API_URL || window.location.origin).replace(/\/api$/, '')}/storage/${v.file_path}`
                                                        : v.url;
                                                    window.open(href, '_blank');
                                                } else if (isYoutube && !isPlaying) {
                                                    setActiveYoutubeClip(v.id);
                                                }
                                            }}
                                        >
                                            <div className="res-thumb-wrap">
                                                {isFile ? (
                                                    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-light" style={{ color: '#48bb78' }}>
                                                        <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z" />
                                                        </svg>
                                                        <span className="mt-2 fw-bold text-secondary">File Attachment</span>
                                                    </div>
                                                ) : isExternalLink ? (
                                                    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-light" style={{ color: '#48bb78' }}>
                                                        <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0V3z" />
                                                        </svg>
                                                        <span className="mt-2 fw-bold text-secondary">External Link</span>
                                                    </div>
                                                ) : isPlaying ? (
                                                    <iframe
                                                        src={`${embedUrl}?autoplay=1&modestbranding=1`}
                                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                ) : (
                                                    <>
                                                        <img
                                                            src={`https://img.youtube.com/vi/${embedUrl.split('/').pop()}/mqdefault.jpg`}
                                                            alt={v.title}
                                                            className="w-100 h-100 object-fit-cover"
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/480x270/1A1D21/FFFFFF?text=Resource'; }}
                                                        />
                                                        <div className="res-play-overlay">
                                                            <div className="res-play-btn">
                                                                <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="res-video-info">
                                                <span className="res-video-tag">{course}</span>
                                                <h3 className="res-video-title">{v.title}</h3>
                                                {v.description && <p className="res-video-desc">{v.description}</p>}
                                                <div className="mt-3 pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                                                    <span className="small text-secondary fw-medium">
                                                        📤 Uploaded by <strong>{v.uploader_name || 'Anonymous'}</strong>
                                                    </span>
                                                    {isFile ? (
                                                        <a href={`${(import.meta.env.VITE_API_URL || window.location.origin).replace(/\/api$/, '')}/storage/${v.file_path}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="btn btn-sm btn-outline-success fw-bold rounded-pill px-3">
                                                            Download / View
                                                        </a>
                                                    ) : isExternalLink ? (
                                                        <a href={v.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="btn btn-sm btn-outline-success fw-bold rounded-pill px-3">
                                                            Open Link
                                                        </a>
                                                    ) : (
                                                        <a href={v.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-success text-decoration-none small fw-bold">Watch on YouTube</a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                </div>
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-center align-items-center mt-5 gap-3" style={{ animation: 'resFadeIn 0.5s ease' }}>
                                        <button 
                                            className="btn btn-outline-success fw-bold px-4 rounded-pill" 
                                            disabled={currentPage === 1}
                                            onClick={() => {
                                                setCurrentPage(p => Math.max(1, p - 1));
                                                const el = document.getElementById('vids');
                                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            &larr; Previous
                                        </button>
                                        <div className="bg-white border rounded-pill px-4 py-2 text-secondary fw-bold shadow-sm">
                                            Page <span className="text-dark">{currentPage}</span> of <span className="text-dark">{totalPages}</span>
                                        </div>
                                        <button 
                                            className="btn btn-outline-success fw-bold px-4 rounded-pill" 
                                            disabled={currentPage === totalPages}
                                            onClick={() => {
                                                setCurrentPage(p => Math.min(totalPages, p + 1));
                                                const el = document.getElementById('vids');
                                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            Next &rarr;
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div className="res-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="res-modal">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="h5 fw-bold m-0 text-success">📁 Share Resource</h3>
                            <button className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
                        </div>

                        <p className="small text-secondary mb-4 p-3 rounded-3 bg-light border">
                            You are adding a resource for <br />
                            <strong className="text-dark">{course}</strong> (Sem {semester})
                        </p>

                        {formError && (
                            <div className="alert alert-danger px-3 py-2 small mb-3 border-0 rounded-3 d-flex align-items-center">
                                <svg className="me-2" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" /></svg>
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleAddResource}>
                            <div className="mb-3">
                                <label className="form-label small text-secondary fw-bold">RESOURCE TITLE</label>
                                <input
                                    name="title"
                                    className="form-control bg-white border-secondary bg-opacity-10 text-dark p-2 px-3"
                                    placeholder="e.g. Master Branch & Bound in 10 mins"
                                    value={form.title}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small text-secondary fw-bold">RESOURCE TYPE</label>
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                                    border: '1px solid #dee2e6', borderRadius: '10px', overflow: 'hidden'
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => { setUploadType('link'); setForm(p => ({ ...p, file: null })); }}
                                        style={{
                                            padding: '10px', border: 'none', cursor: 'pointer', fontWeight: 600,
                                            fontSize: '0.88rem', transition: 'all 0.2s',
                                            background: uploadType === 'link' ? '#48bb78' : '#f8f9fa',
                                            color: uploadType === 'link' ? '#fff' : '#555',
                                        }}
                                    >
                                        🔗 Link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setUploadType('file'); setForm(p => ({ ...p, url: '' })); }}
                                        style={{
                                            padding: '10px', border: 'none', borderLeft: '1px solid #dee2e6',
                                            cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s',
                                            background: uploadType === 'file' ? '#48bb78' : '#f8f9fa',
                                            color: uploadType === 'file' ? '#fff' : '#555',
                                        }}
                                    >
                                        📁 Upload File
                                    </button>
                                </div>
                            </div>

                            {uploadType === 'link' ? (
                                <div className="mb-3">
                                    <label className="form-label small text-secondary fw-bold">LINK</label>
                                    <input
                                        name="url"
                                        className="form-control bg-white border-secondary bg-opacity-10 text-dark p-2 px-3"
                                        placeholder="e.g. https://www.youtube.com/... or https://drive.google.com/..."
                                        value={form.url}
                                        onChange={handleFormChange}
                                    />
                                </div>
                            ) : (
                                <div className="mb-3">
                                    <label className="form-label small text-secondary fw-bold">UPLOAD FILE</label>
                                    <input
                                        type="file"
                                        name="file"
                                        className="form-control bg-white border-secondary bg-opacity-10 text-dark p-2 px-3"
                                        onChange={handleFormChange}
                                    />
                                    <div className="form-text small">Supported: txt, pdf, zip, asm, exe, and more</div>
                                </div>
                            )}
                            <div className="mb-4">
                                <label className="form-label small text-secondary fw-bold">DESCRIPTION (OPTIONAL)</label>
                                <textarea
                                    name="description"
                                    className="form-control bg-white border-secondary bg-opacity-10 text-dark p-2 px-3"
                                    rows="3"
                                    placeholder="What does this resource cover?"
                                    value={form.description}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <button
                                className="btn btn-success btn-lg w-100 fw-bold rounded-3 py-3"
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting ? 'Sharing...' : 'Add to Collection'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}