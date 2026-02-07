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

    const getLessonState = (lesson: Lesson) => {
        if (progress.completedLessons.includes(lesson.lessonId)) return "completed";

        // Check if prerequisites are met
        const prereqsMet = lesson.prerequisites.length === 0 ||
            lesson.prerequisites.every(id => progress.completedLessons.includes(id));

        // Also check if it's the specific "current" lesson derived from progress
        // For simplicity: if not completed and prereqs met, it's active.
        // If multiple meet this (e.g. strict linear), usually only first one is active.
        // We can use the 'next available' logic

        if (prereqsMet) {
            // Is this the *first* incomplete lesson?
            const firstIncomplete = lessons.find(l => !progress.completedLessons.includes(l.lessonId));
            if (firstIncomplete?.lessonId === lesson.lessonId) return "active";

            // If later than first incomplete but prereqs met (rare in linear course), technically unlocked but we focus user on one.
            // Let's treat it as locked visually or strictly check against currentLessonId
            return "locked";
        }

        return "locked";
    };

    return (
        <div className="flex flex-col min-h-screen relative">
            {/* Background Mesh (Global style handles it, but we can add specific accent blobs if needed) */}

            {/* Course Header */}
            <div className="pt-8 px-6 pb-6 glass-panel sticky top-0 z-20 border-b border-white/50 backdrop-blur-xl">
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

            {/* Map Content */}
            <div className="flex-1 px-6 py-10 relative">
                {/* Vertical Path Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1.5 bg-gradient-to-b from-teal-100 via-blue-100 to-teal-100 -translate-x-1/2 -z-0 rounded-full" />

                <div className="space-y-12 relative z-10">
                    {lessons.map((lesson, index) => {
                        const state = getLessonState(lesson);
                        const isLast = index === lessons.length - 1;

                        return (
                            <div
                                key={lesson.lessonId}
                                ref={state === 'active' ? activeNodeRef : null}
                                className="flex justify-center"
                            >
                                <CourseMapNode
                                    lesson={lesson}
                                    state={state}
                                    onClick={() => router.push(`/lesson/${lesson.lessonId}`)}
                                    isLast={isLast}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
