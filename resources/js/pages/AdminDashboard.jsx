import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const timeoutOptions = [
    { label: '2 Days', value: '2_days' },
    { label: '7 Days', value: '7_days' },
    { label: '1 Month', value: '1_month' },
    { label: '3 Months', value: '3_months' },
];

function AdminDashboard() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busyUserId, setBusyUserId] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState({});

    const isAdmin = useMemo(() => user?.role === 'admin', [user]);

    useEffect(() => {
        if (isAdmin) {
            loadUsers();
        }
    }, [isAdmin]);

    const loadUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    const handleTimeout = async (targetUserId) => {
        const duration = selectedDuration[targetUserId] || '2_days';
        await runAction(targetUserId, async () => {
            await api.post(`/admin/users/${targetUserId}/timeout`, { duration });
        });
    };

    const handleUntimeout = async (targetUserId) => {
        await runAction(targetUserId, async () => {
            await api.post(`/admin/users/${targetUserId}/untimeout`);
        });
    };

    const handleBan = async (targetUserId) => {
        await runAction(targetUserId, async () => {
            await api.post(`/admin/users/${targetUserId}/ban`);
        });
    };

    const handleUnban = async (targetUserId) => {
        await runAction(targetUserId, async () => {
            await api.post(`/admin/users/${targetUserId}/unban`);
        });
    };

    const runAction = async (targetUserId, action) => {
        setBusyUserId(targetUserId);
        setError('');
        try {
            await action();
            await loadUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed.');
        } finally {
            setBusyUserId(null);
        }
    };

    const isTimedOut = (userRow) => {
        if (!userRow.timeout_until) {
            return false;
        }

        return new Date(userRow.timeout_until).getTime() > Date.now();
    };

    const formatDate = (value) => {
        if (!value) {
            return '—';
        }

        return new Date(value).toLocaleString();
    };

    if (!isAdmin) {
        return <Navigate to="/profile" />;
    }

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="text-white m-0">Admin Dashboard</h2>
                <button className="btn btn-outline-light btn-sm" onClick={loadUsers} disabled={loading}>
                    Refresh
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="table-responsive">
                <table className="table table-dark table-striped table-bordered align-middle">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Banned</th>
                            <th>Timeout Until</th>
                            <th style={{ minWidth: 370 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4">Loading users...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4">No users found.</td>
                            </tr>
                        ) : users.map((row) => {
                            const rowTimedOut = isTimedOut(row);
                            const isSelf = row.id === user.id;
                            const actionLocked = busyUserId === row.id || row.role === 'admin';

                            return (
                                <tr key={row.id}>
                                    <td>{row.name}{isSelf ? ' (You)' : ''}</td>
                                    <td>{row.email}</td>
                                    <td className="text-capitalize">{row.role}</td>
                                    <td>{row.is_banned ? 'Yes' : 'No'}</td>
                                    <td>{formatDate(row.timeout_until)}</td>
                                    <td>
                                        <div className="d-flex flex-wrap gap-2">
                                            <select
                                                className="form-select form-select-sm"
                                                style={{ maxWidth: 140 }}
                                                value={selectedDuration[row.id] || '2_days'}
                                                onChange={(e) => setSelectedDuration((prev) => ({ ...prev, [row.id]: e.target.value }))}
                                                disabled={actionLocked}
                                            >
                                                {timeoutOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                            <button className="btn btn-warning btn-sm" onClick={() => handleTimeout(row.id)} disabled={actionLocked}>
                                                Timeout
                                            </button>
                                            {rowTimedOut && (
                                                <button className="btn btn-secondary btn-sm" onClick={() => handleUntimeout(row.id)} disabled={busyUserId === row.id}>
                                                    Untimeout
                                                </button>
                                            )}
                                            {row.is_banned ? (
                                                <button className="btn btn-success btn-sm" onClick={() => handleUnban(row.id)} disabled={busyUserId === row.id}>
                                                    Unban
                                                </button>
                                            ) : (
                                                <button className="btn btn-danger btn-sm" onClick={() => handleBan(row.id)} disabled={actionLocked}>
                                                    Ban
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard;
