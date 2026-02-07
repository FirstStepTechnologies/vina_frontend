"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { VinaProgress } from "@/lib/api/types";

// Default initial state matching PRD
const DEFAULT_PROGRESS: VinaProgress = {
    currentLessonId: "l01_what_llms_are",
    completedLessons: [],
    lessonScores: {},
    currentDifficulty: 3, // Default difficulty (1-5 scale)
    totalPoints: 0,
    streak: 0,
    lastActiveDate: new Date().toISOString().split("T")[0],
    practicePointsToday: 0,
    lastPracticeDate: "",
    totalLearningTimeSeconds: 0,
    preAssessmentCompleted: false,
    preAssessmentScore: 0,
    startingLesson: "l01_what_llms_are",
    preAssessmentDate: "",
};

interface ProgressContextType {
    progress: VinaProgress;
    isLoading: boolean;
    updateProgress: (updates: Partial<VinaProgress>) => void;
    unlockLesson: (lessonId: string) => void;
    completeLesson: (lessonId: string, score: number, total: number) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
    const [progress, setProgress] = useState<VinaProgress>(DEFAULT_PROGRESS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check LocalStorage on mount
        const stored = localStorage.getItem("vina_progress");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Merge with default to ensure new fields are present
                setProgress({ ...DEFAULT_PROGRESS, ...parsed });
            } catch (e) {
                console.error("Failed to parse progress from local storage", e);
            }
        }
        setIsLoading(false);
    }, []);

    const saveProgress = (newProgress: VinaProgress) => {
        setProgress(newProgress);
        localStorage.setItem("vina_progress", JSON.stringify(newProgress));
    };

    const updateProgress = (updates: Partial<VinaProgress>) => {
        const newProgress = { ...progress, ...updates };
        saveProgress(newProgress);
    };

    const unlockLesson = (lessonId: string) => {
        // In a real app this might set 'unlocked' flags, 
        // but in Vina, unlocking is derived from completed prerequisites.
        // However, we might want to explicitly set 'currentLessonId'
        updateProgress({ currentLessonId: lessonId });
    };

    const completeLesson = (lessonId: string, score: number, total = 3) => {
        const today = new Date().toISOString().split("T")[0];
        const newCompleted = progress.completedLessons.includes(lessonId)
            ? progress.completedLessons
            : [...progress.completedLessons, lessonId];

        const newScores = {
            ...progress.lessonScores,
            [lessonId]: {
                score,
                total,
                passedAt: new Date().toISOString(),
            },
        };

        // Simple points logic: 10 pts per correct answer
        const pointsEarned = score * 10;

        // Streak logic
        let newStreak = progress.streak;
        const lastActive = new Date(progress.lastActiveDate);
        const currentDate = new Date(today);
        const dayDiff = Math.floor((currentDate.getTime() - lastActive.getTime()) / (1000 * 3600 * 24));

        if (dayDiff === 1) {
            newStreak += 1; // Consecutive day
        } else if (dayDiff > 1) {
            newStreak = 1; // Broken streak
        }
        // If dayDiff === 0, streak remains same (already active today)

        saveProgress({
            ...progress,
            completedLessons: newCompleted,
            lessonScores: newScores,
            totalPoints: progress.totalPoints + pointsEarned,
            streak: newStreak,
            lastActiveDate: today,
        });
    };

    return (
        <ProgressContext.Provider
            value={{
                progress,
                isLoading,
                updateProgress,
                unlockLesson,
                completeLesson,
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
