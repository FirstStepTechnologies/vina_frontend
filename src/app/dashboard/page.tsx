"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Gem, Flame, Clock } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { useUser } from "@/contexts/UserContext";
import { ApiService } from "@/lib/api/service";
import { Lesson } from "@/lib/api/types";
import { CourseMapNode } from "./components/CourseMapNode";
import { cn } from "@/lib/utils";
import { ResolutionHUD } from "./components/ResolutionHUD";

export default function Dashboard() {
    const router = useRouter();
    const { user, isLoading: userLoading } = useUser();
    const { progress, isLoading: progressLoading } = useProgress();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const activeNodeRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Redirect if not logged in
        if (!userLoading && !user) {
            router.replace("/");
            return;
        }

        // Fetch course map
        async function loadCourse() {
            const data = await ApiService.getCourseMap();
            setLessons(data);
        }
        loadCourse();
    }, [user, userLoading, router]);

    // Scroll to active node on load
    useEffect(() => {
        if (activeNodeRef.current) {
            setTimeout(() => {
                activeNodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [lessons, progress.currentLessonId]);

    if (userLoading || progressLoading) return <div className="min-h-screen pt-20 text-center">Loading...</div>;

    // --- Layout Constants ---
    const ROW_HEIGHT = 140; // Vertical spacing
    const AMPLITUDE = 0;   // No horizontal sway - Straight line
    const CENTER_X = 25;    // Shifted left (25%) to provide ample room for labels on the right

    // Helper to calculate position for a node index
    const getNodePosition = (index: number) => {
        const y = index * ROW_HEIGHT + 100;
        const x = CENTER_X; // Static center
        const xOffset = 0;

        return { x: `${x}%`, y, xOffset };
    };

    // Generate SVG path string - Simplified straight line
    const generatePath = () => {
        if (lessons.length === 0) return "";
        const startPos = getNodePosition(0);
        const endPos = getNodePosition(lessons.length - 1);

        const startY = startPos.y + 40;
        const endY = endPos.y + 40;

        return `M ${CENTER_X} ${startY} L ${CENTER_X} ${endY}`;
    };

    const getLessonState = (lesson: Lesson) => {
        if (progress.completedLessons.includes(lesson.lessonId)) return "completed";
        const prereqsMet = lesson.prerequisites.length === 0 ||
            lesson.prerequisites.every(id => progress.completedLessons.includes(id));

        if (prereqsMet) {
            const firstIncomplete = lessons.find(l => !progress.completedLessons.includes(l.lessonId));
            if (firstIncomplete?.lessonId === lesson.lessonId) return "active";
        }
        return "locked";
    };

    const totalHeight = lessons.length * ROW_HEIGHT + 150;

    return (
        <div className="flex flex-col min-h-screen relative bg-[#f0fdfa]">
            {/* Background Aurora Mesh - Light & Airy */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#ccfbf1_0%,transparent_50%),radial-gradient(circle_at_80%_80%,#99f6e420_0%,transparent_50%),radial-gradient(circle_at_50%_50%,#fff_0%,#f0fdfa_100%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-[0.2] pointer-events-none" />

            {/* Header */}
            <div className="pt-8 px-6 pb-6 sticky top-0 z-50 border-b border-teal-100/50 backdrop-blur-2xl">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-teal-900 drop-shadow-sm leading-none">
                            LLM Foundations
                        </h1>
                        <p className="text-sm text-teal-600/70 font-medium mt-1">Your learning path</p>
                    </div>
                    <div className="flex items-center gap-1.5" id="tour-stats">
                        {/* Diamonds */}
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl px-2.5 py-1.5 border border-blue-100 flex items-center gap-1.5 shadow-sm ring-1 ring-blue-50/50">
                            <div className="w-5 h-5 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                <Gem size={13} fill="#3b82f6" fillOpacity={0.2} className="text-blue-500" strokeWidth={2.5} />
                            </div>
                            <span className="text-[12px] font-black text-blue-900 tracking-tight">{progress.diamonds || 0}</span>
                        </div>
                        {/* Streak */}
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl px-2.5 py-1.5 border border-orange-100 flex items-center gap-1.5 shadow-sm ring-1 ring-orange-50/50">
                            <div className="w-5 h-5 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                                <Flame size={13} fill="#f97316" fillOpacity={0.2} className="text-orange-500" strokeWidth={2.5} />
                            </div>
                            <span className="text-[12px] font-black text-orange-900 tracking-tight">{progress.streak || 0}</span>
                        </div>
                        {/* Minutes Today */}
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl px-2.5 py-1.5 border border-teal-100 flex items-center gap-1.5 shadow-sm ring-1 ring-teal-50/50">
                            <div className="w-5 h-5 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                                <Clock size={13} className="text-teal-600" strokeWidth={2.5} />
                            </div>
                            <span className="text-[12px] font-black text-teal-900 tracking-tight">{progress.minutesToday || 0}m</span>
                        </div>
                    </div>
                </div>
                <div className="mt-2 flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-black text-teal-700/80 uppercase tracking-[0.2em]">
                        <span>Progress</span>
                        <span>{Math.round((progress.completedLessons.length / 17) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-teal-900/5 rounded-full overflow-hidden border border-teal-100/50">
                        <div
                            className="h-full bg-gradient-to-r from-teal-400 via-blue-400 to-teal-400 transition-all duration-1000 ease-out relative"
                            style={{ width: `${(progress.completedLessons.length / 17) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 animate-pulse-slow" />
                        </div>
                    </div>
                </div>
            </div>

            <ResolutionHUD />

            {/* Scrollable Map Area */}
            <div className="flex-1 relative overflow-hidden" ref={containerRef} id="tour-path">
                <div className="relative w-full max-w-md mx-auto" style={{ height: totalHeight }}>

                    {/* Magical Path SVG */}
                    <svg
                        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                        viewBox={`0 0 100 ${totalHeight}`}
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <filter id="fuzzy" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
                            </filter>
                            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.4" />
                                <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.4" />
                            </linearGradient>
                        </defs>

                        {/* Wide Mist - Aurora Glow (Light Mode) */}
                        <path
                            d={generatePath()}
                            fill="none"
                            stroke="url(#pathGradient)"
                            strokeWidth="15"
                            strokeLinecap="round"
                            filter="url(#fuzzy)"
                            className="opacity-30"
                        />

                        {/* Vibrant Core */}
                        <path
                            d={generatePath()}
                            fill="none"
                            stroke="url(#pathGradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            className="opacity-50"
                        />

                        {/* Sparkling Light Streak */}
                        <path
                            d={generatePath()}
                            fill="none"
                            stroke="#0D9488"
                            strokeWidth="0.5"
                            strokeLinecap="round"
                            strokeDasharray="1 10"
                            className="opacity-40 animate-[sparkle_20s_linear_infinite]"
                        />
                    </svg>

                    {/* Nodes */}
                    {lessons.map((lesson, index) => {
                        const state = getLessonState(lesson);
                        const pos = getNodePosition(index);
                        const isLast = index === lessons.length - 1;

                        return (
                            <div
                                key={lesson.lessonId}
                                ref={state === 'active' ? activeNodeRef : null}
                                className="absolute transform -translate-x-1/2 flex flex-col items-center justify-start w-[80px]"
                                style={{
                                    left: pos.x,
                                    top: pos.y,
                                }}
                            >
                                <CourseMapNode
                                    lesson={lesson}
                                    state={state}
                                    onClick={() => router.push(`/lesson/${lesson.lessonId}`)}
                                    isLast={isLast}
                                    labelPosition="right"
                                />
                                {/* Scaterred Clouds and Decorations */}
                                {index % 2 === 0 && (
                                    <div
                                        className={cn(
                                            "absolute -z-10 opacity-30 animate-float pointer-events-none",
                                            index % 4 === 0 ? "-left-24 text-4xl" : "-right-24 text-3xl",
                                            index % 3 === 0 ? "top-0" : "top-10"
                                        )}
                                        style={{ animationDelay: `${index * 0.5}s`, animationDuration: `${5 + (index % 3)}s` }}
                                    >
                                        {['☁️', '☁️', '✨', '☁️'][index % 4]}
                                    </div>
                                )}
                                {index % 3 === 0 && (
                                    <div
                                        className={cn(
                                            "absolute -z-10 opacity-20 animate-float pointer-events-none",
                                            index % 2 === 0 ? "-right-32 text-6xl" : "-left-32 text-5xl",
                                            "top-20"
                                        )}
                                        style={{ animationDelay: `${index * 0.7}s`, animationDuration: `${7 + (index % 2)}s` }}
                                    >
                                        ☁️
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
