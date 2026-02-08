"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { VinaUser, Token } from "@/lib/api/types";
import { ApiService } from "@/lib/api/service";

interface UserContextType {
    user: VinaUser | null;
    isLoading: boolean;
    login: (token: Token) => void;
    logout: () => void;
    updateUser: (updates: any) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<VinaUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInitialUser = async () => {
            const token = localStorage.getItem("vina_token");
            const storedUser = localStorage.getItem("vina_user");

            if (token && storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                    // Optionally refresh profile from server
                    const freshUser = await ApiService.getProfile();
                    setUser(freshUser);
                    localStorage.setItem("vina_user", JSON.stringify(freshUser));
                } catch (e) {
                    console.error("Session invalid or server error", e);
                    // logout() if token expired?
                }
            }
            setIsLoading(false);
        };

        fetchInitialUser();
    }, []);

    const login = (token: Token) => {
        setUser(token.user);
        localStorage.setItem("vina_token", token.access_token);
        localStorage.setItem("vina_user", JSON.stringify(token.user));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("vina_token");
        localStorage.removeItem("vina_user");
        localStorage.removeItem("vina_progress");
    };

    const updateUser = async (updates: any) => {
        const updatedUser = await ApiService.updateProfile(updates);
        setUser(updatedUser);
        localStorage.setItem("vina_user", JSON.stringify(updatedUser));
    };

    return (
        <UserContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
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
