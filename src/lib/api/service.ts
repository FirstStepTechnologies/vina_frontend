import { DailyPractice, Lesson, QuizQuestion, VinaUser } from "./types";
import { MOCK_LESSONS, MOCK_QUIZ_QUESTIONS, MOCK_PRE_ASSESSMENT_QUESTIONS } from "./mock-data";

const DELAY_MS = 800; // Simulate network latency

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateUUID = () => {
    // Check if crypto.randomUUID exists (secure context HTTPS or localhost)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for insecure contexts (HTTP on LAN)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export class ApiService {
    static async createUserProfile(profession: string, dailyGoalMinutes: number = 10): Promise<VinaUser> {
        await sleep(DELAY_MS);
        return {
            userId: generateUUID(),
            profession,
            dailyGoalMinutes,
            createdAt: new Date().toISOString(),
        };
    }

    static async getCourseMap(): Promise<Lesson[]> {
        await sleep(DELAY_MS);
        return MOCK_LESSONS; // Return all 17 lessons (mocked as subset for now)
    }

    static async getLesson(lessonId: string): Promise<Lesson | undefined> {
        await sleep(DELAY_MS);
        return MOCK_LESSONS.find((l) => l.lessonId === lessonId);
    }

    static async getQuiz(lessonId: string): Promise<QuizQuestion[]> {
        await sleep(DELAY_MS);
        return MOCK_QUIZ_QUESTIONS[lessonId] || [];
    }

    static async getPreAssessment(): Promise<QuizQuestion[]> {
        await sleep(DELAY_MS);
        return MOCK_PRE_ASSESSMENT_QUESTIONS;
    }

    static async submitPreAssessment(answers: any[]): Promise<{ startingLesson: string; score: number }> {
        await sleep(DELAY_MS);
        // Mock logic: randomly place user or based on score
        // content placement logic would go here
        return {
            startingLesson: "l01_what_llms_are",
            score: 5
        };
    }
}
