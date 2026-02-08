"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { VinaProgress } from "@/lib/api/types";
import { useUser } from "./UserContext";

// Default initial state matching PRD
const DEFAULT_PROGRESS: VinaProgress = {
    currentLessonId: "l01_what_llms_are",
    completedLessons: [],
    lessonScores: {},
    currentDifficulty: 3, // Default difficulty (1-5 scale)
    totalPoints: 0,
    diamonds: 0,
    streak: 0,
    minutesToday: 0,
    minutesThisWeek: 0,
    lastActiveDate: new Date().toISOString().split("T")[0],
    practicePointsToday: 0,
    lastPracticeDate: "",
    totalLearningTimeSeconds: 0,
    preAssessmentCompleted: false,
    preAssessmentScore: 0,
    startingLesson: "l01_what_llms_are",
    preAssessmentDate: "",
    tourCompleted: false,
    currentTourStep: 0,
};

interface ProgressContextType {
    progress: VinaProgress;
    isLoading: boolean;
    updateProgress: (updates: Partial<VinaProgress>) => void;
    unlockLesson: (lessonId: string) => void;
    completeLesson: (lessonId: string, score: number, total: number) => void;
    addMinutes: (minutes: number) => void;
    addDiamonds: (amount: number) => void;
    incrementStreak: () => void;
    markGoalAchieved: (date: string) => void;
    resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
    const [progress, setProgress] = useState<VinaProgress>(DEFAULT_PROGRESS);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();

    // Initial mount: load from LocalStorage
    useEffect(() => {
        const stored = localStorage.getItem("vina_progress");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setProgress({ ...DEFAULT_PROGRESS, ...parsed });
            } catch (e) {
                console.error("Failed to parse progress from local storage", e);
            }
        }
        setIsLoading(false);
    }, []);

    // Sync to LocalStorage on every state change
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem("vina_progress", JSON.stringify(progress));
        }
    }, [progress, isLoading]);

    // Goal Reach Logic: Automated Tracking
    useEffect(() => {
        if (!user) return;

        const today = new Date().toISOString().split("T")[0];
        const goalMins = user.dailyGoalMinutes || 10;

        if (progress.minutesToday >= goalMins && !progress.dailyGoalHistory?.[today]) {
            markGoalAchieved(today);
            // Resolution Bonus: 100 Diamonds for hitting the daily goal!
            addDiamonds(100);
        }
    }, [progress.minutesToday, user, progress.dailyGoalHistory]);

    const updateProgress = (updates: Partial<VinaProgress>) => {
        setProgress(prev => ({ ...prev, ...updates }));
    };

    const unlockLesson = (lessonId: string) => {
        setProgress(prev => ({ ...prev, currentLessonId: lessonId }));
    };

    const completeLesson = (lessonId: string, score: number, total = 3) => {
        setProgress(prev => {
            const today = new Date().toISOString().split("T")[0];
            const newCompleted = prev.completedLessons.includes(lessonId)
                ? prev.completedLessons
                : [...prev.completedLessons, lessonId];

            const newScores = {
                ...prev.lessonScores,
                [lessonId]: {
                    score,
                    total,
                    passedAt: new Date().toISOString(),
                },
            };

            // Streak logic
            let newStreak = prev.streak;
            const lastActive = new Date(prev.lastActiveDate);
            const currentDate = new Date(today);
            const dayDiff = Math.floor((currentDate.getTime() - lastActive.getTime()) / (1000 * 3600 * 24));

            if (dayDiff === 1) {
                newStreak += 1;
            } else if (dayDiff > 1) {
                newStreak = 1;
            } else if (prev.streak === 0) {
                newStreak = 1;
            }

            return {
                ...prev,
                completedLessons: newCompleted,
                lessonScores: newScores,
                streak: newStreak,
                lastActiveDate: today,
            };
        });
    };

    const addMinutes = (minutes: number) => {
        setProgress(prev => ({
            ...prev,
            minutesToday: prev.minutesToday + minutes,
            minutesThisWeek: prev.minutesThisWeek + minutes,
            totalLearningTimeSeconds: prev.totalLearningTimeSeconds + (minutes * 60)
        }));
    };

    const addDiamonds = (amount: number) => {
        setProgress(prev => ({
            ...prev,
            diamonds: prev.diamonds + amount,
            totalPoints: prev.totalPoints + amount
        }));
    };

    const incrementStreak = () => {
        setProgress(prev => ({
            ...prev,
            streak: prev.streak + 1
        }));
    };

    const markGoalAchieved = (date: string) => {
        setProgress(prev => ({
            ...prev,
            dailyGoalHistory: {
                ...(prev.dailyGoalHistory || {}),
                [date]: true
            }
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
                incrementStreak,
                markGoalAchieved,
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
