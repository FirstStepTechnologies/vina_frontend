"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/contexts/ProgressContext";
import { useUser } from "@/contexts/UserContext";
import { ApiService } from "@/lib/api/service";
import { Lesson } from "@/lib/api/types";
import { CourseMapNode } from "./components/CourseMapNode";

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
    const ROW_HEIGHT = 120; // Vertical spacing
    const AMPLITUDE = 80;   // Horizontal sway
    const CENTER_X = 50;    // Percent

    // Helper to calculate position for a node index
    const getNodePosition = (index: number) => {
        const y = index * ROW_HEIGHT + 60; // Add top padding
        // Sine wave for x
        const xOffset = Math.sin(index * 0.8) * AMPLITUDE;

        return { x: `calc(${CENTER_X}% + ${xOffset}px)`, y, xOffset };
    };

    // Generate SVG path string
    const generatePath = () => {
        if (lessons.length === 0) return "";
        let path = "";

        // We assume a base width of 400 for SVG calculation
        // Center is 200

        lessons.forEach((_, i) => {
            const pos = getNodePosition(i);
            const svgX = 200 + pos.xOffset;
            const svgY = pos.y + 40; // Center of node (roughly, node is 80px tall)

            if (i === 0) {
                path += `M ${svgX} ${svgY}`;
            } else {
                const prevPos = getNodePosition(i - 1);
                const prevSvgX = 200 + prevPos.xOffset;
                const prevSvgY = prevPos.y + 40;

                // Bezier curve control points
                const cp1x = prevSvgX;
                const cp1y = prevSvgY + (ROW_HEIGHT / 2);
                const cp2x = svgX;
                const cp2y = svgY - (ROW_HEIGHT / 2);

                path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${svgX} ${svgY}`;
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
        <div className="flex flex-col min-h-screen relative bg-gray-50/50">
            {/* Header */}
            <div className="pt-8 px-6 pb-6 glass-panel sticky top-0 z-50 border-b border-white/50 backdrop-blur-xl">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-800 to-teal-600">
                            LLM Foundations
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">Your learning path</p>
                    </div>
                </div>
                <div className="mt-2 flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{Math.round((progress.completedLessons.length / 17) * 100)}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100/80 rounded-full overflow-hidden shadow-inner border border-gray-100">
                        <div
                            className="h-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-1000 ease-out relative"
                            style={{ width: `${(progress.completedLessons.length / 17) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse-slow" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Map Area */}
            <div className="flex-1 relative overflow-hidden" ref={containerRef}>
                <div className="relative w-full max-w-md mx-auto" style={{ height: totalHeight }}>

                    {/* S-Curve Path SVG */}
                    <svg
                        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                        viewBox={`0 0 400 ${totalHeight}`}
                        preserveAspectRatio="xMidYMin slice"
                    >
                        {/* Shadow path for depth */}
                        <path
                            d={generatePath()}
                            fill="none"
                            stroke="rgba(0,0,0,0.1)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            className="translate-y-1"
                        />
                        {/* Main path */}
                        <path
                            d={generatePath()}
                            fill="none"
                            stroke="url(#pathGradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray="12 12"
                            className="animate-[dash_60s_linear_infinite]"
                        />
                        <defs>
                            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#14B8A6" />
                                <stop offset="50%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                        </defs>
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
                                className="absolute transform -translate-x-1/2 flex flex-col items-center justify-center w-[120px]"
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
                                />
                                {/* Floating decoration occasionally */}
                                {index % 4 === 0 && index !== 0 && (
                                    <div className={`absolute ${index % 2 === 0 ? '-left-12' : '-right-12'} top-4 text-2xl -z-10 opacity-50 animate-float`}>
                                        {['☁️', '✨', '🚀', '🌟'][index % 4]}
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
