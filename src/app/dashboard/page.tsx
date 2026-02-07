"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/contexts/ProgressContext";
import { useUser } from "@/contexts/UserContext";
import { ApiService } from "@/lib/api/service";
import { Lesson } from "@/lib/api/types";
import { CourseMapNode } from "./components/CourseMapNode";
import { cn } from "@/lib/utils";

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
    const AMPLITUDE = 22;   // Horizontal sway in % (Total width 100%)
    const CENTER_X = 50;    // Center in %

    // Helper to calculate position for a node index
    const getNodePosition = (index: number) => {
        const y = index * ROW_HEIGHT + 100;
        // Sine wave for xOffset in %
        const xOffset = Math.sin(index * 0.8) * AMPLITUDE;
        const x = CENTER_X + xOffset;

        return { x: `${x}%`, y, xOffset };
    };

    // Generate SVG path string
    const generatePath = () => {
        if (lessons.length === 0) return "";
        let path = "";

        lessons.forEach((_, i) => {
            const pos = getNodePosition(i);
            const svgX = CENTER_X + pos.xOffset;
            const svgY = pos.y + 40; // Center of node

            if (i === 0) {
                path += `M ${svgX} ${svgY}`;
            } else {
                const prevPos = getNodePosition(i - 1);
                const prevSvgX = CENTER_X + prevPos.xOffset;
                const prevSvgY = prevPos.y + 40;

                const cp1y = prevSvgY + (ROW_HEIGHT / 2);
                const cp2y = svgY - (ROW_HEIGHT / 2);

                path += ` C ${prevSvgX} ${cp1y}, ${svgX} ${cp2y}, ${svgX} ${svgY}`;
            }
        });
        return path;
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
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h1 className="text-2xl font-black text-teal-900 drop-shadow-sm">
                            LLM Foundations
                        </h1>
                        <p className="text-sm text-teal-600/70 font-medium">Your learning path</p>
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

            {/* Scrollable Map Area */}
            <div className="flex-1 relative overflow-hidden" ref={containerRef}>
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
                                    labelPosition={pos.xOffset > 0 ? "left" : "right"}
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
