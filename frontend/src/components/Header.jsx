import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import config from "../../config";
import Login from "./Login";
import Register from "./Register";
import Modal from "./Modal";

export default function Header() {
    const { user, setUser } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const BACKEND_URL = config.BACKEND_URL;

    async function handleLogout() {
        const res = await fetch(`${BACKEND_URL}/api/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        setUser(null);
    }

    const navLinks = [
        { path: "/", label: "Dashboard" },
        { path: "/analytics-dashboard", label: "Analytics" },
        { path: "/manage", label: "Manage" },
        { path: "/upload", label: "Upload" },
        // 🔥 New Recipes tab
        { path: "/recipes", label: "Recipes" },
    ];

    return (
        <>
            <header className="topbar">
                <div className="topbar-inner">
                    <div className="brand">
                        <div className="brand-mark">SG</div>
                        <div className="brand-text">
                            <p className="brand-title">Smart Grocery</p>
                            <p className="brand-subtitle">Stay Ahead of Food Waste</p>
                        </div>
                    </div>

                    {user ? (
                        <>
                            <nav>
                                {navLinks.map((link) => (
                                    <NavLink
                                        key={link.path}
                                        to={link.path}
                                        className={({ isActive }) =>
                                            `topbar__link ${isActive ? "topbar__link--active" : ""}`
                                        }
                                    >
                                        {link.label}
                                    </NavLink>
                                ))}
                            </nav>

                            <div className="topbar__actions">
                                <div className="user-pill">
                                    <span className="user-dot" />
                                    <span>{user.username}</span>
                                </div>
                                <button className="ghost-button" onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="topbar__actions">
                            <button className="ghost-button" onClick={() => setShowLoginModal(true)}>
                                Login
                            </button>
                            <button className="pill-button secondary" onClick={() => setShowRegisterModal(true)}>
                                Register
                            </button>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
                    <Login onSuccess={() => setShowLoginModal(false)} />
                </Modal>

                <Modal
                    isOpen={showRegisterModal}
                    onClose={() => setShowRegisterModal(false)}
                >
                    <Register onSuccess={() => setShowRegisterModal(false)} />
                </Modal>
            </header>
        </>
    );
}
