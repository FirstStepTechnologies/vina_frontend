"use client";

export type CourseIntroStatus = "completed" | "skipped_unavailable";
type CourseIntroStatusRecord = {
    status: CourseIntroStatus;
    updatedAt: string;
};

const STORAGE_KEY = "vina_course_intro_status";
const UNAVAILABLE_TTL_MS = 1000 * 60 * 60 * 6;

function normalizeStatusRecord(value: unknown): CourseIntroStatusRecord | null {
    if (typeof value === "string" && (value === "completed" || value === "skipped_unavailable")) {
        return {
            status: value,
            updatedAt: new Date(0).toISOString(),
        };
    }

    if (
        value &&
        typeof value === "object" &&
        "status" in value &&
        (value.status === "completed" || value.status === "skipped_unavailable")
    ) {
        const updatedAt =
            "updatedAt" in value && typeof value.updatedAt === "string"
                ? value.updatedAt
                : new Date().toISOString();
        return {
            status: value.status,
            updatedAt,
        };
    }

    return null;
}

function readStatuses(): Record<string, CourseIntroStatusRecord> {
    if (typeof window === "undefined") return {};
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        return Object.entries(parsed).reduce<Record<string, CourseIntroStatusRecord>>((acc, [courseId, value]) => {
            const normalized = normalizeStatusRecord(value);
            if (normalized) {
                acc[courseId] = normalized;
            }
            return acc;
        }, {});
    } catch {
        return {};
    }
}

function writeStatuses(statuses: Record<string, CourseIntroStatusRecord>) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
}

export function getCourseIntroStatus(courseId: string): CourseIntroStatus | null {
    return readStatuses()[courseId]?.status || null;
}

export function hasHandledCourseIntro(courseId: string): boolean {
    return getCourseIntroStatus(courseId) !== null;
}

export function isCourseIntroTemporarilyUnavailable(courseId: string): boolean {
    const record = readStatuses()[courseId];
    if (!record || record.status !== "skipped_unavailable") {
        return false;
    }

    const updatedAt = Date.parse(record.updatedAt);
    if (Number.isNaN(updatedAt)) {
        return false;
    }

    return Date.now() - updatedAt < UNAVAILABLE_TTL_MS;
}

export function markCourseIntroCompleted(courseId: string) {
    const statuses = readStatuses();
    statuses[courseId] = {
        status: "completed",
        updatedAt: new Date().toISOString(),
    };
    writeStatuses(statuses);
}

export function markCourseIntroUnavailable(courseId: string) {
    const statuses = readStatuses();
    statuses[courseId] = {
        status: "skipped_unavailable",
        updatedAt: new Date().toISOString(),
    };
    writeStatuses(statuses);
}
