"use client";

import { useProgress } from "@/contexts/ProgressContext";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import Link from "next/link";

export function ResolutionHUD() {
    const { user } = useUser();
    const { progress } = useProgress();

    const dailyGoal = user?.dailyGoalMinutes || 10;
    const minutesToday = progress.minutesToday || 0;
    const progressPercent = Math.min(100, Math.round((minutesToday / dailyGoal) * 100));

    // Calculate last 7 days for consistency tracker
    const getDaysOfWeek = () => {
        const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        const today = new Date();
        const currentDay = today.getDay(); // 0 is Sunday
        // Reorder to start from Monday if desired, or just show last 7 days
        // Let's show the current week (Mon-Sun)
        return days;
    };

    const days = getDaysOfWeek();
    // In a real app, we'd map these to actual dates in progress.dailyGoalHistory
    // For this demo, we'll simulate some history based on streak and current progress
    const mockHistory = [true, true, true, minutesToday >= dailyGoal, false, false, false];

    return (
        <div className="mx-6 mt-4 mb-2 animate-slide-up" id="tour-resolution">
            <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white shadow-[0_20px_50px_rgba(20,184,166,0.1)] group">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-100 rounded-2xl flex items-center justify-center shadow-inner">
                                <span className="text-xl">💪</span>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-0.5">My 2026 Resolution</h3>
                                <p className="text-sm font-bold text-teal-900 leading-tight">
                                    {user?.resolution || "Set your learning resolution in Profile"}
                                </p>
                            </div>
                        </div>
                        <Link href="/profile" className="p-2 bg-white/50 rounded-xl hover:bg-white text-teal-400 hover:text-teal-600 transition-all shadow-sm">
                            <Settings size={18} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-[100px_1fr] gap-6 items-center">
                        {/* Progress Ring */}
                        <div className="relative w-[100px] h-[100px] flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="44"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-teal-900/5"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="44"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeDasharray={2 * Math.PI * 44}
                                    strokeDashoffset={2 * Math.PI * 44 * (1 - progressPercent / 100)}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    className="text-teal-500 transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-black text-teal-900 leading-none">{progressPercent}%</span>
                                <span className="text-[8px] font-black text-teal-500 uppercase tracking-wider mt-1">Today</span>
                            </div>
                        </div>

                        {/* Consistency Tracker */}
                        <div className="flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[9px] font-black text-teal-600/60 uppercase tracking-widest">Consistency</span>
                                <span className="text-[9px] font-black text-teal-900 uppercase">{minutesToday}/{dailyGoal} mins</span>
                            </div>
                            <div className="flex justify-between gap-1.5">
                                {days.map((day, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                                        <div className={cn(
                                            "w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-500",
                                            mockHistory[i]
                                                ? "bg-teal-500 text-white shadow-[0_4px_12px_rgba(20,184,166,0.3)]"
                                                : "bg-teal-900/5 text-teal-900/20"
                                        )}>
                                            {mockHistory[i] ? (
                                                <div className="w-1 h-1 bg-white rounded-full" />
                                            ) : (
                                                <div className="w-1 h-1 bg-current rounded-full" />
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-[8px] font-black",
                                            i === (new Date().getDay() || 7) - 1 ? "text-teal-600" : "text-gray-400"
                                        )}>{day}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3 text-[10px] font-bold text-teal-700/70 italic">
                                {progressPercent >= 100
                                    ? "Commitment met! 💪 Great job."
                                    : `${dailyGoal - minutesToday} mins to reach your daily goal.`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
