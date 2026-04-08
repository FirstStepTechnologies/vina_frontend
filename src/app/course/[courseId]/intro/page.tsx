"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Compass, Sparkles } from "lucide-react";
import { ApiService } from "@/lib/api/service";
import { CourseIntro, Lesson } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VideoPlayer } from "@/app/lesson/[id]/components/VideoPlayer";
import { useProgress } from "@/contexts/ProgressContext";
import { useUser } from "@/contexts/UserContext";
import {
    markCourseIntroCompleted,
    markCourseIntroUnavailable,
} from "@/lib/course-intro-storage";
import { trackEvent } from "@/lib/analytics";

type IntroStep = "hook" | "orientation";

function buildLessonHref(courseId: string, lessonId: string) {
    return `/lesson/${lessonId}?course=${encodeURIComponent(courseId)}`;
}

export default function CourseIntroPage() {
    const params = useParams<{ courseId: string }>();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoading: userLoading } = useUser();
    const { setActiveCourseId, completeCourseIntro, isLoading: progressLoading } = useProgress();

    const [courseIntro, setCourseIntro] = useState<CourseIntro | null>(null);
    const [courseMap, setCourseMap] = useState<Lesson[]>([]);
    const [currentStep, setCurrentStep] = useState<IntroStep>("hook");
    const [isLoading, setIsLoading] = useState(true);
    const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

    const introStarted = useRef(false);

    const nextLessonId = useMemo(
        () => searchParams.get("next") || courseMap[0]?.lessonId || null,
        [courseMap, searchParams]
    );

    useEffect(() => {
        if (userLoading || progressLoading) return;
        if (!user) {
            router.replace("/");
            return;
        }

        let isCancelled = false;

        async function loadIntro() {
            try {
                setIsLoading(true);
                setActiveCourseId(params.courseId);

                const [mapData, introData] = await Promise.all([
                    ApiService.getCourseMap(params.courseId),
                    ApiService.getCourseIntro(params.courseId),
                ]);

                if (isCancelled) return;

                setCourseMap(mapData);

                if (!introData) {
                    markCourseIntroUnavailable(params.courseId);
                    trackEvent("course_intro_unavailable", {
                        course_id: params.courseId,
                    });
                    setFallbackMessage("Course intro is not ready yet. Starting the lesson experience instead.");

                    const lessonId = searchParams.get("next") || mapData[0]?.lessonId;
                    if (lessonId) {
                        window.setTimeout(() => {
                            router.replace(buildLessonHref(params.courseId, lessonId));
                        }, 700);
                    } else {
                        router.replace("/dashboard");
                    }
                    return;
                }

                setCourseIntro(introData);
            } catch (error) {
                if (isCancelled) return;
                console.error("Failed to load course intro", error);
                markCourseIntroUnavailable(params.courseId);
                setFallbackMessage("We could not load the intro right now. Taking you straight to the lesson.");

                if (nextLessonId) {
                    window.setTimeout(() => {
                        router.replace(buildLessonHref(params.courseId, nextLessonId));
                    }, 700);
                } else {
                    router.replace("/dashboard");
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadIntro();

        return () => {
            isCancelled = true;
        };
    }, [
        nextLessonId,
        params.courseId,
        progressLoading,
        router,
        searchParams,
        setActiveCourseId,
        user,
        userLoading,
    ]);

    useEffect(() => {
        if (!courseIntro || introStarted.current) return;
        introStarted.current = true;
        trackEvent("course_intro_started", {
            course_id: params.courseId,
        });
    }, [courseIntro, params.courseId]);

    async function finishIntro() {
        markCourseIntroCompleted(params.courseId);
        await completeCourseIntro(params.courseId);
        trackEvent("course_intro_completed", {
            course_id: params.courseId,
        });

        if (nextLessonId) {
            router.replace(buildLessonHref(params.courseId, nextLessonId));
            return;
        }

        router.replace("/dashboard");
    }

    if (userLoading || progressLoading || isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
                <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
                    <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-teal-300" />
                    <h1 className="text-2xl font-black">Preparing your course intro</h1>
                    <p className="mt-3 text-sm font-medium text-white/70">
                        Loading the hook and orientation for this course.
                    </p>
                </div>
            </div>
        );
    }

    if (fallbackMessage) {
        return (
            <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
                <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-teal-300">
                        <Compass size={24} />
                    </div>
                    <h1 className="text-2xl font-black">Starting your course</h1>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-white/70">
                        {fallbackMessage}
                    </p>
                    <div className="mt-6">
                        <Button
                            className="h-14 w-full text-base font-black"
                            onClick={() => {
                                if (nextLessonId) {
                                    router.replace(buildLessonHref(params.courseId, nextLessonId));
                                } else {
                                    router.replace("/dashboard");
                                }
                            }}
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!courseIntro) return null;

    const isHook = currentStep === "hook";
    const video = isHook ? courseIntro.hook : courseIntro.orientation;

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="sticky top-0 z-20 bg-gradient-to-b from-black/90 via-black/55 to-transparent px-4 pb-10 pt-4">
                <div className="mx-auto flex max-w-3xl items-start justify-between gap-4">
                    <button
                        onClick={() => router.back()}
                        className="rounded-full bg-white/10 p-2.5 text-white ring-1 ring-white/15 transition-all hover:bg-white/20"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div className="text-right">
                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-teal-300">
                            Start here
                        </p>
                        <h1 className="mt-1 text-lg font-black leading-tight">
                            {isHook ? "Course hook" : "Course orientation"}
                        </h1>
                        <p className="mt-1 text-xs font-medium text-white/70">
                            {isHook ? "1 of 2" : "2 of 2"} • {video.durationSeconds ? `${Math.max(1, Math.round(video.durationSeconds / 60))} min` : "Quick start"}
                        </p>
                    </div>
                </div>
            </header>

            <div className="relative flex flex-col flex-1 pb-10">
                <VideoPlayer
                    key={currentStep}
                    src={video.videoUrl}
                    onEnded={() => {
                        if (isHook) {
                            setCurrentStep("orientation");
                        } else {
                            finishIntro();
                        }
                    }}
                    autoPlay
                    className="h-[calc(100vh-140px)] w-full max-w-4xl mx-auto rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl"
                />
            </div>
        </div>
    );
}
