"use client";

import {
    FinalQuizRef,
    LessonExperienceManifest,
    LessonResource,
    MicroInteraction,
    PreLessonCard,
    QuizQuestion,
    RenderedSegmentAsset,
    SegmentInteraction,
} from "@/lib/api/types";

export type CheckpointOutcome = "correct" | "incorrect" | "skipped" | null;

export type LessonExperienceStep =
    | {
        id: string;
        kind: "pre_lesson";
        card: PreLessonCard;
    }
    | {
        id: string;
        kind: "segment";
        segment: RenderedSegmentAsset;
        coreSegmentIndex: number;
        coreSegmentCount: number;
        isConditional: boolean;
    }
    | {
        id: string;
        kind: "checkpoint";
        interaction: SegmentInteraction;
    }
    | {
        id: string;
        kind: "micro_interaction";
        interaction: MicroInteraction;
    }
    | {
        id: string;
        kind: "quiz";
        quiz: FinalQuizRef;
    }
    | {
        id: string;
        kind: "takeaway";
        takeawayCardUrl: string;
    }
    | {
        id: string;
        kind: "resources";
        resources: LessonResource[];
    }
    | {
        id: string;
        kind: "completion";
    };

export interface LessonExperienceSessionState {
    currentStepId: string;
    checkpointOutcome: CheckpointOutcome;
    checkpointAnsweredId?: string | null;
    microResponses: Record<string, string>;
    quizCurrentIndex: number;
    quizScore: number;
    quizSelections: Record<string, string>;
    lessonMinutesAdded: boolean;
    completionRecorded: boolean;
}

const SESSION_STORAGE_PREFIX = "vina_lesson_experience_";

export function getLessonExperienceSessionKey(experienceId: string) {
    return `${SESSION_STORAGE_PREFIX}${experienceId}`;
}

export function readLessonExperienceSession(
    experienceId: string
): LessonExperienceSessionState | null {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem(getLessonExperienceSessionKey(experienceId));
    if (!raw) return null;

    try {
        return JSON.parse(raw) as LessonExperienceSessionState;
    } catch {
        return null;
    }
}

export function writeLessonExperienceSession(
    experienceId: string,
    state: LessonExperienceSessionState
) {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(
        getLessonExperienceSessionKey(experienceId),
        JSON.stringify(state)
    );
}

export function clearLessonExperienceSession(experienceId: string) {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(getLessonExperienceSessionKey(experienceId));
}

export function createDefaultLessonExperienceSession(
    manifest: LessonExperienceManifest
): LessonExperienceSessionState {
    const initialStepId = `segment:${getCoreSegments(manifest)[0]?.segment_id || manifest.segments[0]?.segment_id || "start"}`;

    return {
        currentStepId: initialStepId,
        checkpointOutcome: null,
        checkpointAnsweredId: null,
        microResponses: {},
        quizCurrentIndex: 0,
        quizScore: 0,
        quizSelections: {},
        lessonMinutesAdded: false,
        completionRecorded: false,
    };
}

export function getCoreSegments(manifest: LessonExperienceManifest) {
    return manifest.segments
        .filter((segment) => !segment.display_condition)
        .sort((a, b) => a.segment_number - b.segment_number);
}

export function getConditionalSegments(manifest: LessonExperienceManifest) {
    return manifest.segments
        .filter((segment) => segment.display_condition === "checkpoint_incorrect")
        .sort((a, b) => a.segment_number - b.segment_number);
}

export function buildLessonSteps(
    manifest: LessonExperienceManifest,
    checkpointOutcome: CheckpointOutcome
): LessonExperienceStep[] {
    const steps: LessonExperienceStep[] = [];
    const coreSegments = getCoreSegments(manifest);
    const conditionalSegments = getConditionalSegments(manifest);

    coreSegments.forEach((segment, index) => {
        steps.push({
            id: `segment:${segment.segment_id}`,
            kind: "segment",
            segment,
            coreSegmentIndex: index + 1,
            coreSegmentCount: coreSegments.length,
            isConditional: false,
        });

        manifest.interactions
            .filter((interaction) => interaction.after_segment_number === segment.segment_number)
            .forEach((interaction) => {
                steps.push({
                    id: `checkpoint:${interaction.interaction_id}`,
                    kind: "checkpoint",
                    interaction,
                });

                if (checkpointOutcome === "incorrect") {
                    conditionalSegments.forEach((conditionalSegment) => {
                        steps.push({
                            id: `segment:${conditionalSegment.segment_id}`,
                            kind: "segment",
                            segment: conditionalSegment,
                            coreSegmentIndex: index + 1,
                            coreSegmentCount: coreSegments.length,
                            isConditional: true,
                        });
                    });
                }
            });

        if (index === coreSegments.length - 1 && manifest.resources.length > 0) {
            steps.push({
                id: "resources",
                kind: "resources",
                resources: manifest.resources,
            });
        }

        manifest.micro_interactions
            .filter((interaction) => interaction.after_segment_number === segment.segment_number)
            .forEach((interaction) => {
                steps.push({
                    id: `micro:${interaction.interaction_id}`,
                    kind: "micro_interaction",
                    interaction,
                });
            });
    });

    if (manifest.takeaway_card_url) {
        steps.push({
            id: "takeaway",
            kind: "takeaway",
            takeawayCardUrl: manifest.takeaway_card_url,
        });
    }

    steps.push({
        id: "quiz",
        kind: "quiz",
        quiz: manifest.final_quiz,
    });

    steps.push({
        id: "completion",
        kind: "completion",
    });

    return steps;
}

export function toCheckpointQuizQuestion(interaction: SegmentInteraction): QuizQuestion {
    return {
        id: interaction.interaction_id,
        text: interaction.prompt,
        options: (interaction.options || []).map((option) => ({
            text: option.text,
            is_correct: option.id === interaction.correct_option_id,
        })),
        correctAnswer: interaction.correct_option_id || "A",
        explanation: interaction.explanation || "",
    };
}

export function formatLessonDuration(seconds: number) {
    const minutes = Math.max(1, Math.round(seconds / 60));
    return `${minutes} min`;
}
