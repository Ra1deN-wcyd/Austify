import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/api';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// ─────────────────────────────────────────────────────────────────────────────
// Singleton Echo instance — created ONCE per page session.
// NEVER call disconnect() except on full unmount, otherwise Pusher
// tears down the socket and messages stop arriving entirely.
// ─────────────────────────────────────────────────────────────────────────────
let _echo = null;

function getEcho() {
    if (_echo) return _echo;
    const token   = localStorage.getItem('austify_token');
    const key     = import.meta.env.VITE_PUSHER_APP_KEY;
    const authUrl = import.meta.env.VITE_BROADCAST_AUTH_ENDPOINT
                    ?? 'http://127.0.0.1:8100/api/broadcasting/auth';
    if (!token || !key) {
        console.warn('[Echo] Missing token or PUSHER_APP_KEY — realtime disabled.');
        return null;
    }
    _echo = new Echo({
        broadcaster : 'pusher',
        key,
        cluster     : import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'ap2',
        forceTLS    : true,
        authEndpoint: authUrl,
        auth        : { headers: { Authorization: `Bearer ${token}` } },
    });
    console.log('[Echo] Pusher singleton created.');
    return _echo;
}

function destroyEcho() {
    if (_echo) { _echo.disconnect(); _echo = null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const getCurrentUserId = () => parseInt(localStorage.getItem('user_id') ?? '0');

const formatTime = (d) =>
    d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

const formatDate = (d) => {
    if (!d) return '';
    const date  = new Date(d);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString())     return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function Chat() {
    const [conversations, setConversations] = useState([]);
    const [activeConv,    setActiveConv]    = useState(null);
    const [messages,      setMessages]      = useState([]);
    const [newMessage,    setNewMessage]    = useState('');
    const [searchQuery,   setSearchQuery]   = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [typingUser,    setTypingUser]    = useState(null);
    const [loading,       setLoading]       = useState(false);
    const [mobileView,    setMobileView]    = useState('list');

    const messagesEndRef = useRef(null);
    const typingTimeout  = useRef(null);
    const isTypingRef    = useRef(false);
    const activeConvRef  = useRef(null);   // stable ref for use inside event closures

    // Keep ref in sync with state
    useEffect(() => { activeConvRef.current = activeConv; }, [activeConv]);

    // ── Load conversations ──────────────────────────────────────────────────
    const loadConversations = useCallback(async () => {
        try {
            const res = await api.get('/chat/conversations');
            setConversations(res.data.data?.data ?? []);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        loadConversations();
        // Polling fallback: refresh sidebar (unread counts) every 12 s.
        // This ensures badge updates even for conversations not actively subscribed.
        const timer = setInterval(loadConversations, 12_000);
        return () => clearInterval(timer);
    }, [loadConversations]);

    // ── Auto-scroll to latest message ───────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Destroy Echo cleanly when the Chat page is unmounted ────────────────
    useEffect(() => () => destroyEcho(), []);

    // ── Subscribe to Pusher channel for the active conversation ─────────────
    useEffect(() => {
        if (!activeConv) return;
        const echo = getEcho();
        if (!echo) return;

        const ch = echo.private(`conversation.${activeConv.id}`);

        // New message arrived ─────────────────────────────────────────────
        ch.listen('.message.sent', (e) => {
            const msg = e.message || e;
            // Only add if from the other person — sender already added optimistically
            if (parseInt(msg.user_id) !== getCurrentUserId()) {
                setMessages(prev => {
                    if (prev.find(m => m.id === msg.id)) return prev; // dedup
                    return [...prev, msg];
                });
                // Auto-mark as seen
                const convId = activeConvRef.current?.id;
                if (convId) api.post(`/chat/conversations/${convId}/seen`).catch(() => {});
            }
            // Update sidebar snippet
            setConversations(prev =>
                prev.map(c => c.id === activeConvRef.current?.id
                    ? { ...c, last_message: msg }
                    : c
                )
            );
        });

        // Other person read our messages ──────────────────────────────────
        ch.listen('.message.read', (e) => {
            setMessages(prev =>
                prev.map(m =>
                    parseInt(m.user_id) === getCurrentUserId() && !m.read_at
                        ? { ...m, read_at: e.read_at }
                        : m
                )
            );
        });

        // Typing indicator ────────────────────────────────────────────────
        // Backend UserTyping.broadcastWith() sends: { user_id, user_name, is_typing }
        // NOT a nested `user` object — that was the old bug.
        ch.listen('.user.typing', (e) => {
            if (parseInt(e.user_id) !== getCurrentUserId()) {
                setTypingUser(e.is_typing ? e.user_name : null);
            }
        });

        return () => {
            // Only leave THIS channel, never disconnect the whole socket
            echo.leave(`conversation.${activeConv.id}`);
        };
    }, [activeConv]);

    // ── 3-second polling fallback ────────────────────────────────────────────
    // Pusher private channels require /broadcasting/auth to work.
    // Polling guarantees messages always arrive even if Pusher auth fails.
    const lastMsgIdRef = useRef(0);
    useEffect(() => {
        if (!activeConv) return;
        lastMsgIdRef.current = 0; // Reset on conversation switch

        const poll = async () => {
            try {
                const res = await api.get(`/chat/conversations/${activeConv.id}/messages`);
                const fetched = res.data.data?.data ?? [];
                if (fetched.length === 0) return;

                setMessages(prev => {
                    const existingIds = new Set(prev.map(m => m.id));
                    const newMsgs = fetched.filter(m => !existingIds.has(m.id));
                    if (newMsgs.length === 0) return prev;
                    // Merge & sort by created_at
                    return [...prev, ...newMsgs].sort(
                        (a, b) => new Date(a.created_at) - new Date(b.created_at)
                    );
                });

                // Update sidebar last_message snippet
                const latest = fetched[fetched.length - 1];
                setConversations(prev =>
                    prev.map(c => c.id === activeConv.id
                        ? { ...c, last_message: latest, unread_count: 0 }
                        : c
                    )
                );
            } catch (e) {
                // Silently ignore poll errors
            }
        };

        const timer = setInterval(poll, 3000);
        return () => clearInterval(timer);
    }, [activeConv]);

    // ── Open a conversation ─────────────────────────────────────────────────
    const openConversation = async (conv) => {
        if (activeConv?.id === conv.id) { setMobileView('chat'); return; }
        setActiveConv(conv);
        setMobileView('chat');
        setMessages([]);
        setTypingUser(null);
        setLoading(true);
        try {
            const res = await api.get(`/chat/conversations/${conv.id}/messages`);
            setMessages(res.data.data?.data ?? []);
            await api.post(`/chat/conversations/${conv.id}/seen`);
            setConversations(prev =>
                prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c)
            );
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // ── Send message ────────────────────────────────────────────────────────
    const sendMessage = async () => {
        if (!newMessage.trim() || !activeConv) return;
        const body = newMessage.trim();
        setNewMessage('');
        // Stop typing signal immediately
        if (isTypingRef.current) {
            isTypingRef.current = false;
            clearTimeout(typingTimeout.current);
            api.post('/chat/typing', { conversation_id: activeConv.id, is_typing: false }).catch(() => {});
        }
        try {
            const res = await api.post('/chat/messages', { conversation_id: activeConv.id, body });
            const sent = res.data.data;
            setMessages(prev => [...prev, sent]);
            setConversations(prev =>
                prev.map(c => c.id === activeConv.id ? { ...c, last_message: sent } : c)
            );
        } catch (e) {
            console.error(e);
        }
    };

    // ── Typing indicator ────────────────────────────────────────────────────
    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (!activeConv) return;
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            api.post('/chat/typing', { conversation_id: activeConv.id, is_typing: true }).catch(() => {});
        }
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            if (isTypingRef.current) {
                isTypingRef.current = false;
                api.post('/chat/typing', { conversation_id: activeConv.id, is_typing: false }).catch(() => {});
            }
        }, 2000);
    };

    // ── Search users ────────────────────────────────────────────────────────
    const searchUsers = useCallback(async (q) => {
        setSearchQuery(q);
        if (!q.trim()) { setSearchResults([]); return; }
        try {
            const res = await api.post('/accounts/search-users', { name: q });
            setSearchResults(res.data.data ?? []);
        } catch (e) { console.error(e); }
    }, []);

    const startChat = async (userId) => {
        try {
            const res = await api.post('/chat/conversations/start', { user_id: userId });
            const conv = res.data.data;
            setSearchQuery('');
            setSearchResults([]);
            setConversations(prev =>
                prev.find(c => c.id === conv.id) ? prev : [conv, ...prev]
            );
            openConversation(conv);
        } catch (e) { console.error(e); }
    };

    const getOtherUser = (conv) =>
        conv.users?.find(u => parseInt(u.id) !== getCurrentUserId());

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
        <style>{`
            .chat-layout {
                display: flex;
                height: calc(100vh - 56px);
                overflow: hidden;
                font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            }
            /* ── Sidebar ── */
            .chat-sidebar {
                width: 340px; min-width: 280px;
                background: #fff;
                border-right: 1px solid #e0e0e0;
                display: flex; flex-direction: column; flex-shrink: 0;
            }
            .chat-sidebar-header {
                padding: 14px 16px;
                background: #075e54;
                color: #fff;
            }
            .chat-sidebar-header h5 { margin: 0 0 10px; font-size: 18px; font-weight: 700; }
            .chat-search {
                background: #fff;
                border: none;
                border-radius: 8px;
                padding: 7px 14px;
                font-size: 13px;
                width: 100%;
                outline: none;
            }
            .chat-search::placeholder { color: #aaa; }
            /* ── Conv item ── */
            .conv-item {
                padding: 12px 16px;
                cursor: pointer;
                display: flex; align-items: center; gap: 12px;
                border-bottom: 1px solid #f5f5f5;
                transition: background 0.12s;
            }
            .conv-item:hover { background: #f5f5f5; }
            .conv-item.active { background: #f0fdf4; border-left: 3px solid #25d366; }
            /* ── Chat Window ── */
            .chat-window {
                flex: 1; display: flex; flex-direction: column; min-width: 0;
            }
            .chat-window-header {
                padding: 10px 20px;
                background: #075e54;
                display: flex; align-items: center; gap: 12px; flex-shrink: 0;
            }
            .chat-back-btn {
                display: none; background: none; border: none;
                color: #fff; font-size: 22px; cursor: pointer; padding: 0 8px 0 0;
            }
            /* ── Messages area ── */
            .chat-messages {
                flex: 1; overflow-y: auto;
                padding: 16px 20px;
                display: flex; flex-direction: column; gap: 3px;
                background-color: #e5ddd5;
                background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c8bdb5' fill-opacity='0.15' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z'/%3E%3C/g%3E%3C/svg%3E");
            }
            /* ── Date badge ── */
            .date-badge {
                text-align: center; margin: 8px 0;
            }
            .date-badge span {
                background: rgba(255,255,255,0.85);
                color: #666; font-size: 11px; padding: 3px 10px;
                border-radius: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            /* ── Bubble ── */
            .bubble-mine {
                background: #dcf8c6;
                border-radius: 12px 12px 2px 12px;
            }
            .bubble-other {
                background: #fff;
                border-radius: 12px 12px 12px 2px;
            }
            /* ── Typing dots ── */
            .typing-dots { display: inline-flex; gap: 3px; align-items: center; }
            .typing-dots span {
                width: 5px; height: 5px; border-radius: 50%;
                background: #a8d5a2; display: inline-block;
                animation: tBounce 1.2s ease-in-out infinite;
            }
            .typing-dots span:nth-child(2) { animation-delay: .2s; }
            .typing-dots span:nth-child(3) { animation-delay: .4s; }
            @keyframes tBounce {
                0%,60%,100% { transform: translateY(0); opacity: .5; }
                30%         { transform: translateY(-5px); opacity: 1; }
            }
            /* ── Input bar ── */
            .chat-input-bar {
                padding: 10px 16px;
                background: #f0f2f5;
                border-top: 1px solid #e0e0e0;
                display: flex; gap: 10px; align-items: center; flex-shrink: 0;
            }
            .chat-input {
                flex: 1; border: none; border-radius: 24px;
                padding: 10px 18px; font-size: 14px;
                background: #fff; outline: none;
                box-shadow: 0 1px 3px rgba(0,0,0,0.07);
            }
            .chat-send-btn {
                width: 46px; height: 46px; border-radius: 50%; border: none;
                background: #25d366; color: #fff; font-size: 18px;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; flex-shrink: 0;
                transition: background 0.15s, transform 0.1s;
            }
            .chat-send-btn:hover:not(:disabled) { background: #1db855; transform: scale(1.05); }
            .chat-send-btn:disabled { background: #ccc; cursor: default; }
            /* ── Mobile ── */
            @media (max-width: 767px) {
                .chat-sidebar  { width: 100%; min-width: unset; border-right: none; }
                .chat-window   { width: 100%; }
                .chat-sidebar.mobile-hidden  { display: none; }
                .chat-window.mobile-hidden   { display: none; }
                .chat-back-btn { display: inline-block; }
            }
        `}</style>

        <div className="chat-layout">

            {/* ═══════════════════ SIDEBAR ═══════════════════ */}
            <div className={`chat-sidebar${mobileView === 'chat' ? ' mobile-hidden' : ''}`}>
                <div className="chat-sidebar-header">
                    <h5>💬 Messages</h5>
                    <div style={{ position: 'relative' }}>
                        <input
                            className="chat-search"
                            placeholder="Search users to chat..."
                            value={searchQuery}
                            onChange={e => searchUsers(e.target.value)}
                        />
                        {searchResults.length > 0 && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
                                background: '#fff', border: '1px solid #ddd', borderRadius: 8,
                                maxHeight: 200, overflowY: 'auto',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.15)', marginTop: 4
                            }}>
                                {searchResults.map(u => (
                                    <div key={u.id} onClick={() => startChat(u.id)} style={{
                                        padding: '10px 14px', cursor: 'pointer',
                                        borderBottom: '1px solid #f5f5f5',
                                        display: 'flex', alignItems: 'center', gap: 10
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                    >
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                            background: 'linear-gradient(135deg,#25d366,#075e54)',
                                            color: '#fff', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontWeight: 700, fontSize: 14
                                        }}>{u.name[0].toUpperCase()}</div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{u.name}</div>
                                            <div style={{ fontSize: 12, color: '#888' }}>{u.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {conversations.length === 0 && (
                        <div style={{ padding: '40px 16px', textAlign: 'center', color: '#aaa', fontSize: 14 }}>
                            No conversations yet.<br />Search for a user to start chatting!
                        </div>
                    )}
                    {conversations.map(conv => {
                        const other    = getOtherUser(conv);
                        const isActive = activeConv?.id === conv.id;
                        return (
                            <div key={conv.id}
                                className={`conv-item${isActive ? ' active' : ''}`}
                                onClick={() => openConversation(conv)}
                            >
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                                    background: 'linear-gradient(135deg,#25d366,#075e54)',
                                    color: '#fff', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontWeight: 700, fontSize: 19
                                }}>{other?.name?.[0]?.toUpperCase() ?? '?'}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>
                                            {other?.name ?? 'Unknown'}
                                        </span>
                                        <span style={{ fontSize: 11, color: '#aaa', flexShrink: 0, marginLeft: 6 }}>
                                            {conv.last_message?.created_at ? formatTime(conv.last_message.created_at) : ''}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                                        <div style={{
                                            fontSize: 12, color: '#888', flex: 1,
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                        }}>
                                            {conv.last_message?.body ?? 'No messages yet'}
                                        </div>
                                        {(conv.unread_count > 0 && !isActive) && (
                                            <span style={{
                                                background: '#25d366', color: '#fff',
                                                borderRadius: 10, minWidth: 20, height: 20,
                                                fontSize: 11, display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontWeight: 700,
                                                marginLeft: 6, flexShrink: 0, padding: '0 5px'
                                            }}>{conv.unread_count}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ═══════════════════ CHAT WINDOW ═══════════════════ */}
            <div className={`chat-window${mobileView === 'list' ? ' mobile-hidden' : ''}`}>
                {!activeConv ? (
                    <div style={{
                        flex: 1, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        background: '#f0f2f5', color: '#888'
                    }}>
                        <div style={{ fontSize: 72, marginBottom: 16 }}>💬</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#444' }}>Austify Chat</div>
                        <div style={{ fontSize: 14, marginTop: 8, color: '#aaa' }}>
                            Select a conversation or search for a user
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ── Header ── */}
                        <div className="chat-window-header">
                            <button className="chat-back-btn"
                                onClick={() => setMobileView('list')}
                                aria-label="Back to conversations">←</button>
                            <div style={{
                                width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg,#25d366,#128c7e)',
                                color: '#fff', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontWeight: 700, fontSize: 17
                            }}>{getOtherUser(activeConv)?.name?.[0]?.toUpperCase() ?? '?'}</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>
                                    {getOtherUser(activeConv)?.name ?? 'Unknown'}
                                </div>
                                <div style={{ fontSize: 12, color: '#a8d5a2', minHeight: 16, display: 'flex', alignItems: 'center', gap: 5 }}>
                                    {typingUser ? (
                                        <>
                                            <span>typing</span>
                                            <span className="typing-dots">
                                                <span /><span /><span />
                                            </span>
                                        </>
                                    ) : 'online'}
                                </div>
                            </div>
                        </div>

                        {/* ── Messages ── */}
                        <div className="chat-messages">
                            {loading && (
                                <div style={{ textAlign: 'center', color: '#888', padding: 20 }}>
                                    Loading messages…
                                </div>
                            )}

                            {(() => {
                                // Group messages by date for date badges
                                const items = [];
                                let lastDate = null;
                                messages.forEach((msg, i) => {
                                    const d = formatDate(msg.created_at);
                                    if (d !== lastDate) {
                                        items.push(<div key={`d-${i}`} className="date-badge"><span>{d}</span></div>);
                                        lastDate = d;
                                    }
                                    const isMine = parseInt(msg.user_id) === getCurrentUserId();
                                    const isRead = !!msg.read_at;
                                    items.push(
                                        <div key={msg.id ?? i} style={{
                                            display: 'flex',
                                            justifyContent: isMine ? 'flex-end' : 'flex-start',
                                            marginBottom: 1
                                        }}>
                                            <div className={isMine ? 'bubble-mine' : 'bubble-other'} style={{
                                                maxWidth: '70%',
                                                padding: '8px 12px 6px',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                fontSize: 14, lineHeight: 1.45, color: '#111',
                                                wordBreak: 'break-word'
                                            }}>
                                                <div>{msg.body}</div>
                                                <div style={{
                                                    fontSize: 11, marginTop: 3, color: '#888',
                                                    display: 'flex', alignItems: 'center',
                                                    justifyContent: 'flex-end', gap: 3
                                                }}>
                                                    {formatTime(msg.created_at)}
                                                    {isMine && (
                                                        <span
                                                            title={isRead ? 'Seen' : 'Sent'}
                                                            style={{
                                                                color: isRead ? '#4fc3f7' : '#aaa',
                                                                fontWeight: 700, fontSize: 13, lineHeight: 1
                                                            }}
                                                        >{isRead ? '✓✓' : '✓'}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                });
                                return items;
                            })()}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* ── Input Bar ── */}
                        <div className="chat-input-bar">
                            <input
                                className="chat-input"
                                placeholder="Type a message…"
                                value={newMessage}
                                onChange={handleTyping}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            />
                            <button
                                className="chat-send-btn"
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                                aria-label="Send message"
                            >➤</button>
                        </div>
                    </>
                )}
            </div>
        </div>
        </>
    );
}