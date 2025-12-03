// src/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import config from "../../config";

export default function Login({ onSuccess }) {
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const BACKEND_URL = config.BACKEND_URL;

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username,
          email: username, // so backend works whether it expects username or email
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // 401, 400, etc.
        setError(data.message || "Invalid username or password.");
        return;
      }

      setUser(data.user);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError("Unable to reach the server. Please try again.");
    }
  }

  return (
    <>
      <form onSubmit={handleLogin} className="authentication-form">
        <label>Username</label>
        <input
          type="text"
          placeholder="Enter Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="authentication-submit" type="submit">
          Log In
        </button>

        {error && (
          <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>
        )}
      </form>
    </>
  );
}
