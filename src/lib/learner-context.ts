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
        onboarding.experience ||
        "Intermediate";

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
    user: VinaUser | null
): LessonExperienceRequestContext[] {
    const primary = getLearnerContext(user);
    if (!primary) {
        return [];
    }
    return [primary];
}
