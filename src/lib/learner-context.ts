"use client";

import { LessonExperienceRequestContext, VinaUser } from "@/lib/api/types";

export function getLearnerContext(user: VinaUser | null): LessonExperienceRequestContext | null {
    const profile = user?.profile;
    const onboarding = user?.onboardingResponses || {};

    const profession = profile?.profession || onboarding.role;
    const industry = profile?.industry || onboarding.industry;
    const experienceLevel =
        profile?.experience_level ||
        onboarding.experience_level ||
        "Beginner";

    if (!profession || !industry) {
        return null;
    }

    return {
        profession,
        industry,
        experienceLevel,
    };
}

export function getLessonExperienceContexts(
    user: VinaUser | null,
    courseId: string
): LessonExperienceRequestContext[] {
    const primary = getLearnerContext(user);
    if (!primary) {
        return [];
    }

    const contexts: LessonExperienceRequestContext[] = [primary];

    const isPmCourse = courseId.startsWith("c_pm26-");
    const needsPmFallback =
        primary.profession === "Product Manager" &&
        isPmCourse &&
        (primary.industry !== "FinTech" || primary.experienceLevel !== "Intermediate");

    if (needsPmFallback) {
        contexts.push({
            profession: "Product Manager",
            industry: "FinTech",
            experienceLevel: "Intermediate",
        });
    }

    return contexts;
}
