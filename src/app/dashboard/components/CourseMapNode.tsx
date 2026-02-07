"use client";

import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lesson } from "@/lib/api/types";

interface CourseMapNodeProps {
    lesson: Lesson;
    state: "locked" | "active" | "completed";
    onClick: () => void;
    isLast?: boolean;
}

export function CourseMapNode({ lesson, state, onClick, isLast }: CourseMapNodeProps) {
    return (
        <div className="relative flex flex-col items-center z-10">
            <button
                onClick={onClick}
                disabled={state === "locked"}
                className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 group",
                    state === "completed" && "bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30 scale-100",
                    state === "active" && "bg-white text-teal-700 ring-4 ring-teal-100 shadow-[0_0_30px_rgba(20,184,166,0.4)] scale-110",
                    state === "locked" && "glass-panel bg-white/40 text-gray-300 border-2 border-white/50"
                )}
            >
                {/* Active Indicator Ring */}
                {state === "active" && (
                    <span className="absolute inset-0 rounded-full border-2 border-teal-500 animate-ping opacity-20" />
                )}

                {state === "completed" ? (
                    <Check size={32} strokeWidth={3} className="drop-shadow-md" />
                ) : state === "locked" ? (
                    <Lock size={24} />
                ) : (
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-teal-600 to-blue-600">
                        {lesson.lessonNumber}
                    </span>
                )}
            </button>

            {/* Lesson Label */}
            <div className={cn(
                "mt-3 text-center transition-opacity duration-300 max-w-[120px]",
                state === "locked" ? "opacity-50 grayscale" : "opacity-100"
            )}>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-0.5">
                    L{lesson.lessonNumber.toString().padStart(2, '0')}
                </p>
                <p className="text-sm font-bold text-gray-800 leading-tight">
                    {lesson.shortTitle}
                </p>
            </div>

            {/* Vina "V" connector hint (optional decoration) */}
            {!isLast && (
                <div className="absolute top-16 h-16 w-0.5 bg-gray-200 -z-10 translate-y-2" />
            )}
        </div>
    );
}
