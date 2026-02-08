"use client";

import { useEffect, useState } from "react";
import { Check, Flame, Gem, Clock, Heart, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CelebrationOverlayProps {
    isOpen: boolean;
    onContinue: () => void;
    buttonText?: string;
    stats: {
        diamondsEarned: number;
        streakEarned: boolean;
        minutesToday: number;
        minutesThisWeek: number;
        dailyGoalAchieved: boolean;
        dailyGoalMinutes: number;
    };
}

export function CelebrationOverlay({ isOpen, onContinue, buttonText = "Continue to Quiz", stats }: CelebrationOverlayProps) {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setShowContent(true), 100);
            return () => clearTimeout(timer);
        } else {
            setShowContent(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex flex-col items-center transition-all duration-700 p-6 overflow-y-auto pt-10 pb-32",
            showContent ? "bg-teal-950/95 backdrop-blur-xl" : "bg-black/0 backdrop-blur-0"
        )}>
            {/* Animated Celebration Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className={cn(
                "relative z-10 w-full max-w-md bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl transition-all duration-700 transform flex-shrink-0",
                showContent ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-95"
            )}>
                {/* Daily Goal Badge (Floating) */}
                {stats.dailyGoalAchieved && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 font-black text-xs px-6 py-2 rounded-full shadow-xl animate-bounce tracking-widest uppercase">
                        Daily Goal Reached! 🎉
                    </div>
                )}

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-gray-900 mb-2 mt-4">Awesome Work!</h2>
                    <p className="text-gray-500 font-bold">You're making great progress today.</p>
                </div>

                {/* Achievement Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {/* Diamonds */}
                    <div className="bg-blue-50 p-5 rounded-3xl border-2 border-blue-100 flex flex-col items-center text-center group active:scale-95 transition-transform">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-3 text-blue-500 group-hover:rotate-12 transition-transform">
                            <Gem size={28} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-black text-blue-900">+{stats.diamondsEarned}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Diamonds</span>
                    </div>

                    {/* Streak */}
                    <div className="bg-orange-50 p-5 rounded-3xl border-2 border-orange-100 flex flex-col items-center text-center group active:scale-95 transition-transform">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-3 text-orange-500 group-hover:scale-110 transition-transform">
                            <Flame size={28} fill="currentColor" />
                        </div>
                        <span className="text-2xl font-black text-orange-900">{stats.streakEarned ? "Streak Up!" : "Keep it up"}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Daily Streak</span>
                    </div>
                </div>

                {/* Impact Section */}
                <div className="bg-teal-50 rounded-3xl p-6 border-2 border-teal-100 mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                        <Heart size={80} fill="currentColor" className="text-teal-500" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-teal-600 uppercase tracking-widest">Global Impact</p>
                                <p className="text-lg font-black text-teal-900 leading-none">{stats.minutesToday} mins learned</p>
                            </div>
                        </div>

                        <p className="text-sm font-bold text-teal-800/80 leading-relaxed italic">
                            "You just funded {stats.minutesToday} minutes of education for a child in need. Your learning empowers others."
                        </p>

                        <div className="mt-4 pt-4 border-t border-teal-200/50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-teal-500">
                            <span>Week total: {stats.minutesThisWeek} mins</span>
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i < 3 ? "bg-teal-500" : "bg-teal-200")} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={onContinue}
                    className="w-full h-16 text-xl font-black shadow-2xl rounded-2xl bg-teal-600 hover:bg-teal-700 group"
                >
                    <span className="mr-2">{buttonText}</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
    );
}
