import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("austify_token");

        if (token) {
            api.get("/accounts/my-profile")
                .then((res) => {
                    const data = res.data.data ?? res.data;
                    setUser(data);
                })
                .catch(() => {
                    localStorage.clear();
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await api.post("/accounts/login", { email, password });
        const { token, user: userData } = res.data;
        storeSession(token, userData);
        return res.data;
    };

    const loginWithToken = (token, userData) => {
        storeSession(token, userData);
        setUser(userData);
    };

    const hydrateGoogleSession = async (token) => {
        localStorage.setItem("austify_token", token);

        try {
            const res = await api.get("/accounts/my-profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const userData = res.data.data ?? res.data;
            storeSession(token, userData);
            return userData;
        } catch (error) {
            localStorage.clear();
            setUser(null);
            throw error;
        }
    };

    const storeSession = (token, userData) => {
        localStorage.setItem("austify_token", token);
        localStorage.setItem("user_name", userData.name);
        localStorage.setItem("user_id", String(userData.id));
        localStorage.setItem("user_email", userData.email);
        localStorage.setItem("user_github", userData.github_link || "");
        localStorage.setItem("auth_method", userData.google_id ? "google" : "password");
        setUser(userData);
    };

    const logout = async () => {
        try {
            await api.post("/accounts/logout");
        } catch (err) {
            // no-op
        } finally {
            localStorage.clear();
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, loginWithToken, hydrateGoogleSession, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
