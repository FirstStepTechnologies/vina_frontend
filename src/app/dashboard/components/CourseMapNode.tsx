"use client";

import { Check, Lock } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Lesson } from "@/lib/api/types";

interface CourseMapNodeProps {
    lesson: Lesson;
    state: "locked" | "active" | "completed";
    onClick: () => void;
    isLast?: boolean;
    labelPosition?: "left" | "right";
}

export function CourseMapNode({ lesson, state, onClick, isLast, labelPosition = "right" }: CourseMapNodeProps) {
    return (
        <div className="relative flex flex-col items-center z-10">
            <button
                onClick={onClick}
                disabled={state === "locked"}
                className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-700 relative z-10 group shrink-0",
                    // Active: The Glowing Star (Light Mode)
                    state === "active" && "bg-white scale-125 shadow-[0_0_40px_rgba(20,184,166,0.25)] ring-12 ring-teal-500/5",
                    // Completed: The Filled Essence (Light Mode)
                    state === "completed" && "bg-white/40 backdrop-blur-md border-[2px] border-teal-500/20 shadow-sm",
                    // Locked: Ghostly Light Grey Disc (Light Mode)
                    state === "locked" && "bg-white/20 backdrop-blur-sm border-[2px] border-white/40"
                )}
            >
                {/* Active Inner Glow Halo */}
                {state === "active" && (
                    <div className="absolute inset-0 rounded-full bg-teal-400/10 animate-pulse blur-xl" />
                )}

                {state === "active" ? (
                    <div className="relative w-11 h-11 z-10">
                        <Image
                            src="/assets/Vina Logo.png"
                            alt="Current Lesson"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                ) : state === "completed" ? (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-sm">
                        <Check size={28} strokeWidth={4} className="text-white" />
                    </div>
                ) : (
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                        <Lock size={22} className="text-teal-900/20" />
                    </div>
                )}
            </button>

            {/* Lesson Label - Light Mode */}
            <div className={cn(
                "absolute top-1/2 -translate-y-1/2 w-[180px] transition-all duration-500 pointer-events-none",
                labelPosition === "right" ? "left-[130px] text-left" : "right-[130px] text-right",
                state === "locked" ? "opacity-30" : "opacity-100"
            )}>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-600 mb-0.5">
                    Level {lesson.lessonNumber}
                </p>
                <p className="text-[15px] font-black text-teal-950 leading-tight">
                    {lesson.shortTitle}
                </p>
            </div>
        </div>
    );
}
