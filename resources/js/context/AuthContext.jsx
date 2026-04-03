import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on page load
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            api.get("/api/accounts/my-profile")
                .then((res) => {
                    const data = res.data.data ?? res.data;
                    setUser(data);
                })
                .catch(() => {
                    localStorage.removeItem("token");
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await api.post("/api/accounts/login", { email, password });
        const { token, user: userData } = res.data;
        localStorage.setItem("token", token);
        setUser(userData);
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post("/api/accounts/logout");
        } catch (err) {
            // silent fail
        } finally {
            localStorage.removeItem("token");
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}