"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { VinaUser, Token } from "@/lib/api/types";
import { ApiService } from "@/lib/api/service";
import { signOutFromFirebase } from "@/lib/firebase/auth";

interface UserContextType {
    user: VinaUser | null;
    isLoading: boolean;
    login: (token: Token) => void;
    logout: () => Promise<void>;
    updateUser: (updates: any) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<VinaUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchInitialUser = async () => {
            const token = localStorage.getItem("vina_token");
            const storedUser = localStorage.getItem("vina_user");

            if (token && storedUser) {
                try {
                    // Set optimistic user right away to avoid flashes if possible
                    // But in page.tsx if isLoading is true we shouldn't flash anyway.
                    setUser(JSON.parse(storedUser));

                    // Verify the session is still valid.
                    const freshUser = await ApiService.getProfile();
                    const liveProgress = await ApiService.getProgress().catch(() => null);
                    const courseMap = await ApiService.getCourseMap("c_llm_foundations").catch(() => null);
                    const hydratedUser = {
                        ...freshUser,
                        progress: liveProgress || freshUser.progress,
                        pre_assessment_completed:
                            freshUser.pre_assessment_completed ||
                            liveProgress?.pre_assessment_completed ||
                            courseMap?.some(lesson => lesson.status === "completed"),
                    };
                    setUser(hydratedUser);
                    localStorage.setItem("vina_user", JSON.stringify(hydratedUser));
                } catch (e) {
                    console.error("Session invalid or server error", e);
                    // Invalid token or server issue, clean up session
                    setUser(null);
                    localStorage.removeItem("vina_token");
                    localStorage.removeItem("vina_user");
                    localStorage.removeItem("vina_progress");
                }
            }

            // Critical: Only mark as not loading AFTER we have verified the session
            setIsLoading(false);
        };

        fetchInitialUser();
    }, []);

    const login = (token: Token) => {
        setUser(token.user);
        localStorage.setItem("vina_token", token.access_token);
        localStorage.setItem("vina_user", JSON.stringify(token.user));
    };

    const logout = async () => {
        try {
            await signOutFromFirebase();
        } catch (error) {
            console.error("Firebase logout error:", error);
        }
        setUser(null);
        localStorage.removeItem("vina_token");
        localStorage.removeItem("vina_user");
        localStorage.removeItem("vina_progress");
        router.replace("/");
    };

    const mergeUser = (base: VinaUser | null, updates: any): VinaUser | null => {
        if (!base) return updates;
        const compact = (value: Record<string, any>) => Object.fromEntries(
            Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
        );
        const profileUpdates = {
            ...compact(updates?.profile || {}),
            ...(updates?.profession !== undefined ? { profession: updates.profession } : {}),
            ...(updates?.industry !== undefined ? { industry: updates.industry } : {}),
            ...(updates?.experience_level !== undefined ? { experience_level: updates.experience_level } : {}),
            ...(updates?.leadership_level !== undefined ? { leadership_level: updates.leadership_level } : {}),
            ...(updates?.daily_goal_minutes !== undefined ? { daily_goal_minutes: updates.daily_goal_minutes } : {}),
            ...(updates?.dailyGoalMinutes !== undefined ? { daily_goal_minutes: updates.dailyGoalMinutes } : {}),
            ...(updates?.resolution !== undefined ? { resolution: updates.resolution } : {}),
        };

        return {
            ...base,
            ...updates,
            id: updates?.id || base.id,
            email: updates?.email || base.email,
            fullName: updates?.fullName || base.fullName,
            profile: {
                ...base.profile,
                ...profileUpdates,
            },
            onboardingResponses: updates?.onboardingResponses || updates?.onboarding_responses || base.onboardingResponses,
        };
    };

    const updateUser = async (updates: any) => {
        const optimisticUser = mergeUser(user, updates);
        if (optimisticUser) {
            setUser(optimisticUser);
            localStorage.setItem("vina_user", JSON.stringify(optimisticUser));
        }

        const updatedUser = await ApiService.updateProfile(updates);
        const mergedUser = mergeUser(mergeUser(optimisticUser, updatedUser), updates);
        if (mergedUser) {
            setUser(mergedUser);
            localStorage.setItem("vina_user", JSON.stringify(mergedUser));
        }
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
