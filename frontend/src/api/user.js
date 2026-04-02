import api from './api';

export const myProfile = async () => {
    const res = await api.get('/accounts/my-profile');
    return res.data.data;
};

export const updateProfile = async (updates) => {
    const res = await api.post('/accounts/update-profile', updates);
    return res.data.data;
};

export const searchUsers = async (name) => {
    const res = await api.post('/accounts/search-users', { name });
    return res.data.data;
};

export const publicProfile = async (id) => {
    const res = await api.get(`/accounts/public-profile/${id}`);
    return res.data.data;
};