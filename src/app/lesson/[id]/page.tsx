"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Lightbulb,
    Sparkles,
} from "lucide-react";
import { ApiService } from "@/lib/api/service";
import {
    Lesson,
    LessonExperienceManifest,
    LessonQuiz,
    LessonResource,
    QuizQuestion as QuizQuestionType,
} from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuizQuestion } from "@/components/ui/quiz-question";
import { VideoPlayer } from "./components/VideoPlayer";
import { useProgress } from "@/contexts/ProgressContext";
import { useUser } from "@/contexts/UserContext";
import { trackEvent } from "@/lib/analytics";
import { isCourseIntroTemporarilyUnavailable } from "@/lib/course-intro-storage";
import { getLearnerContext, getLessonExperienceContexts } from "@/lib/learner-context";
import {
    buildLessonSteps,
    CheckpointOutcome,
    clearLessonExperienceSession,
    createDefaultLessonExperienceSession,
    formatLessonDuration,
    getCoreSegments,
    LessonExperienceStep,
    readLessonExperienceSession,
    toCheckpointQuizQuestion,
    writeLessonExperienceSession,
} from "@/lib/lesson-experience";
import { cn } from "@/lib/utils";

type QuizResultState = "passed" | "failed" | null;

function getStepTitle(step: LessonExperienceStep | null, fallbackTitle: string) {
    if (!step) return fallbackTitle;

    if (step.kind === "segment") return step.segment.title;
    if (step.kind === "checkpoint") return "Quick checkpoint";
    if (step.kind === "micro_interaction") {
        return step.interaction.interaction_type === "predict"
            ? "Make your prediction"
            : "Reflect before you move on";
    }
    if (step.kind === "quiz") return "Final quiz";
    if (step.kind === "takeaway") return "Takeaway";
    if (step.kind === "resources") return "Resources";
    if (step.kind === "completion") return "Lesson complete";
    return fallbackTitle;
}

function getResourceOpenUrl(resource: LessonResource) {
    const rawUrl = resource.url;
    if (!rawUrl) return null;

    const isEditableTemplate = resource.kind === "template" || resource.kind === "worksheet";
    if (!isEditableTemplate) {
        return ApiService.buildApiUrl(rawUrl);
    }

    if (rawUrl.endsWith(".md")) {
        return ApiService.buildApiUrl(rawUrl.replace(/\.md$/, ".docx"));
    }

    if (rawUrl.endsWith(".csv")) {
        return ApiService.buildApiUrl(rawUrl.replace(/\.csv$/, ".xlsx"));
    }

    return ApiService.buildApiUrl(rawUrl);
}

export default function LessonPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const { user, isLoading: userLoading } = useUser();
    const {
        activeCourseId,
        setActiveCourseId,
        progress,
        isLoading: progressLoading,
        completeLesson,
        addMinutes,
        addDiamonds,
    } = useProgress();

    const [courseMap, setCourseMap] = useState<Lesson[]>([]);
    const [manifest, setManifest] = useState<LessonExperienceManifest | null>(null);
    const [lessonQuiz, setLessonQuiz] = useState<LessonQuiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quizLoading, setQuizLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quizResult, setQuizResult] = useState<QuizResultState>(null);
    const [sessionState, setSessionState] = useState<ReturnType<typeof createDefaultLessonExperienceSession> | null>(null);
    const [experienceContext, setExperienceContext] = useState<ReturnType<typeof getLearnerContext>>(null);

    const trackedExperienceStart = useRef<string | null>(null);
    const trackedStepId = useRef<string | null>(null);
    const trackedQuizStart = useRef<string | null>(null);
    const quizRequestInFlight = useRef(false);

    const learnerContext = useMemo(() => getLearnerContext(user), [user]);
    const requestedCourseId = searchParams.get("course") || "";
    const resolvedCourseId = activeCourseId || requestedCourseId || progress.primary_track_id || "";
    const lessonExperienceContexts = useMemo(
        () => getLessonExperienceContexts(user, resolvedCourseId),
        [resolvedCourseId, user]
    );
    const lessonMeta = useMemo(
        () => courseMap.find((lesson) => lesson.lessonId === params.id) || null,
        [courseMap, params.id]
    );

    const steps = useMemo(() => {
        if (!manifest) return [];
        return buildLessonSteps(manifest, sessionState?.checkpointOutcome || null);
    }, [manifest, sessionState?.checkpointOutcome]);

    const currentStep = useMemo(() => {
        if (!sessionState) return null;
        return steps.find((step) => step.id === sessionState.currentStepId) || null;
    }, [sessionState, steps]);

    const firstCoreSegment = useMemo(
        () => (manifest ? getCoreSegments(manifest)[0] : null),
        [manifest]
    );
    const nextLesson = useMemo(() => {
        if (!lessonMeta) return null;
        const currentIndex = courseMap.findIndex((lesson) => lesson.lessonId === lessonMeta.lessonId);
        return currentIndex >= 0 ? courseMap[currentIndex + 1] || null : null;
    }, [courseMap, lessonMeta]);

    const buildLessonHref = (lessonId: string) => {
        if (!resolvedCourseId) {
            return `/lesson/${lessonId}`;
        }
        return `/lesson/${lessonId}?course=${encodeURIComponent(resolvedCourseId)}`;
    };

    useEffect(() => {
        if (userLoading || progressLoading) return;
        if (!user) {
            router.replace("/");
            return;
        }
        if (!learnerContext) {
            router.replace("/profession");
            return;
        }
        if (requestedCourseId && requestedCourseId !== activeCourseId) {
            setActiveCourseId(requestedCourseId);
        }
        if (!resolvedCourseId) {
            setError("We couldn't determine which course this lesson belongs to.");
            setIsLoading(false);
            return;
        }

        let isCancelled = false;

        async function loadLessonExperience() {
            try {
                setIsLoading(true);
                setError(null);
                setExperienceContext(null);

                const mapData = await ApiService.getCourseMap(resolvedCourseId);
                if (isCancelled) return;
                setCourseMap(mapData);

                const firstLessonId = mapData[0]?.lessonId;
                const hasCompletedCourseIntro = Boolean(
                    resolvedCourseId && progress.course_intro_progress?.[resolvedCourseId]
                );
                const introTemporarilyUnavailable = Boolean(
                    resolvedCourseId && isCourseIntroTemporarilyUnavailable(resolvedCourseId)
                );
                if (
                    firstLessonId &&
                    params.id === firstLessonId &&
                    !hasCompletedCourseIntro &&
                    !introTemporarilyUnavailable
                ) {
                    router.replace(`/course/${resolvedCourseId}/intro?next=${params.id}`);
                    return;
                }

                let data: LessonExperienceManifest | null = null;
                let matchedContext: ReturnType<typeof getLearnerContext> = null;
                let lastError: unknown = null;

                for (const candidateContext of lessonExperienceContexts) {
                    try {
                        data = await ApiService.getLessonExperience(
                            resolvedCourseId,
                            params.id,
                            candidateContext
                        );
                        matchedContext = candidateContext;
                        break;
                    } catch (candidateError) {
                        lastError = candidateError;
                    }
                }

                if (!data || !matchedContext) {
                    throw lastError || new Error("This lesson experience is not available yet.");
                }
                if (isCancelled) return;

                setManifest(data);
                setExperienceContext(matchedContext);
                setLessonQuiz(null);
                setQuizResult(null);

                const restoredSession =
                    readLessonExperienceSession(data.experience_id) ||
                    createDefaultLessonExperienceSession(data);

                setSessionState(restoredSession);

                const now = Date.now();
                sessionStorage.setItem(`lesson_started_at_${params.id}`, now.toString());
            } catch (loadError) {
                if (isCancelled) return;
                console.error("Failed to load lesson experience", loadError);
                setError(loadError instanceof Error ? loadError.message : "This lesson experience is not available yet.");
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadLessonExperience();

        return () => {
            isCancelled = true;
        };
    }, [
        activeCourseId,
        progress.course_intro_progress,
        learnerContext,
        lessonExperienceContexts,
        params.id,
        progressLoading,
        requestedCourseId,
        resolvedCourseId,
        router,
        setActiveCourseId,
        user,
        userLoading,
    ]);

    useEffect(() => {
        if (!manifest || !sessionState) return;
        writeLessonExperienceSession(manifest.experience_id, sessionState);
    }, [manifest, sessionState]);

    useEffect(() => {
        if (!manifest || trackedExperienceStart.current === manifest.experience_id) return;
        trackedExperienceStart.current = manifest.experience_id;

        trackEvent("lesson_experience_started", {
            experience_id: manifest.experience_id,
            lesson_id: manifest.lesson_id,
            course_id: manifest.course_id,
            experience_mode: manifest.experience_mode,
            segment_count: manifest.segment_count,
        });
    }, [manifest]);

    useEffect(() => {
        if (!currentStep || !manifest) return;
        if (trackedStepId.current === currentStep.id) return;

        trackedStepId.current = currentStep.id;

        if (currentStep.kind === "segment") {
            trackEvent("segment_started", {
                experience_id: manifest.experience_id,
                lesson_id: manifest.lesson_id,
                segment_id: currentStep.segment.segment_id,
                segment_number: currentStep.segment.segment_number,
                segment_type: currentStep.segment.segment_type,
                conditional: currentStep.isConditional,
            });
        }

        if (currentStep.kind === "checkpoint") {
            trackEvent("checkpoint_viewed", {
                experience_id: manifest.experience_id,
                lesson_id: manifest.lesson_id,
                interaction_id: currentStep.interaction.interaction_id,
            });
        }

        if (currentStep.kind === "micro_interaction") {
            trackEvent("micro_interaction_viewed", {
                experience_id: manifest.experience_id,
                lesson_id: manifest.lesson_id,
                interaction_id: currentStep.interaction.interaction_id,
                interaction_type: currentStep.interaction.interaction_type,
            });
        }

        if (currentStep.kind === "quiz" && trackedQuizStart.current !== manifest.experience_id) {
            trackedQuizStart.current = manifest.experience_id;
            trackEvent("final_quiz_started", {
                experience_id: manifest.experience_id,
                lesson_id: manifest.lesson_id,
                quiz_id: manifest.final_quiz.quiz_id,
            });
        }
    }, [currentStep, manifest]);

    useEffect(() => {
        if (!manifest || !currentStep || currentStep.kind !== "quiz" || !experienceContext) return;
        if (lessonQuiz || quizRequestInFlight.current) return;

        const currentManifest = manifest;
        const quizContexts = [experienceContext];
        const fallbackContexts = getLessonExperienceContexts(user, currentManifest.course_id);
        for (const candidateContext of fallbackContexts) {
            if (
                candidateContext.profession === experienceContext.profession &&
                candidateContext.industry === experienceContext.industry &&
                candidateContext.experienceLevel === experienceContext.experienceLevel
            ) {
                continue;
            }
            quizContexts.push(candidateContext);
        }
        let isCancelled = false;

        async function loadQuiz() {
            try {
                quizRequestInFlight.current = true;
                setQuizLoading(true);
                let quiz: LessonQuiz | null = null;
                let lastError: unknown = null;

                for (const candidateContext of quizContexts) {
                    try {
                        quiz = await ApiService.getLessonExperienceQuiz(
                            currentManifest.final_quiz.endpoint,
                            candidateContext
                        );
                        break;
                    } catch (candidateError) {
                        lastError = candidateError;
                    }
                }

                if (!quiz) {
                    throw lastError || new Error("The final quiz could not be loaded.");
                }
                if (!isCancelled) {
                    setLessonQuiz(quiz);
                }
            } catch (quizError) {
                if (!isCancelled) {
                    console.error("Failed to load lesson quiz", quizError);
                    setError(quizError instanceof Error ? quizError.message : "The final quiz could not be loaded.");
                }
            } finally {
                quizRequestInFlight.current = false;
                if (!isCancelled) {
                    setQuizLoading(false);
                }
            }
        }

        loadQuiz();

        return () => {
            isCancelled = true;
        };
    }, [currentStep, experienceContext, lessonQuiz, manifest, user]);

    useEffect(() => {
        if (!manifest || !currentStep || currentStep.kind !== "quiz" || !sessionState) return;
        if (sessionState.lessonMinutesAdded) return;

        const minutes = Math.max(1, Math.ceil(manifest.estimated_duration_seconds / 60));
        addMinutes(minutes).catch((syncError) => {
            console.error("Failed to sync lesson minutes", syncError);
        });

        setSessionState((prev) => prev ? { ...prev, lessonMinutesAdded: true } : prev);
    }, [addMinutes, currentStep, manifest, sessionState]);

    useEffect(() => {
        if (!sessionState || !steps.length) return;
        if (steps.some((step) => step.id === sessionState.currentStepId)) return;

        setSessionState((prev) => {
            if (!prev) return prev;
            return { ...prev, currentStepId: steps[0].id };
        });
    }, [sessionState, steps]);

    function goToStep(stepId: string) {
        setQuizResult(null);
        setSessionState((prev) => prev ? { ...prev, currentStepId: stepId } : prev);
    }

    function goToNextStep(fromStepId: string, checkpointOutcome?: CheckpointOutcome) {
        if (!manifest || !sessionState) return;

        const resolvedSteps = buildLessonSteps(
            manifest,
            checkpointOutcome !== undefined ? checkpointOutcome : sessionState.checkpointOutcome
        );
        const index = resolvedSteps.findIndex((step) => step.id === fromStepId);
        const nextStep = index >= 0 ? resolvedSteps[index + 1] : null;

        if (!nextStep) return;
        goToStep(nextStep.id);
    }

    async function handleSegmentEnded(durationSeconds: number) {
        if (!currentStep || currentStep.kind !== "segment" || !manifest) return;

        trackEvent("segment_completed", {
            experience_id: manifest.experience_id,
            lesson_id: manifest.lesson_id,
            segment_id: currentStep.segment.segment_id,
            segment_number: currentStep.segment.segment_number,
            watch_seconds: durationSeconds || currentStep.segment.duration_seconds,
        });

        goToNextStep(currentStep.id);
    }

    function handleCheckpointAnswer(selected: string, isCorrect: boolean) {
        if (!currentStep || currentStep.kind !== "checkpoint" || !manifest) return;

        const outcome: CheckpointOutcome = isCorrect ? "correct" : "incorrect";
        setSessionState((prev) => prev ? {
            ...prev,
            checkpointOutcome: outcome,
            checkpointAnsweredId: selected,
        } : prev);

        trackEvent("checkpoint_answered", {
            experience_id: manifest.experience_id,
            lesson_id: manifest.lesson_id,
            interaction_id: currentStep.interaction.interaction_id,
            selected_option: selected,
            is_correct: isCorrect,
        });
    }

    function handleCheckpointSkip() {
        if (!currentStep || currentStep.kind !== "checkpoint") return;

        setSessionState((prev) => prev ? {
            ...prev,
            checkpointOutcome: "skipped",
            checkpointAnsweredId: null,
        } : prev);
        goToNextStep(currentStep.id, "skipped");
    }

    function handleMicroContinue(interactionId: string, responseText: string) {
        if (!currentStep || currentStep.kind !== "micro_interaction" || !manifest) return;

        setSessionState((prev) => prev ? {
            ...prev,
            microResponses: {
                ...prev.microResponses,
                [interactionId]: responseText,
            },
        } : prev);

        trackEvent("micro_interaction_submitted", {
            experience_id: manifest.experience_id,
            lesson_id: manifest.lesson_id,
            interaction_id: interactionId,
            interaction_type: currentStep.interaction.interaction_type,
            response_length: responseText.trim().length,
        });

        goToNextStep(currentStep.id);
    }

    function handleQuizAnswer(question: QuizQuestionType, selected: string, isCorrect: boolean) {
        setSessionState((prev) => {
            if (!prev || prev.quizSelections[question.id]) return prev;

            return {
                ...prev,
                quizSelections: {
                    ...prev.quizSelections,
                    [question.id]: selected,
                },
                quizScore: prev.quizScore + (isCorrect ? 1 : 0),
            };
        });
    }

    async function handleQuizNext() {
        if (!lessonQuiz || !sessionState || !manifest) return;

        const hasMoreQuestions = sessionState.quizCurrentIndex < lessonQuiz.questions.length - 1;
        if (hasMoreQuestions) {
            setSessionState((prev) => prev ? {
                ...prev,
                quizCurrentIndex: prev.quizCurrentIndex + 1,
            } : prev);
            return;
        }

        const score = sessionState.quizScore;
        const total = lessonQuiz.questions.length;
        const passThreshold = lessonQuiz.passThreshold || 2;
        const passed = score >= passThreshold;

        trackEvent("final_quiz_completed", {
            experience_id: manifest.experience_id,
            lesson_id: manifest.lesson_id,
            score,
            total,
            passed,
        });

        if (!passed) {
            setQuizResult("failed");
            return;
        }

        if (!sessionState.completionRecorded) {
            try {
                await completeLesson(params.id, score, total);
                addDiamonds(score * 10);
                setSessionState((prev) => prev ? { ...prev, completionRecorded: true } : prev);
            } catch (completionError) {
                console.error("Failed to complete lesson", completionError);
            }

            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.55 },
            });

            trackEvent("lesson_experience_completed", {
                experience_id: manifest.experience_id,
                lesson_id: manifest.lesson_id,
                score,
                total,
            });
        }

        setQuizResult("passed");
        goToNextStep("quiz");
    }

    function resetQuiz() {
        setQuizResult(null);
        setSessionState((prev) => prev ? {
            ...prev,
            quizCurrentIndex: 0,
            quizScore: 0,
            quizSelections: {},
        } : prev);
    }

    function reviewLesson() {
        if (!firstCoreSegment) return;
        resetQuiz();
        setSessionState((prev) => prev ? {
            ...prev,
            currentStepId: `segment:${firstCoreSegment.segment_id}`,
            checkpointOutcome: null,
            checkpointAnsweredId: null,
        } : prev);
    }

    function finishLesson(destination?: string) {
        if (manifest) {
            clearLessonExperienceSession(manifest.experience_id);
        }

        if (destination) {
            router.push(destination);
            return;
        }

        router.push("/dashboard");
    }

    if (userLoading || progressLoading || isLoading) {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d1fae5_0%,#f8fafc_55%)] px-6 py-16 text-center">
                <div className="mx-auto max-w-sm rounded-[2rem] border border-teal-100 bg-white/80 p-8 shadow-lg shadow-teal-500/10 backdrop-blur-xl">
                    <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600" />
                    <h1 className="text-xl font-black text-teal-950">Preparing your lesson</h1>
                    <p className="mt-2 text-sm font-medium text-teal-700/80">
                        Loading the segmented experience for this lesson.
                    </p>
                </div>
            </div>
        );
    }

    if (error || !manifest || !sessionState) {
        return (
            <div className="min-h-screen bg-slate-950 px-6 py-14 text-white">
                <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
                        <AlertCircle size={24} />
                    </div>
                    <h1 className="text-2xl font-black">Lesson unavailable</h1>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                        {error || "We couldn't load this lesson experience right now."}
                    </p>
                    <div className="mt-7 flex gap-3">
                        <Button
                            className="flex-1"
                            onClick={() => router.push("/dashboard")}
                        >
                            Back to dashboard
                        </Button>
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => window.location.reload()}
                        >
                            Try again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const headerTitle = getStepTitle(currentStep, manifest.title);
    const durationLabel = formatLessonDuration(manifest.estimated_duration_seconds);
    const checkpointQuestion =
        currentStep?.kind === "checkpoint"
            ? toCheckpointQuizQuestion(currentStep.interaction)
            : null;
    const currentQuizQuestion =
        lessonQuiz?.questions[sessionState.quizCurrentIndex] || null;
    const isQuizQuestionAnswered = currentQuizQuestion
        ? Boolean(sessionState.quizSelections[currentQuizQuestion.id])
        : false;

    return (
        <div
            className={cn(
                "min-h-screen",
                currentStep?.kind === "segment"
                    ? "bg-black text-white"
                    : "bg-[radial-gradient(circle_at_top,#d1fae5_0%,#ffffff_60%)] text-gray-900"
            )}
        >
            <div className="relative min-h-screen">
                <header
                    className={cn(
                        "sticky top-0 z-30 px-4 pt-4",
                        currentStep?.kind === "segment"
                            ? "bg-gradient-to-b from-black/85 via-black/50 to-transparent pb-10"
                            : "bg-white/80 pb-4 backdrop-blur-xl"
                    )}
                >
                    <div className="mx-auto flex w-full max-w-3xl items-start justify-between gap-4">
                        <button
                            onClick={() => router.back()}
                            className={cn(
                                "rounded-full p-2.5 transition-all",
                                currentStep?.kind === "segment"
                                    ? "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/20"
                                    : "bg-white text-teal-800 shadow-sm shadow-teal-500/10 ring-1 ring-teal-100 hover:bg-teal-50"
                            )}
                        >
                            <ArrowLeft size={22} />
                        </button>

                        <div className="min-w-0 flex-1 text-right">
                            <p
                                className={cn(
                                    "text-[11px] font-black uppercase tracking-[0.22em]",
                                    currentStep?.kind === "segment" ? "text-teal-300" : "text-teal-600/80"
                                )}
                            >
                                {lessonMeta ? `Lesson ${lessonMeta.lessonNumber}` : "Lesson experience"}
                            </p>
                            <h1
                                className={cn(
                                    "mt-1 text-lg font-black leading-tight",
                                    currentStep?.kind === "segment" ? "text-white" : "text-teal-950"
                                )}
                            >
                                {headerTitle}
                            </h1>

                        </div>
                    </div>

                    {currentStep?.kind === "segment" && (
                        <div className="mx-auto mt-4 w-full max-w-3xl">
                            <div className="mb-2 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.16em] text-white/70">
                                <span>
                                    {currentStep.isConditional
                                        ? "Quick clarification"
                                        : `Segment ${currentStep.coreSegmentIndex} of ${currentStep.coreSegmentCount}`}
                                </span>
                                <span>{currentStep.segment.segment_type}</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 transition-all duration-500"
                                    style={{
                                        width: `${(currentStep.coreSegmentIndex / currentStep.coreSegmentCount) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </header>

                {currentStep?.kind === "pre_lesson" && (
                    <div className="px-6 pb-10 pt-8">
                        <div className="mx-auto max-w-2xl">
                            <Card className="overflow-hidden border border-teal-100 bg-white/90 p-0 shadow-[0_30px_80px_rgba(20,184,166,0.12)]">
                                <div className="bg-[linear-gradient(135deg,#0f766e_0%,#164e63_100%)] px-7 py-8 text-white">
                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-teal-100/80">
                                        Ready to dive in
                                    </p>
                                    <h2 className="mt-3 text-3xl font-black leading-tight">
                                        {manifest.title}
                                    </h2>
                                    <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-white/80">
                                        {currentStep.card.audience_label}
                                    </p>
                                </div>

                                <div className="px-7 py-7">
                                    <div className="rounded-[1.75rem] bg-teal-50 p-5">
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-600">
                                            Your payoff
                                        </p>
                                        <p className="mt-2 text-xl font-black leading-tight text-teal-950">
                                            {currentStep.card.lesson_promise}
                                        </p>
                                    </div>

                                    <div className="mt-5 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                                        <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                                            <Lightbulb size={16} />
                                            Question to hold in your head
                                        </p>
                                        <p className="mt-2 text-lg font-bold leading-relaxed text-slate-900">
                                            {currentStep.card.provocative_question}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between rounded-[1.5rem] border border-teal-100 bg-white px-5 py-4">
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-teal-600/80">
                                                Estimated time
                                            </p>
                                            <p className="mt-1 text-base font-bold text-teal-950">
                                                {currentStep.card.estimated_duration}
                                            </p>
                                        </div>
                                        <Button
                                            className="h-14 px-7 text-base font-black"
                                            onClick={() => goToNextStep(currentStep.id)}
                                        >
                                            Start lesson
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {currentStep?.kind === "segment" && (
                    <div className="absolute inset-0 pt-24">
                        <VideoPlayer
                            key={currentStep.segment.segment_id}
                            src={currentStep.segment.video_url}
                            poster={currentStep.segment.thumbnail_url || undefined}
                            onEnded={handleSegmentEnded}
                            autoPlay
                            className="h-[calc(100vh-6rem)] w-full"
                        />
                    </div>
                )}

                {currentStep?.kind === "checkpoint" && checkpointQuestion && (
                    <div className="px-6 pb-10 pt-8">
                        <div className="mx-auto max-w-2xl">
                            <Card className="border border-teal-100 bg-white/95 shadow-[0_30px_80px_rgba(15,118,110,0.12)]">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                                        <Sparkles size={22} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-600/80">
                                            Quick checkpoint
                                        </p>
                                        <p className="text-sm font-medium text-teal-950/80">
                                            One question to lock in the core idea before you continue.
                                        </p>
                                    </div>
                                </div>

                                <QuizQuestion
                                    key={currentStep.interaction.interaction_id}
                                    question={checkpointQuestion}
                                    onAnswer={handleCheckpointAnswer}
                                />

                                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                    {sessionState.checkpointOutcome ? (
                                        <Button
                                            className="h-14 flex-1 text-base font-black"
                                            onClick={() => goToNextStep(currentStep.id)}
                                        >
                                            Continue
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            className="h-14 flex-1 text-base font-black"
                                            onClick={handleCheckpointSkip}
                                        >
                                            Skip for now
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {currentStep?.kind === "micro_interaction" && (
                    <div className="px-6 pb-10 pt-8">
                        <div className="mx-auto max-w-2xl">
                            <div className="rounded-[2rem] bg-[linear-gradient(160deg,#042f2e_0%,#0f172a_100%)] p-[1px] shadow-[0_30px_80px_rgba(2,6,23,0.35)]">
                                <div className="rounded-[calc(2rem-1px)] bg-[radial-gradient(circle_at_top,#0f766e_0%,#0f172a_60%)] p-7 text-white">
                                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-teal-200/80">
                                        {currentStep.interaction.interaction_type === "predict"
                                            ? "Before the next reveal"
                                            : "Lock it in"}
                                    </p>
                                    <h2 className="mt-3 text-2xl font-black leading-tight">
                                        {currentStep.interaction.prompt_text}
                                    </h2>
                                    {currentStep.interaction.hint_text && (
                                        <p className="mt-3 text-sm font-medium leading-relaxed text-teal-100/80">
                                            Hint: {currentStep.interaction.hint_text}
                                        </p>
                                    )}

                                    <div className="mt-6 rounded-[1.75rem] bg-white/10 p-4 ring-1 ring-white/10">
                                        <textarea
                                            rows={5}
                                            value={sessionState.microResponses[currentStep.interaction.interaction_id] || ""}
                                            onChange={(event) =>
                                                setSessionState((prev) => prev ? {
                                                    ...prev,
                                                    microResponses: {
                                                        ...prev.microResponses,
                                                        [currentStep.interaction.interaction_id]: event.target.value,
                                                    },
                                                } : prev)
                                            }
                                            placeholder={
                                                currentStep.interaction.interaction_type === "predict"
                                                    ? "Write your best guess in a sentence or two."
                                                    : undefined
                                            }
                                            className="min-h-[140px] w-full resize-none rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-white/40"
                                        />
                                        <div className="mt-3 flex items-center justify-between text-xs font-medium text-white/55">
                                            <span>Keep it quick. This is for your thinking, not for grading.</span>
                                            <span>{currentStep.interaction.duration_seconds}s moment</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                        <Button
                                            className="h-14 flex-1 bg-white text-teal-900 hover:bg-teal-50"
                                            onClick={() =>
                                                handleMicroContinue(
                                                    currentStep.interaction.interaction_id,
                                                    sessionState.microResponses[currentStep.interaction.interaction_id] || ""
                                                )
                                            }
                                        >
                                            Continue
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="h-14 flex-1 border border-white/10 text-white hover:bg-white/10 hover:text-white"
                                            onClick={() =>
                                                handleMicroContinue(currentStep.interaction.interaction_id, "")
                                            }
                                        >
                                            Skip
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep?.kind === "quiz" && (
                    <div className="px-6 pb-10 pt-8">
                        <div className="mx-auto max-w-2xl">
                            <Card className="border border-teal-100 bg-white/95 shadow-[0_30px_80px_rgba(20,184,166,0.12)]">
                                <div className="mb-6 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-teal-600/80">
                                            Final quiz
                                        </p>
                                        <h2 className="mt-1 text-2xl font-black text-teal-950">
                                            Show that the lesson landed
                                        </h2>
                                    </div>
                                    <div className="rounded-2xl bg-teal-50 px-4 py-3 text-right">
                                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-teal-600/70">
                                            Progress
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-teal-950">
                                            {Math.min(sessionState.quizCurrentIndex + 1, lessonQuiz?.questions.length || 1)} of {lessonQuiz?.questions.length || 3}
                                        </p>
                                    </div>
                                </div>

                                {quizLoading && (
                                    <div className="rounded-[1.5rem] bg-teal-50 px-5 py-8 text-center">
                                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600" />
                                        <p className="mt-4 text-sm font-bold text-teal-900">
                                            Loading your final quiz...
                                        </p>
                                    </div>
                                )}

                                {!quizLoading && quizResult === "failed" && (
                                    <div className="rounded-[1.75rem] border border-red-100 bg-red-50 p-6">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 rounded-2xl bg-white p-3 text-red-500 shadow-sm">
                                                <AlertCircle size={22} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-red-900">Almost there</h3>
                                                <p className="mt-2 text-sm font-medium leading-relaxed text-red-900/75">
                                                    Review the lesson once more or reset the quiz and take it again. You need {lessonQuiz?.passThreshold || 2} correct answers to complete this lesson.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                            <Button className="h-14 flex-1" onClick={reviewLesson}>
                                                Review lesson
                                            </Button>
                                            <Button variant="secondary" className="h-14 flex-1" onClick={resetQuiz}>
                                                Try quiz again
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {!quizLoading && quizResult !== "failed" && currentQuizQuestion && (
                                    <>
                                        <QuizQuestion
                                            key={`${currentQuizQuestion.id}-${sessionState.quizCurrentIndex}`}
                                            question={currentQuizQuestion}
                                            onAnswer={(selected, isCorrect) =>
                                                handleQuizAnswer(currentQuizQuestion, selected, isCorrect)
                                            }
                                        />

                                        {isQuizQuestionAnswered && (
                                            <div className="mt-6">
                                                <Button
                                                    className="h-14 w-full text-base font-black"
                                                    onClick={handleQuizNext}
                                                >
                                                    {sessionState.quizCurrentIndex < (lessonQuiz?.questions.length || 0) - 1
                                                        ? "Next question"
                                                        : "Finish lesson"}
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Card>
                        </div>
                    </div>
                )}

                {currentStep?.kind === "takeaway" && (
                    <div className="px-6 pb-10 pt-8">
                        <div className="mx-auto max-w-2xl">
                            <Card className="overflow-hidden border border-teal-100 bg-white/95 p-0 shadow-[0_30px_80px_rgba(20,184,166,0.12)]">
                                <div className="flex items-center justify-between bg-teal-950 px-6 py-5 text-white">
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-200/80">
                                            Takeaway
                                        </p>
                                        <h2 className="mt-1 text-2xl font-black">One screen to remember</h2>
                                    </div>
                                    <CheckCircle2 className="text-teal-300" size={28} />
                                </div>
                                <img
                                    src={currentStep.takeawayCardUrl}
                                    alt="Lesson takeaway card"
                                    className="w-full bg-slate-100 object-cover"
                                />
                                <div className="px-6 py-5">
                                    <Button
                                        className="h-14 w-full text-base font-black"
                                        onClick={() => goToNextStep(currentStep.id)}
                                    >
                                        Continue
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {currentStep?.kind === "resources" && (
                    <div className="px-6 pb-10 pt-8">
                        <div className="mx-auto max-w-2xl">
                            <Card className="border border-teal-100 bg-white/95 shadow-[0_30px_80px_rgba(20,184,166,0.12)]">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                                        <BookOpen size={22} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-600/80">
                                            Keep going
                                        </p>
                                        <h2 className="text-2xl font-black text-teal-950">Resources for after the lesson</h2>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {currentStep.resources.map((resource: LessonResource) => {
                                        const resourceOpenUrl = getResourceOpenUrl(resource);
                                        const isOpenable = Boolean(resourceOpenUrl);

                                        return (
                                            <div
                                                key={`${resource.kind}-${resource.title}`}
                                                className={cn(
                                                    "rounded-[1.5rem] border p-5 transition-all",
                                                    isOpenable
                                                        ? "border-teal-100 bg-teal-50/70"
                                                        : "border-slate-200 bg-slate-50 opacity-80"
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-teal-600/70">
                                                            {resource.kind.replace(/_/g, " ")}
                                                        </p>
                                                        <h3 className="mt-1 text-lg font-black text-slate-950">
                                                            {resource.title}
                                                        </h3>
                                                        {resource.description && (
                                                            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
                                                                {resource.description}
                                                            </p>
                                                        )}
                                                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                                                            {resource.verified_at && <span>Verified {resource.verified_at}</span>}
                                                            {!isOpenable && <span>Available soon</span>}
                                                        </div>
                                                    </div>

                                                    {isOpenable ? (
                                                        <Button
                                                            className="shrink-0"
                                                            onClick={() => window.open(resourceOpenUrl || "", "_blank", "noopener,noreferrer")}
                                                        >
                                                            Open
                                                        </Button>
                                                    ) : (
                                                        <Button variant="secondary" className="shrink-0" disabled>
                                                            Available soon
                                                        </Button>
                                                    )}
                                                </div>

                                                {resource.source_url && (
                                                    <button
                                                        className="mt-4 text-sm font-bold text-teal-700 underline-offset-4 hover:underline"
                                                        onClick={() => window.open(resource.source_url || "", "_blank", "noopener,noreferrer")}
                                                    >
                                                        View source
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-6">
                                    <Button
                                        className="h-14 w-full text-base font-black"
                                        onClick={() => goToNextStep(currentStep.id)}
                                    >
                                        Finish lesson
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {currentStep?.kind === "completion" && (
                    <div className="px-6 pb-10 pt-8">
                        <div className="mx-auto max-w-2xl">
                            <Card className="overflow-hidden border border-teal-100 bg-white/95 p-0 shadow-[0_30px_80px_rgba(20,184,166,0.12)]">
                                <div className="bg-[linear-gradient(135deg,#0f766e_0%,#1d4ed8_100%)] px-7 py-8 text-white">
                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-teal-100/80">
                                        Completed
                                    </p>
                                    <h2 className="mt-2 text-3xl font-black leading-tight">
                                        You finished {manifest.title}
                                    </h2>
                                    <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-white/80">
                                        You made it through the full experience: video segments, interactive checkpoint, and the final quiz.
                                    </p>
                                </div>

                                <div className="px-7 py-7">
                                    {!manifest.takeaway_card_url && (
                                        <div className="rounded-[1.75rem] border border-teal-100 bg-teal-50 p-5">
                                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-600/80">
                                                Quick recap
                                            </p>
                                            <p className="mt-2 text-base font-bold leading-relaxed text-teal-950">
                                                {manifest.pre_lesson_card?.lesson_promise || "You completed the full lesson and locked in the core idea."}
                                            </p>
                                            {manifest.pre_lesson_card?.provocative_question && (
                                                <p className="mt-3 text-sm font-medium leading-relaxed text-teal-800/80">
                                                    Keep testing yourself with this question: {manifest.pre_lesson_card.provocative_question}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                        <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50 p-5">
                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600/70">
                                                Score
                                            </p>
                                            <p className="mt-2 text-3xl font-black text-blue-950">
                                                {sessionState.quizScore}/{lessonQuiz?.questions.length || 3}
                                            </p>
                                        </div>
                                        <div className="rounded-[1.5rem] border border-teal-100 bg-teal-50 p-5">
                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-teal-600/70">
                                                Duration
                                            </p>
                                            <p className="mt-2 text-3xl font-black text-teal-950">
                                                {durationLabel}
                                            </p>
                                        </div>
                                        <div className="rounded-[1.5rem] border border-amber-100 bg-amber-50 p-5">
                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-600/70">
                                                Reward
                                            </p>
                                            <p className="mt-2 text-3xl font-black text-amber-950">
                                                +{sessionState.quizScore * 10}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-7 flex flex-col gap-3">
                                        <Button
                                            className="h-14 w-full text-base font-black"
                                            onClick={() =>
                                                finishLesson(nextLesson ? buildLessonHref(nextLesson.lessonId) : undefined)
                                            }
                                        >
                                            {nextLesson ? (
                                                <>
                                                    Continue to {nextLesson.shortTitle}
                                                    <ArrowRight className="ml-2" size={18} />
                                                </>
                                            ) : (
                                                "Back to dashboard"
                                            )}
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="h-14 w-full text-base font-black"
                                            onClick={() => finishLesson("/dashboard")}
                                        >
                                            Return to dashboard
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
