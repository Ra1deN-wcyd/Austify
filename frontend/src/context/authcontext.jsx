import { createContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('austify_token'));

    useEffect(() => {
        if (token) {
            localStorage.setItem('austify_token', token);
        } else {
            localStorage.removeItem('austify_token');
        }
    }, [token]);

    // Restore user from localStorage on mount
    useEffect(() => {
        if (token) {
            const storedUser = {
                name: localStorage.getItem('user_name'),
                id: localStorage.getItem('user_id'),
                email: localStorage.getItem('user_email'),
                github_link: localStorage.getItem('user_github'),
            };
            if (storedUser.name) setUser(storedUser);
        }
    }, []);

    const login = async (email, password) => {
        const data = await apiLogin(email, password);
        setToken(data.token);
        setUser(data.user);

        // Store all user data
        localStorage.setItem('austify_token', data.token);
        localStorage.setItem('user_name', data.user.name);
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_github', data.user.github_link || '');

        return data;
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch (e) {
            console.log('Logged out locally');
        }
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};