import { createContext, useContext, useState, useEffect } from "react";
import config from '../../config'

const AuthContext = createContext(null);
const BACKEND_URL = config.BACKEND_URL

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch(`${BACKEND_URL}/api/me`, {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch {}
        }
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
