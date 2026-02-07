"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { VinaUser } from "@/lib/api/types";

interface UserContextType {
    user: VinaUser | null;
    isLoading: boolean;
    login: (newUser: VinaUser) => void;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<VinaUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check LocalStorage on mount
        const stored = localStorage.getItem("vina_user");
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newUser: VinaUser) => {
        setUser(newUser);
        localStorage.setItem("vina_user", JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("vina_user");
        localStorage.removeItem("vina_progress"); // Also clear progress on logout
    };

    return (
        <UserContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
