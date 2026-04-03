import api from './api';

export const login = async (email, password) => {
    const res = await api.post('/accounts/login', { email, password });
    return res.data;
};

export const register = async (name, email, password, github_link) => {
    const res = await api.post('/accounts/register', { name, email, password, github_link });
    return res.data;
};

export const logout = async () => {
    await api.post('/accounts/logout');
    localStorage.removeItem('austify_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_github');
};