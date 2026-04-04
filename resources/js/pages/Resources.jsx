import React, { useState, useEffect } from 'react';
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

function getEmbedUrl(url) {
    if (!url) return '';
    try {
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2] && match[2].length === 11
            ? 'https://www.youtube.com/embed/' + match[2]
            : url;
    } catch {
        return url;
    }
}

export default function Resources() {
    const [semester, setSemester] = useState(null);
    const [course, setCourse] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', url: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (semester && course) {
            loadVideos(semester, course);
        }
    }, [semester, course]);

    async function loadVideos(sem, crs) {
        setLoading(true);
        setVideos([]);
        setFetchError(null);
        setActiveVideo(null);
        try {
            const res = await api.get('/api/videos', {
                params: { semester: sem, course: crs }
            });
            setVideos(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to load videos:', err);
            setFetchError('Could not load videos. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    function handleSemesterClick(s) {
        setSemester(s);
        setCourse(null);
        setVideos([]);
        setActiveVideo(null);
        setFetchError(null);
    }

    function handleCourseClick(c) {
        setCourse(c);
        setActiveVideo(null);
        setFetchError(null);
    }

    function handleFormChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setFormError('');
    }

    async function handleAddVideo(e) {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);
        try {
            const res = await api.post('/api/videos', {
                title: form.title,
                url: form.url,
                description: form.description,
                semester: semester,
                course: course,
            });
            const newVideo = res.data;
            setVideos(prev => [newVideo, ...prev]);
            setForm({ title: '', url: '', description: '' });
            setShowModal(false);
        } catch (err) {
            console.error('Add video error:', err);
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to add video. Check the URL and try again.';
            setFormError(msg);
        } finally {
            setSubmitting(false);
        }
    }

    function openModal() {
        setForm({ title: '', url: '', description: '' });
        setFormError('');
        setShowModal(true);
    }

    return (
        <>
            <style>{`
                .res-semester-btn {
                    background: transparent;
                    border: 1px solid #343a40;
                    color: #adb5bd;
                    border-radius: 8px;
                    padding: 9px 0;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                    width: 100%;
                    cursor: pointer;
                }
                .res-semester-btn:hover {
                    border-color: #198754;
                    color: #198754;
                    background: rgba(25, 135, 84, 0.07);
                }
                .res-semester-btn.res-active {
                    background: #198754;
                    border-color: #198754;
                    color: #fff;
                    box-shadow: 0 2px 12px rgba(25,135,84,0.3);
                }

                .res-course-card {
                    background: #212529;
                    border: 1px solid #343a40;
                    border-radius: 10px;
                    padding: 20px 14px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #ced4da;
                    font-weight: 500;
                    font-size: 0.95rem;
                    min-height: 72px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    user-select: none;
                }
                .res-course-card:hover {
                    border-color: #198754;
                    color: #fff;
                    background: rgba(25, 135, 84, 0.1);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 14px rgba(25,135,84,0.15);
                }
                .res-course-card.res-active {
                    border-color: #198754;
                    background: rgba(25, 135, 84, 0.18);
                    color: #fff;
                    box-shadow: 0 0 0 1px #198754 inset;
                }

                .res-video-card {
                    background: #212529;
                    border: 1px solid #343a40;
                    border-radius: 12px;
                    overflow: hidden;
                    transition: all 0.2s;
                    cursor: pointer;
                    height: 100%;
                }
                .res-video-card:hover {
                    border-color: #198754;
                    box-shadow: 0 4px 18px rgba(25,135,84,0.18);
                    transform: translateY(-2px);
                }
                .res-video-card.res-playing {
                    border-color: #198754;
                    box-shadow: 0 0 0 2px #198754;
                    cursor: default;
                }

                .res-thumb-wrap {
                    position: relative;
                    width: 100%;
                    padding-top: 56.25%;
                    background: #111;
                    overflow: hidden;
                }
                .res-thumb-wrap iframe {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                .res-play-icon {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.38);
                    transition: opacity 0.2s;
                    pointer-events: none;
                }
                .res-video-card:hover .res-play-icon { opacity: 0; }

                .res-video-body {
                    padding: 14px 16px 16px;
                }
                .res-video-title {
                    color: #f8f9fa;
                    font-weight: 600;
                    font-size: 0.97rem;
                    margin-bottom: 4px;
                    line-height: 1.4;
                }
                .res-video-meta {
                    color: #6c757d;
                    font-size: 0.8rem;
                }
                .res-video-desc {
                    color: #adb5bd;
                    font-size: 0.85rem;
                    margin-top: 7px;
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .res-label {
                    color: #f8f9fa;
                    font-weight: 700;
                    font-size: 1.05rem;
                    margin-bottom: 14px;
                }
                .res-divider {
                    border: none;
                    border-top: 1px solid #343a40;
                    margin: 30px 0;
                }
                .res-breadcrumb {
                    color: #6c757d;
                    font-size: 0.85rem;
                }
                .res-breadcrumb .active { color: #198754; font-weight: 600; }

                /* Spinner */
                .res-spin {
                    width: 40px; height: 40px;
                    border: 3px solid #343a40;
                    border-top-color: #198754;
                    border-radius: 50%;
                    animation: resSpin 0.75s linear infinite;
                    margin: 48px auto;
                }
                @keyframes resSpin { to { transform: rotate(360deg); } }

                /* Modal */
                .res-backdrop {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,0.72);
                    z-index: 1055;
                    display: flex; align-items: center; justify-content: center;
                    padding: 16px;
                }
                .res-modal {
                    background: #212529;
                    border: 1px solid #343a40;
                    border-radius: 14px;
                    width: 100%; max-width: 520px;
                    padding: 28px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                    animation: resModalIn 0.18s ease;
                }
                @keyframes resModalIn {
                    from { opacity:0; transform: scale(0.95) translateY(-8px); }
                    to   { opacity:1; transform: scale(1) translateY(0); }
                }
                .res-modal .form-control, .res-modal textarea {
                    background: #111316;
                    border-color: #343a40;
                    color: #f8f9fa;
                    border-radius: 8px;
                }
                .res-modal .form-control:focus, .res-modal textarea:focus {
                    background: #111316;
                    border-color: #198754;
                    color: #f8f9fa;
                    box-shadow: 0 0 0 2px rgba(25,135,84,0.22);
                }
                .res-modal label { color: #adb5bd; font-size: 0.87rem; font-weight: 500; }
                .res-modal textarea { resize: vertical; min-height: 84px; }
                ::placeholder { color: #6c757d !important; }
            `}</style>

            {/* Hero Header */}
            <section className="bg-dark text-white text-center py-5" style={{ borderBottom: '1px solid #343a40' }}>
                <div className="container">
                    <h1 className="display-6 fw-bold text-success mb-2">📂 Academic Resources</h1>
                    <p className="lead mb-0" style={{ color: '#adb5bd' }}>
                        Browse lecture videos shared by AUST CSE students — organized by semester &amp; course.
                    </p>
                </div>
            </section>

            <div className="bg-dark" style={{ minHeight: 'calc(100vh - 200px)' }}>
                <div className="container py-5">

                    {/* ── Semester Buttons ── */}
                    <p className="res-label">Select a Semester</p>
                    <div className="row g-2 mb-2">
                        {semesters.map(s => (
                            <div className="col-6 col-sm-3" key={s}>
                                <button
                                    className={'res-semester-btn' + (semester === s ? ' res-active' : '')}
                                    onClick={() => handleSemesterClick(s)}
                                >
                                    Semester {s}
                                </button>
                            </div>
                        ))}
                    </div>

                    <hr className="res-divider" />

                    {/* ── No semester selected ── */}
                    {!semester && (
                        <div className="text-center py-5">
                            <div style={{ fontSize: '2.8rem' }}>🎓</div>
                            <p className="mt-3" style={{ color: '#6c757d' }}>Select a semester above to browse courses.</p>
                        </div>
                    )}

                    {/* ── Courses Grid ── */}
                    {semester && (
                        <>
                            <p className="res-label">
                                Semester {semester} — Courses
                                {course && <span className="text-success fw-normal" style={{ fontSize: '0.95rem' }}> › {course}</span>}
                            </p>
                            <div className="row g-3 mb-2">
                                {(courseMap[semester] || []).map(c => (
                                    <div className="col-12 col-sm-6 col-md-4" key={c}>
                                        <div
                                            className={'res-course-card' + (course === c ? ' res-active' : '')}
                                            onClick={() => handleCourseClick(c)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={e => e.key === 'Enter' && handleCourseClick(c)}
                                        >
                                            {c}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr className="res-divider" />

                            {/* ── No course selected ── */}
                            {!course && (
                                <div className="text-center py-5">
                                    <div style={{ fontSize: '2.4rem' }}>👆</div>
                                    <p className="mt-3" style={{ color: '#6c757d' }}>Select a course above to view its videos.</p>
                                </div>
                            )}

                            {/* ── Video Area ── */}
                            {course && (
                                <>
                                    {/* Toolbar */}
                                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
                                        <div className="res-breadcrumb">
                                            Resources › Sem {semester} › <span className="active">{course}</span>
                                        </div>
                                        <button className="btn btn-success btn-sm px-4" onClick={openModal}>
                                            + Add Video
                                        </button>
                                    </div>

                                    {/* Loading */}
                                    {loading && <div className="res-spin" />}

                                    {/* Error state */}
                                    {!loading && fetchError && (
                                        <div className="text-center py-5">
                                            <div style={{ fontSize: '2rem' }}>⚠️</div>
                                            <p className="mt-3" style={{ color: '#dc3545' }}>{fetchError}</p>
                                            <button
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => loadVideos(semester, course)}
                                            >Retry</button>
                                        </div>
                                    )}

                                    {/* Empty state */}
                                    {!loading && !fetchError && videos.length === 0 && (
                                        <div className="text-center py-5">
                                            <div style={{ fontSize: '2.8rem' }}>📭</div>
                                            <p className="mt-3" style={{ color: '#6c757d' }}>
                                                No videos yet for <strong className="text-light">{course}</strong>.
                                            </p>
                                            <button className="btn btn-success btn-sm px-4 mt-1" onClick={openModal}>
                                                + Be the First to Add One
                                            </button>
                                        </div>
                                    )}

                                    {/* Videos */}
                                    {!loading && !fetchError && videos.length > 0 && (
                                        <div className="row g-4">
                                            {videos.map(video => {
                                                const isPlaying = activeVideo === video.id;
                                                const embedSrc = getEmbedUrl(video.url || '');
                                                return (
                                                    <div className="col-12 col-md-6 col-lg-4" key={video.id}>
                                                        <div
                                                            className={'res-video-card' + (isPlaying ? ' res-playing' : '')}
                                                            onClick={() => !isPlaying && setActiveVideo(video.id)}
                                                        >
                                                            <div className="res-thumb-wrap">
                                                                <iframe
                                                                    src={isPlaying ? embedSrc + '?autoplay=1&rel=0' : embedSrc + '?rel=0'}
                                                                    title={video.title || 'Video'}
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                    loading="lazy"
                                                                    style={isPlaying ? {} : { pointerEvents: 'none' }}
                                                                />
                                                                {!isPlaying && (
                                                                    <div className="res-play-icon">
                                                                        <svg width="54" height="54" viewBox="0 0 54 54">
                                                                            <circle cx="27" cy="27" r="27" fill="rgba(25,135,84,0.85)" />
                                                                            <polygon points="22,17 41,27 22,37" fill="white" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="res-video-body">
                                                                <div className="res-video-title">{video.title || 'Untitled Video'}</div>
                                                                <div className="res-video-meta">
                                                                    📚 {video.course} &nbsp;·&nbsp; Semester {video.semester}
                                                                </div>
                                                                {video.description ? (
                                                                    <div className="res-video-desc">{video.description}</div>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Add Video Modal ── */}
            {showModal && (
                <div
                    className="res-backdrop"
                    onClick={e => e.target === e.currentTarget && setShowModal(false)}
                >
                    <div className="res-modal">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5 className="text-white fw-bold mb-1">📹 Add New Video</h5>
                                <small style={{ color: '#6c757d' }}>
                                    Sem <span className="text-success fw-semibold">{semester}</span>
                                    &nbsp;›&nbsp;
                                    <span className="text-success fw-semibold">{course}</span>
                                </small>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                style={{ background: 'none', border: 'none', color: '#6c757d', fontSize: '1.5rem', lineHeight: 1, cursor: 'pointer', padding: 0, marginTop: '-2px' }}
                            >&times;</button>
                        </div>

                        <hr style={{ borderColor: '#343a40', margin: '12px 0 20px' }} />

                        {formError && (
                            <div className="mb-3 py-2 px-3" style={{
                                background: 'rgba(220,53,69,0.12)',
                                border: '1px solid rgba(220,53,69,0.3)',
                                color: '#ea868f',
                                borderRadius: '8px',
                                fontSize: '0.87rem'
                            }}>
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleAddVideo} noValidate>
                            <div className="mb-3">
                                <label className="d-block mb-1">Video Title <span style={{ color: '#dc3545' }}>*</span></label>
                                <input
                                    type="text"
                                    name="title"
                                    className="form-control"
                                    placeholder="e.g. Lecture 1: Introduction to Algorithms"
                                    value={form.title}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="d-block mb-1">YouTube URL <span style={{ color: '#dc3545' }}>*</span></label>
                                <input
                                    type="url"
                                    name="url"
                                    className="form-control"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={form.url}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="d-block mb-1">Description <span style={{ color: '#495057' }}>(optional)</span></label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    placeholder="Brief summary of the video content..."
                                    value={form.description}
                                    onChange={handleFormChange}
                                />
                            </div>

                            <div className="d-flex gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-success flex-grow-1"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</>
                                        : 'Save Video'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}