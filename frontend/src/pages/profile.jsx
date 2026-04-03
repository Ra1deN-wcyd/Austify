// src/pages/profile.jsx
import { useEffect, useState } from "react";
import api from "../api/api";

export default function Profile() {
    const [user, setUser] = useState({
        name: "",
        email: "",
        github: "",
        points: 0,
        posts: 0,
        rank: "--",
    });
    const [avatar, setAvatar] = useState(null);

    const token = localStorage.getItem("austify_token");

    useEffect(() => {
        setUser({
            name: localStorage.getItem("user_name") || "Unknown",
            email: localStorage.getItem("user_email") || "No email",
            github: localStorage.getItem("user_github") || "",
            points: 0,
            posts: 0,
            rank: "--",
        });

        const loadProfile = async () => {
            try {
                const res = await api.get("/accounts/my-profile");
                setUser((prev) => ({
                    ...prev,
                    points: res.data.bonus_points ?? 0,
                    posts: res.data.posts_count ?? 0,
                    rank: res.data.rank ? `#${res.data.rank}` : "--",
                }));
            } catch (err) {
                console.log(err);
            }
        };
        loadProfile();
    }, [token]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setAvatar(reader.result);
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <section className="bg-dark text-white text-center py-5">
                <div className="container">
                    <h2 className="fw-bold text-success" style={{ fontSize: "2rem" }}>👤 My Profile</h2>
                    <p className="lead">Manage your Austify account</p>
                </div>
            </section>

            <section className="py-5" style={{ backgroundColor: "#f0f0f0" }}>
                <div className="container" style={{ maxWidth: "700px" }}>
                    <div className="card shadow mb-4" style={{ backgroundColor: "#d6d0c4", border: "none", borderRadius: "20px" }}>
                        <div style={{ height: "120px", background: "linear-gradient(135deg, #1a4731, #48bb78, #2d6a4f)" }}></div>

                        <div style={{ position: "relative", display: "inline-block", marginTop: "-50px", marginLeft: "32px" }}>
                            <div style={{
                                width: "100px", height: "100px", borderRadius: "50%", border: "4px solid #d6d0c4",
                                background: "#1a4731", display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "2.5rem", color: "#48bb78", overflow: "hidden"
                            }}>
                                {avatar ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.name.charAt(0).toUpperCase()}
                            </div>
                            <button onClick={() => document.getElementById("avatarInput").click()} style={{
                                position: "absolute", bottom: 4, right: 4, background: "#48bb78", border: "none",
                                borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", fontSize: "13px"
                            }}>✏️</button>
                            <input type="file" id="avatarInput" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                        </div>

                        <div style={{ padding: "16px 32px 32px" }}>
                            <h3 className="fw-bold mb-1">{user.name}</h3>
                            <p className="text-muted mb-4">{user.email}</p>

                            <div className="d-flex gap-3 mb-4">
                                {[
                                    { label: "⭐ Points", value: user.points },
                                    { label: "📝 Posts", value: user.posts },
                                    { label: "🏆 Rank", value: user.rank },
                                ].map((stat, idx) => (
                                    <div key={idx} className="card shadow-sm text-center p-3 flex-fill" style={{ background: "#fff", border: "none", borderRadius: "10px" }}>
                                        <div className="fw-bold fs-4 text-success">{stat.value}</div>
                                        <div className="text-muted" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "1px" }}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Details */}
                            <div className="card shadow-sm d-flex flex-row align-items-center gap-3 p-3 mb-3" style={{ background: "#fff", borderRadius: "10px" }}>
                                <span>👤</span>
                                <div>
                                    <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "1px" }}>Full Name</div>
                                    <div className="fw-semibold">{user.name}</div>
                                </div>
                            </div>
                            <div className="card shadow-sm d-flex flex-row align-items-center gap-3 p-3 mb-3" style={{ background: "#fff", borderRadius: "10px" }}>
                                <span>📧</span>
                                <div>
                                    <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "1px" }}>Email</div>
                                    <div className="fw-semibold">{user.email}</div>
                                </div>
                            </div>
                            <div className="card shadow-sm d-flex flex-row align-items-center gap-3 p-3 mb-3" style={{ background: "#fff", borderRadius: "10px" }}>
                                <span>🐙</span>
                                <div>
                                    <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "1px" }}>GitHub</div>
                                    <div className="fw-semibold">
                                        {user.github ? <a href={user.github} target="_blank" className="text-success">{user.github}</a> : "Not provided"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}