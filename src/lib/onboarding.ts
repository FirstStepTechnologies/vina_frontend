import { Lesson, VinaProgress, VinaUser } from "./api/types";

export function hasOnboardingResponses(user: VinaUser | null): boolean {
    return !!(user?.onboardingResponses && Object.keys(user.onboardingResponses).length > 0);
}

export function hasCompletedLessons(lessons?: Lesson[] | null): boolean {
    return !!lessons?.some(lesson => lesson.status === "completed");
}

export function hasStartedLearning(
    user: VinaUser | null,
    progress?: Partial<VinaProgress> | null,
    lessons?: Lesson[] | null
): boolean {
    const progressData = progress || user?.progress;
    const courseProgress = progressData?.course_progress || {};

    return Boolean(
        hasCompletedLessons(lessons) ||
        user?.pre_assessment_completed ||
        progressData?.pre_assessment_completed ||
        (progressData?.diamonds ?? 0) > 0 ||
        (progressData?.streak ?? 0) > 0 ||
        (progressData?.minutes_total ?? 0) > 0 ||
        (progressData?.total_learning_time_seconds ?? 0) > 0 ||
        Object.keys(courseProgress).length > 0 ||
        Object.values(courseProgress).some(course => course.completed_lessons?.length > 0)
    );
}

export function getPostLoginRoute(
    user: VinaUser | null,
    progress?: Partial<VinaProgress> | null,
    lessons?: Lesson[] | null
): string {
    if (hasStartedLearning(user, progress, lessons)) return "/dashboard";
    if (!hasOnboardingResponses(user)) return "/intro";
    return "/pathway";
}
