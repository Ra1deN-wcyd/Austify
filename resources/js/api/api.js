import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();

const normalizeApiBaseUrl = () => {
    if (!rawApiUrl) {
        return `${window.location.origin}/api`;
    }

    const sanitized = rawApiUrl.replace(/\/+$/, '');
    return sanitized.endsWith('/api') ? sanitized : `${sanitized}/api`;
};

const apiBaseUrl = normalizeApiBaseUrl();

const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('austify_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = String(error.response?.data?.message || '').toLowerCase();

        if (status === 401 || (status === 403 && message.includes('permanently banned'))) {
            localStorage.clear();
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;
