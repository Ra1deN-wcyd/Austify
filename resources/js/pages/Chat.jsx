import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/api';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Setup Laravel Echo
window.Pusher = Pusher;
const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'ap2',
    forceTLS: true,
    authEndpoint: 'http://127.0.0.1:8000/broadcasting/auth',
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('austify_token')}`,
        },
    },
});

export default function Chat() {
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const typingTimeout = useRef(null);
    const channelRef = useRef(null);

    // ── Always read fresh from localStorage to avoid NaN ─────────────────────
    const getCurrentUserId = () => parseInt(localStorage.getItem('user_id') ?? '0');

    // ── Fetch conversations on mount ──────────────────────────────────────────
    useEffect(() => {
        api.get('/chat/conversations')
            .then(res => setConversations(res.data.data?.data ?? []))
            .catch(console.error);
    }, []);

    // ── Scroll to bottom whenever messages change ─────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Subscribe to Pusher channel for active conversation ───────────────────
    useEffect(() => {
        if (!activeConv) return;

        // Leave previous channel
        if (channelRef.current) {
            echo.leave(`conversation.${channelRef.current}`);
        }
        channelRef.current = activeConv.id;

        const channel = echo.private(`conversation.${activeConv.id}`);

        channel.listen('.message.sent', (e) => {
            if (parseInt(e.message.user_id) !== getCurrentUserId()) {
                setMessages(prev => [...prev, e.message]);
                // Mark as seen immediately
                api.post(`/chat/conversations/${activeConv.id}/seen`).catch(() => { });
            }
        });

        channel.listen('.message.read', () => {
            setMessages(prev =>
                prev.map(m =>
                    parseInt(m.user_id) === getCurrentUserId()
                        ? { ...m, read_at: new Date().toISOString() }
                        : m
                )
            );
        });

        channel.listen('.user.typing', (e) => {
            if (parseInt(e.user.id) !== getCurrentUserId()) {
                setTypingUser(e.is_typing ? e.user.name : null);
            }
        });

        return () => {
            echo.leave(`conversation.${activeConv.id}`);
            channelRef.current = null;
        };
    }, [activeConv]);

    // ── Open a conversation ───────────────────────────────────────────────────
    const openConversation = async (conv) => {
        setActiveConv(conv);
        setLoading(true);
        try {
            const res = await api.get(`/chat/conversations/${conv.id}/messages`);
            setMessages(res.data.data?.data ?? []);
            await api.post(`/chat/conversations/${conv.id}/seen`);
            // Clear unread badge
            setConversations(prev =>
                prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c)
            );
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // ── Send message ──────────────────────────────────────────────────────────
    const sendMessage = async () => {
        if (!newMessage.trim() || !activeConv) return;
        const body = newMessage.trim();
        setNewMessage('');
        try {
            const res = await api.post('/chat/messages', {
                conversation_id: activeConv.id,
                body,
            });
            setMessages(prev => [...prev, res.data.data]);
        } catch (e) {
            console.error(e);
        }
    };

    // ── Typing indicator ──────────────────────────────────────────────────────
    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (!activeConv) return;

        if (!isTyping) {
            setIsTyping(true);
            api.post('/chat/typing', { conversation_id: activeConv.id, is_typing: true }).catch(() => { });
        }
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            setIsTyping(false);
            api.post('/chat/typing', { conversation_id: activeConv.id, is_typing: false }).catch(() => { });
        }, 2000);
    };

    // ── Search users to start new chat ────────────────────────────────────────
    const searchUsers = useCallback(async (q) => {
        setSearchQuery(q);
        if (!q.trim()) { setSearchResults([]); return; }
        try {
            const res = await api.post('/accounts/search-users', { name: q });
            setSearchResults(res.data.data ?? []);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const startChat = async (userId) => {
        try {
            const res = await api.post('/chat/conversations/start', { user_id: userId });
            const conv = res.data.data;
            setSearchQuery('');
            setSearchResults([]);
            // Add to list if not already there
            setConversations(prev =>
                prev.find(c => c.id === conv.id) ? prev : [conv, ...prev]
            );
            openConversation(conv);
        } catch (e) {
            console.error(e);
        }
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getOtherUser = (conv) =>
        conv.users?.find(u => parseInt(u.id) !== getCurrentUserId());

    const formatTime = (dateStr) =>
        new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 56px)', background: '#f0f2f5' }}>

            {/* ── Sidebar ── */}
            <div style={{
                width: '320px', background: '#fff', borderRight: '1px solid #e0e0e0',
                display: 'flex', flexDirection: 'column'
            }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
                    <h5 className="mb-2 fw-bold text-success">💬 Messages</h5>
                    <input
                        className="form-control form-control-sm"
                        placeholder="Search users to chat..."
                        value={searchQuery}
                        onChange={e => searchUsers(e.target.value)}
                    />
                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div style={{
                            background: '#fff', border: '1px solid #ddd', borderRadius: '8px',
                            marginTop: '4px', maxHeight: '180px', overflowY: 'auto',
                            position: 'absolute', zIndex: 100, width: '280px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            {searchResults.map(u => (
                                <div key={u.id}
                                    onClick={() => startChat(u.id)}
                                    style={{
                                        padding: '10px 14px', cursor: 'pointer',
                                        borderBottom: '1px solid #f0f0f0',
                                        display: 'flex', alignItems: 'center', gap: '10px'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                >
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: '#48bb78', color: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '14px'
                                    }}>
                                        {u.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{u.name}</div>
                                        <div style={{ fontSize: '12px', color: '#888' }}>{u.email}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Conversation List */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {conversations.length === 0 && (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
                            No conversations yet.<br />Search for a user to start chatting!
                        </div>
                    )}
                    {conversations.map(conv => {
                        const other = getOtherUser(conv);
                        const isActive = activeConv?.id === conv.id;
                        return (
                            <div key={conv.id}
                                onClick={() => openConversation(conv)}
                                style={{
                                    padding: '12px 16px', cursor: 'pointer',
                                    background: isActive ? '#f0fff4' : '#fff',
                                    borderLeft: isActive ? '3px solid #48bb78' : '3px solid transparent',
                                    borderBottom: '1px solid #f0f0f0',
                                    display: 'flex', alignItems: 'center', gap: '12px'
                                }}
                            >
                                <div style={{
                                    width: 42, height: 42, borderRadius: '50%',
                                    background: '#48bb78', color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', fontSize: '16px', flexShrink: 0
                                }}>
                                    {other?.name?.[0]?.toUpperCase() ?? '?'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{other?.name ?? 'Unknown'}</span>
                                        {conv.unread_count > 0 && (
                                            <span style={{
                                                background: '#48bb78', color: '#fff',
                                                borderRadius: '50%', width: 20, height: 20,
                                                fontSize: '11px', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                            }}>
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '12px', color: '#888',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                    }}>
                                        {conv.last_message?.body ?? 'No messages yet'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Chat Window ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {!activeConv ? (
                    <div style={{
                        flex: 1, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', color: '#aaa'
                    }}>
                        <div style={{ fontSize: '48px' }}>💬</div>
                        <div style={{ fontSize: '18px', marginTop: '12px' }}>Select a conversation to start chatting</div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div style={{
                            padding: '14px 20px', background: '#fff',
                            borderBottom: '1px solid #e0e0e0',
                            display: 'flex', alignItems: 'center', gap: '12px'
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: '#48bb78', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: '16px'
                            }}>
                                {getOtherUser(activeConv)?.name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '15px' }}>
                                    {getOtherUser(activeConv)?.name ?? 'Unknown'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#48bb78' }}>
                                    {typingUser ? `${typingUser} is typing...` : 'Active'}
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{
                            flex: 1, overflowY: 'auto', padding: '20px',
                            display: 'flex', flexDirection: 'column', gap: '8px'
                        }}>
                            {loading && (
                                <div style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>
                                    Loading messages...
                                </div>
                            )}
                            {messages.map((msg, i) => {
                                // ✅ Fresh read on every render — fixes NaN bug
                                const isMine = parseInt(msg.user_id) === getCurrentUserId();
                                return (
                                    <div key={msg.id ?? i} style={{
                                        display: 'flex',
                                        justifyContent: isMine ? 'flex-end' : 'flex-start'
                                    }}>
                                        <div style={{
                                            maxWidth: '65%',
                                            background: isMine ? '#48bb78' : '#fff',
                                            color: isMine ? '#fff' : '#222',
                                            borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            padding: '10px 14px',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                            fontSize: '14px'
                                        }}>
                                            <div>{msg.body}</div>
                                            <div style={{
                                                fontSize: '10px', marginTop: '4px',
                                                opacity: 0.7, textAlign: 'right',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'flex-end', gap: '4px'
                                            }}>
                                                {formatTime(msg.created_at)}
                                                {isMine && (
                                                    <span title={msg.read_at ? 'Seen' : 'Sent'}>
                                                        {msg.read_at ? ' ✓✓' : ' ✓'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{
                            padding: '14px 20px', background: '#fff',
                            borderTop: '1px solid #e0e0e0',
                            display: 'flex', gap: '10px', alignItems: 'center'
                        }}>
                            <input
                                className="form-control"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={handleTyping}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                style={{ borderRadius: '24px', paddingLeft: '16px' }}
                            />
                            <button
                                className="btn btn-success"
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                                style={{ borderRadius: '50%', width: 42, height: 42, padding: 0, flexShrink: 0 }}
                            >
                                ➤
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}