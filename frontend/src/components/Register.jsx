import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import config from '../../config'

export default function Register({ onSuccess }) {
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [confirm, setConfirm] = useState("");
    const [message, setMessage] = useState("");
    const BACKEND_URL = config.BACKEND_URL

    async function handleRegister(e) {
        e.preventDefault();

        // Registration route
        const res = await fetch(`${BACKEND_URL}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password, username }),
        });

        if (res.ok) {
            setMessage("Registration successful! You can now log in.");
            if (onSuccess) onSuccess();
        } else {
            const data = await res.json().catch(() => ({}));
            setMessage(data.message);
        }
    }

    if (user) return null;

    return (
        <>
            <form className="authentication-form"
                onSubmit={handleRegister}
            >

            <label>Email</label>

            <input
                type="email"
                placeholder="Input Your Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />

            <label>Username</label>

            <input
                type="text"
                placeholder="Input Your Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
            />

            <label>Password</label>

            <input
                type="password"
                placeholder="Input Your Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
            />

            <label>Confirm Password</label>

            <input
                type="password"
                placeholder="Confirm Your Password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
            />
            <button className="authentication-submit" type="submit">Register</button>
            </form>
    </>
    );
}
