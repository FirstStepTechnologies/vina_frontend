"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Gem, Flame, Clock } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { useUser } from "@/contexts/UserContext";
import { ApiService } from "@/lib/api/service";
import { Lesson } from "@/lib/api/types";
import { CourseMapNode } from "./components/CourseMapNode";
import { Button } from "@/components/ui/button";
import { isCourseIntroTemporarilyUnavailable } from "@/lib/course-intro-storage";
import { cn } from "@/lib/utils";
import { ResolutionHUD } from "./components/ResolutionHUD";

interface CourseSummary {
    courseId: string;
    courseName: string;
}

export default function Dashboard() {
    const router = useRouter();
    const { user, isLoading: userLoading } = useUser();
    const { progress, activeCourseId, setActiveCourseId, isLoading: progressLoading } = useProgress();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [activeCourses, setActiveCourses] = useState<CourseSummary[]>([]);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [showSwitcher, setShowSwitcher] = useState(false);
    const activeNodeRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Redirect if not logged in
        if (!userLoading && !user) {
            router.replace("/");
            return;
        }

        // Fetch course map and user's active courses metadata
        async function loadCourseData() {
            if (userLoading || progressLoading || !user) {
                return;
            }

            setDashboardLoading(true);
            setLoadError(null);

            try {
                const allCourses = await ApiService.getCourses() as CourseSummary[];
                const availableCourseIds = allCourses.map((course) => course.courseId).filter(Boolean);
                const progressCourseIds = Object.keys(progress.course_progress || {});
                const resolvedCourseId =
                    activeCourseId ||
                    progress.primary_track_id ||
                    progressCourseIds.find((courseId) => availableCourseIds.includes(courseId)) ||
                    availableCourseIds[0] ||
                    "";

                if (!resolvedCourseId) {
                    setLessons([]);
                    setActiveCourses([]);
                    return;
                }

                if (resolvedCourseId !== activeCourseId) {
                    setActiveCourseId(resolvedCourseId);
                }

                const mapData = await ApiService.getCourseMap(resolvedCourseId);
                setLessons(Array.isArray(mapData) ? mapData : []);

                // Filter to only enrolled courses
                const enrolled = allCourses.filter((course) => progress.course_progress && progress.course_progress[course.courseId]);
                // If the current active course somehow isn't in progress, include it anyway for safety
                if (!enrolled.find((course) => course.courseId === resolvedCourseId)) {
                    const fallback = allCourses.find((course) => course.courseId === resolvedCourseId);
                    if (fallback) enrolled.unshift(fallback);
                }

                setActiveCourses(enrolled);
            } catch (error) {
                console.error("Failed to load dashboard course data", error);
                setLessons([]);
                setActiveCourses([]);
                setLoadError(error instanceof Error ? error.message : "Could not load your course.");
            } finally {
                setDashboardLoading(false);
            }
        }

        loadCourseData();
    }, [
        user,
        userLoading,
        router,
        progressLoading,
        activeCourseId,
        progress.primary_track_id,
        progress.course_progress,
        setActiveCourseId,
    ]);

    // Scroll to active node on load
    useEffect(() => {
        if (activeNodeRef.current) {
            setTimeout(() => {
                activeNodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [lessons]);

    if (userLoading || progressLoading || dashboardLoading) {
        return <div className="min-h-screen pt-20 text-center">Loading...</div>;
    }

    // --- Layout Constants ---
    const ROW_HEIGHT = 140; // Vertical spacing
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
        if (displayLessons.length === 0) return "";
        const startPos = getNodePosition(0);
        const endPos = getNodePosition(displayLessons.length - 1);

        const startY = startPos.y + 40;
        const endY = endPos.y + 40;

        return `M ${CENTER_X} ${startY} L ${CENTER_X} ${endY}`;
    };

    const getLessonState = (lesson: Lesson) => {
        return lesson.status || "locked";
    };

    const hasCompletedCourseIntro = Boolean(
        activeCourseId && progress.course_intro_progress?.[activeCourseId]
    );
    const introTemporarilyUnavailable = Boolean(
        activeCourseId && isCourseIntroTemporarilyUnavailable(activeCourseId)
    );

    const firstLessonId = lessons[0]?.lessonId || null;
    const requireIntroForceLock = !hasCompletedCourseIntro && !introTemporarilyUnavailable;

    const displayLessons = lessons.length > 0 ? [
        ...(!introTemporarilyUnavailable ? [{
            lessonId: "course_intro",
            lessonNumber: 0,
            lessonName: "Course Introduction",
            shortTitle: "Intro",
            topicGroup: "Getting Started",
            estimatedDuration: 5,
            status: hasCompletedCourseIntro ? "completed" : "active",
            prerequisites: [],
        } as Lesson] : []),
        ...lessons.map(lesson => ({
            ...lesson,
            status: requireIntroForceLock ? "locked" : lesson.status
        }))
    ] : [];

    const completedCount = displayLessons.filter(l => l.status === "completed").length;
    const totalCount = displayLessons.length || 1;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    const totalHeight = displayLessons.length * ROW_HEIGHT + 150;

    const currentCourse = activeCourses.find(c => c.courseId === activeCourseId);
    const courseName = currentCourse ? currentCourse.courseName : "Your Active Track";

    const launchLesson = (lessonId: string) => {
        if (!activeCourseId) {
            router.push(`/lesson/${lessonId}`);
            return;
        }

        if (lessonId === "course_intro") {
            if (!introTemporarilyUnavailable) {
                router.push(`/course/${activeCourseId}/intro?next=${firstLessonId}`);
            }
            return;
        }

        router.push(`/lesson/${lessonId}?course=${encodeURIComponent(activeCourseId)}`);
    };

    return (
        <div className="flex flex-col min-h-screen relative bg-[#f0fdfa]">
            {/* Background Aurora Mesh - Light & Airy */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#ccfbf1_0%,transparent_50%),radial-gradient(circle_at_80%_80%,#99f6e420_0%,transparent_50%),radial-gradient(circle_at_50%_50%,#fff_0%,#f0fdfa_100%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-[0.2] pointer-events-none" />

            {/* Header */}
            <div className="pt-8 px-6 pb-6 sticky top-0 z-50 border-b border-teal-100/50 backdrop-blur-2xl">
                <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                        <button
                            onClick={() => setShowSwitcher(!showSwitcher)}
                            className="flex items-center gap-2 group"
                        >
                            <h1 className="text-2xl font-black text-teal-900 drop-shadow-sm leading-none transition-colors group-hover:text-teal-700">
                                {courseName}
                            </h1>
                            <div className={`p-1 bg-teal-100/50 rounded-full transition-transform ${showSwitcher ? 'rotate-180' : ''}`}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-teal-700"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </button>
                        {/* Dropdown Switcher */}
                        {showSwitcher && activeCourses.length > 1 && (
                            <div className="absolute top-full left-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-teal-100 p-2 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <p className="text-[10px] font-black uppercase text-teal-600/60 px-3 py-2 tracking-wider">Switch Track</p>
                                {activeCourses.map(c => (
                                    <button
                                        key={c.courseId}
                                        onClick={() => {
                                            setActiveCourseId(c.courseId);
                                            setShowSwitcher(false);
                                        }}
                                        className={`w-full text-left px-3 py-3 rounded-xl flex items-center justify-between transition-colors ${activeCourseId === c.courseId ? 'bg-teal-50 text-teal-900 font-bold hover:bg-teal-50' : 'hover:bg-gray-50 text-gray-700'}`}
                                    >
                                        <span className="truncate pr-4">{c.courseName}</span>
                                        {activeCourseId === c.courseId && <div className="w-2 h-2 rounded-full bg-teal-500 shadow-sm" />}
                                    </button>
                                ))}
                            </div>
                        )}
                        {showSwitcher && activeCourses.length <= 1 && (
                            <div className="absolute top-full left-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-teal-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                                <p className="text-sm text-gray-600 font-medium mb-3">You do not have any other active tracks.</p>
                                <button
                                    onClick={() => router.push('/portfolio')}
                                    className="w-full bg-teal-50 text-teal-700 text-xs font-bold py-2 rounded-xl transition-colors hover:bg-teal-100"
                                >
                                    Discover Courses
                                </button>
                            </div>
                        )}
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
                            <span className="text-[12px] font-black text-teal-900 tracking-tight">{progress.minutes_today || 0}m</span>
                        </div>
                    </div>
                </div>
                <div className="mt-2 flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-black text-teal-700/80 uppercase tracking-[0.2em]">
                        <span>Progress</span>
                        <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-teal-900/5 rounded-full overflow-hidden border border-teal-100/50">
                        <div
                            className="h-full bg-gradient-to-r from-teal-400 via-blue-400 to-teal-400 transition-all duration-1000 ease-out relative"
                            style={{ width: `${progressPercent}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 animate-pulse-slow" />
                        </div>
                    </div>
                </div>
            </div>

            <ResolutionHUD />



            {!dashboardLoading && displayLessons.length === 0 && (
                <div className="px-6 pt-6">
                    <div className="mx-auto max-w-md rounded-[2rem] border border-teal-100 bg-white/90 p-6 shadow-[0_20px_60px_rgba(20,184,166,0.12)] backdrop-blur-xl">
                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-teal-600/80">
                            Course loading
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-teal-950">
                            We couldn&apos;t populate this dashboard yet
                        </h2>
                                <p className="mt-3 text-sm font-medium leading-relaxed text-teal-800/80">
                            {loadError || "Try re-opening the course from your portfolio, or pick another track while we refresh your lesson map."}
                        </p>
                        <div className="mt-5 flex gap-3">
                            <Button
                                className="h-12 flex-1 text-sm font-black"
                                onClick={() => router.push("/portfolio")}
                            >
                                Back to portfolio
                            </Button>
                            <Button
                                variant="outline"
                                className="h-12 flex-1 text-sm font-black"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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
                    {displayLessons.map((lesson, index) => {
                        const state = getLessonState(lesson);
                        const pos = getNodePosition(index);
                        const isLast = index === displayLessons.length - 1;

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
                                    onClick={() => launchLesson(lesson.lessonId)}
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
