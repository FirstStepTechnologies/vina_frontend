"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { VinaProgress } from "@/lib/api/types";
import { useUser } from "./UserContext";
import { ApiService } from "@/lib/api/service";
import { getSessionId } from "@/lib/session";

const DEFAULT_PROGRESS: VinaProgress = {
    course_progress: {},
    secondary_track_ids: [],
    diamonds: 0,
    streak: 0,
    minutes_today: 0,
    minutes_this_week: 0,
    minutes_total: 0,
    total_learning_time_seconds: 0,
    pre_assessment_completed: false,
    currentTourStep: 0,
    tourCompleted: false,
};

interface ProgressContextType {
    progress: VinaProgress;
    activeCourseId: string;
    setActiveCourseId: (id: string) => void;
    isLoading: boolean;
    updateProgress: (updates: Partial<VinaProgress>) => void;
    completeLesson: (lessonId: string, score?: number, total?: number) => Promise<void>;
    addMinutes: (minutes: number) => Promise<void>;
    addDiamonds: (amount: number) => void;
    resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
    const [progress, setProgress] = useState<VinaProgress>(DEFAULT_PROGRESS);
    const [activeCourseId, setActiveCourseIdState] = useState<string>("c_llm_foundations"); // Default fallback
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();

    // Persist activeCourseId explicitly to local storage
    useEffect(() => {
        const storedCourseId = localStorage.getItem("vina_active_course_id");
        if (storedCourseId) {
            setActiveCourseIdState(storedCourseId);
        }
    }, []);

    const setActiveCourseId = (id: string) => {
        setActiveCourseIdState(id);
        localStorage.setItem("vina_active_course_id", id);
    };

    useEffect(() => {
        const fetchProgress = async () => {
            // First, load from localStorage for immediate UI display
            const stored = localStorage.getItem("vina_progress");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setProgress({ ...DEFAULT_PROGRESS, ...parsed });
                } catch (e) {
                    console.error("Failed to parse progress cache", e);
                }
            }

            // Then asynchronously fetch the absolutely latest progress from the backend server
            if (user) {
                try {
                    const liveProgress = await ApiService.getProgress();
                    if (liveProgress && liveProgress.user_id) {
                        setProgress(liveProgress);
                        if (liveProgress.primary_track_id) {
                            setActiveCourseIdState(liveProgress.primary_track_id);
                            localStorage.setItem("vina_active_course_id", liveProgress.primary_track_id);
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch live progress from backend", e);
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

    const completeLesson = async (lessonId: string, score: number = 0, total: number = 0) => {
        try {
            const sessionId = getSessionId();
            let totalLessonTimeS: number | undefined = undefined;
            const startedAtStr = sessionStorage.getItem(`lesson_started_at_${lessonId}`);
            if (startedAtStr) {
                const startedAt = parseInt(startedAtStr, 10);
                if (!isNaN(startedAt)) {
                    totalLessonTimeS = Math.floor((Date.now() - startedAt) / 1000);
                }
            }

            const result = await ApiService.completeLesson(activeCourseId, lessonId, score, total, totalLessonTimeS, sessionId);
            if (result.user_id) {
                setProgress(result);
            } else {
                // OPTIMISTIC LOCAL CACHE FALLBACK IF BACKEND SHAPE WEIRD
                setProgress(prev => {
                    const courseProgress = prev.course_progress[activeCourseId] || { completed_lessons: [], lesson_scores: {}, current_difficulty: 3 };
                    if (courseProgress.completed_lessons.includes(lessonId)) return prev;
                    return {
                        ...prev,
                        course_progress: {
                            ...prev.course_progress,
                            [activeCourseId]: {
                                ...courseProgress,
                                completed_lessons: [...courseProgress.completed_lessons, lessonId]
                            }
                        }
                    };
                });
            }
        } catch (e) {
            console.error("Failed to complete lesson on server", e);
            // OPTIMISTIC UPDATE
            setProgress(prev => {
                const courseProgress = prev.course_progress[activeCourseId] || { completed_lessons: [], lesson_scores: {}, current_difficulty: 3 };
                if (courseProgress.completed_lessons.includes(lessonId)) return prev;
                return {
                    ...prev,
                    course_progress: {
                        ...prev.course_progress,
                        [activeCourseId]: {
                            ...courseProgress,
                            completed_lessons: [...courseProgress.completed_lessons, lessonId]
                        }
                    }
                };
            });
        }
    };

    const addMinutes = async (minutes: number) => {
        setProgress(prev => ({
            ...prev,
            minutes_today: prev.minutes_today + minutes,
            minutes_this_week: prev.minutes_this_week + minutes,
            minutes_total: prev.minutes_total + minutes,
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
                activeCourseId,
                setActiveCourseId,
                isLoading,
                updateProgress,
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
