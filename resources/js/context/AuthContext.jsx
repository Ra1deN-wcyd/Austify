import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on page load
    useEffect(() => {
        const token = localStorage.getItem("austify_token"); // ✅ fixed key
        if (token) {
            api.get("/accounts/my-profile") // ✅ removed /api/
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
        const res = await api.post("/accounts/login", { email, password }); // ✅ removed /api/
        const { token, user: userData } = res.data;
        localStorage.setItem("austify_token", token); // ✅ fixed key
        localStorage.setItem("user_name", userData.name);
        localStorage.setItem("user_id", userData.id);
        localStorage.setItem("user_email", userData.email);
        localStorage.setItem("user_github", userData.github_link || "");
        setUser(userData);
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post("/accounts/logout"); // ✅ removed /api/
        } catch (err) {
            // silent fail
        } finally {
            localStorage.clear();
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