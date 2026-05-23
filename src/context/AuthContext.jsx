import { createContext, useContext, useState } from "react";
import authService from "../services/authService";
import { User } from "../models/User";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(authService.getUser());

async function login(email, password) {
    const data = await authService.login(email, password);

    const loggedInUser = new User(
        data.id,
        data.name,
        data.email,
        data.role,
        data.token
    );

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return data;
}

    async function register(name, email, password) {
        await authService.register(name, email, password);
        return message;
    }

    function logout() {
        authService.logout();
        setUser(null);
    }
    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
export function useAuth() {
    return useContext(AuthContext);
}