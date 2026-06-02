import { VinaProgress, VinaUser } from "./api/types";

export function hasOnboardingResponses(user: VinaUser | null): boolean {
    return !!(user?.onboardingResponses && Object.keys(user.onboardingResponses).length > 0);
}

export function hasStartedLearning(user: VinaUser | null, progress?: Partial<VinaProgress> | null): boolean {
    const progressData = progress || user?.progress;
    const courseProgress = progressData?.course_progress || {};

    return Boolean(
        user?.pre_assessment_completed ||
        progressData?.pre_assessment_completed ||
        Object.keys(courseProgress).length > 0 ||
        Object.values(courseProgress).some(course => course.completed_lessons?.length > 0)
    );
}

export function getPostLoginRoute(user: VinaUser | null, progress?: Partial<VinaProgress> | null): string {
    if (hasStartedLearning(user, progress)) return "/dashboard";
    if (!hasOnboardingResponses(user)) return "/intro";
    return "/pathway";
}
