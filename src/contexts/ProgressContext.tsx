"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { VinaProgress } from "@/lib/api/types";
import { useUser } from "./UserContext";
import { ApiService } from "@/lib/api/service";

const DEFAULT_PROGRESS: VinaProgress = {
    current_lesson_id: "l01_what_llms_are",
    completed_lessons: [],
    diamonds: 0,
    streak: 0,
    minutes_today: 0,
    minutes_this_week: 0,
    minutes_total: 0,
    total_learning_time_seconds: 0,
    pre_assessment_completed: false,
    starting_lesson: "l01_what_llms_are",
    currentTourStep: 0,
    tourCompleted: false,
};

interface ProgressContextType {
    progress: VinaProgress;
    isLoading: boolean;
    updateProgress: (updates: Partial<VinaProgress>) => void;
    unlockLesson: (lessonId: string) => void;
    completeLesson: (lessonId: string) => Promise<void>;
    addMinutes: (minutes: number) => Promise<void>;
    addDiamonds: (amount: number) => void;
    resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
    const [progress, setProgress] = useState<VinaProgress>(DEFAULT_PROGRESS);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        const fetchProgress = async () => {
            if (user && user.progress) {
                setProgress(user.progress);
            } else {
                const stored = localStorage.getItem("vina_progress");
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        setProgress({ ...DEFAULT_PROGRESS, ...parsed });
                    } catch (e) {
                        console.error("Failed to parse progress", e);
                    }
                }
            }
            setIsLoading(false);
        };
        fetchProgress();
    }, [user]);

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem("vina_progress", JSON.stringify(progress));
        }
    }, [progress, isLoading]);

    const updateProgress = (updates: Partial<VinaProgress>) => {
        setProgress(prev => ({ ...prev, ...updates }));
    };

    const unlockLesson = (lessonId: string) => {
        setProgress(prev => ({ ...prev, current_lesson_id: lessonId }));
    };

    const completeLesson = async (lessonId: string) => {
        try {
            const result = await ApiService.completeLesson(lessonId);
            // Result is full progress or summary from backend
            if (result.progress) {
                setProgress(result.progress);
            } else {
                // Fallback locally if backend returns something else
                setProgress(prev => ({
                    ...prev,
                    completed_lessons: prev.completed_lessons.includes(lessonId)
                        ? prev.completed_lessons
                        : [...prev.completed_lessons, lessonId]
                }));
            }
        } catch (e) {
            console.error("Failed to complete lesson on server", e);
            // OPTIMISTIC UPDATE: If server fails (e.g. CORS, Offline), 
            // complete it locally so user isn't stuck.
            setProgress(prev => {
                // Avoid duplicates
                if (prev.completed_lessons.includes(lessonId)) return prev;
                return {
                    ...prev,
                    completed_lessons: [...prev.completed_lessons, lessonId]
                };
            });
        }
    };

    const addMinutes = async (minutes: number) => {
        setProgress(prev => ({
            ...prev,
            minutes_today: prev.minutes_today + minutes,
            total_learning_time_seconds: prev.total_learning_time_seconds + (minutes * 60)
        }));

        try {
            const updatedProgress = await ApiService.syncProgress(minutes);
            if (updatedProgress) {
                setProgress(updatedProgress);
            }
        } catch (e) {
            console.error("Failed to sync minutes to server", e);
        }
    };

    const addDiamonds = (amount: number) => {
        setProgress(prev => ({
            ...prev,
            diamonds: prev.diamonds + amount,
        }));
    };

    const resetProgress = () => {
        setProgress(DEFAULT_PROGRESS);
        localStorage.removeItem("vina_progress");
    };

    return (
        <ProgressContext.Provider
            value={{
                progress,
                isLoading,
                updateProgress,
                unlockLesson,
                completeLesson,
                addMinutes,
                addDiamonds,
                resetProgress,
            }}
        >
            {children}
        </ProgressContext.Provider>
    );
}

export function useProgress() {
    const context = useContext(ProgressContext);
    if (context === undefined) {
        throw new Error("useProgress must be used within a ProgressProvider");
    }
    return context;
}
