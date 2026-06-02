import { CourseSummary, Lesson, QuizQuestion, VinaUser, Token } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://vina-backend-6snh.onrender.com/api/v1";
const DEFAULT_COURSE_ID = "c_llm_foundations";
const DEFAULT_COURSE_NAME = "Workplace AI Foundations";
type LegacyLesson = Partial<Lesson> & {
    title?: string;
    duration?: number;
};

export class ApiService {
    private static normalizeUser(raw: any): VinaUser {
        const profile = raw?.profile || {};

        return {
            ...raw,
            id: raw?.id || raw?.userId || raw?.user_id || "",
            fullName: raw?.fullName || raw?.full_name,
            profile: {
                ...profile,
                profession: profile.profession || raw?.profession || "Learner",
                industry: profile.industry || raw?.industry,
                experience_level: profile.experience_level || raw?.experience_level,
                leadership_level: profile.leadership_level || raw?.leadership_level,
                daily_goal_minutes:
                    profile.daily_goal_minutes ??
                    raw?.daily_goal_minutes ??
                    raw?.dailyGoalMinutes ??
                    raw?.preferences?.dailyGoal ??
                    10,
                resolution: profile.resolution || raw?.resolution,
            },
            onboardingResponses: raw?.onboardingResponses || raw?.onboarding_responses || profile.onboardingResponses,
            pre_assessment_completed: raw?.pre_assessment_completed ?? raw?.preAssessmentCompleted,
        };
    }

    private static normalizeProfileUpdate(updates: any): any {
        const source = updates?.profile ? { ...updates, ...updates.profile } : { ...updates };
        delete source.profile;

        if (source.daily_goal_minutes !== undefined && source.dailyGoalMinutes === undefined) {
            source.dailyGoalMinutes = source.daily_goal_minutes;
        }
        if (source.dailyGoalMinutes !== undefined && source.daily_goal_minutes === undefined) {
            source.daily_goal_minutes = source.dailyGoalMinutes;
        }
        if (source.onboardingResponses !== undefined && source.onboarding_responses === undefined) {
            source.onboarding_responses = source.onboardingResponses;
        }
        if (source.onboarding_responses !== undefined && source.onboardingResponses === undefined) {
            source.onboardingResponses = source.onboarding_responses;
        }

        return source;
    }

    private static getAuthHeader(): Record<string, string> {
        if (typeof window === "undefined") return {};
        const token = localStorage.getItem("vina_token");
        return token ? { "Authorization": `Bearer ${token}` } : {};
    }

    private static async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: "Unknown error" }));
            throw new Error(error.detail || response.statusText);
        }
        return response.json();
    }

    private static normalizeLessons(lessons: LegacyLesson[]): Lesson[] {
        return lessons.map((lesson, index) => ({
            ...lesson,
            lessonId: lesson.lessonId || `lesson_${index + 1}`,
            lessonNumber: lesson.lessonNumber || index + 1,
            lessonName: lesson.lessonName || lesson.title || lesson.shortTitle || `Lesson ${index + 1}`,
            shortTitle: lesson.shortTitle || lesson.title || lesson.lessonName || `Lesson ${index + 1}`,
            topicGroup: lesson.topicGroup || "Foundations",
            estimatedDuration: lesson.estimatedDuration || lesson.duration || 5,
            prerequisites: lesson.prerequisites || [],
        }));
    }

    private static buildDefaultCourse(lessons: Lesson[] = []): CourseSummary {
        return {
            courseId: DEFAULT_COURSE_ID,
            courseName: DEFAULT_COURSE_NAME,
            seriesName: "Vina Core",
            tagline: "Master the basics, understand tokens, and learn to write effective prompts.",
            preparesFor: ["AI fluency", "Prompt engineering", "LLM fundamentals"],
            totalLessons: lessons.length,
            estimatedDurationMinutes: lessons.reduce((total, lesson) => total + (lesson.estimatedDuration || 5), 0),
        };
    }

    static async register(email: string, fullName: string): Promise<Token> {
        // DEPRECATED: use firebaseLogin() instead. Kept for backward compatibility.
        const url = `${API_BASE_URL}/auth/register`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: "password123", fullName }),
            });
            const data = await this.handleResponse<Token>(response);
            if (data.access_token) {
                localStorage.setItem("vina_token", data.access_token);
            }
            return { ...data, user: this.normalizeUser(data.user) };
        } catch (error) {
            console.error('[API] Registration failed:', error);
            throw error;
        }
    }

    static async login(email: string): Promise<Token> {
        // DEPRECATED: use firebaseLogin() instead. Kept for backward compatibility.
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: "password123" }),
        });
        const data = await this.handleResponse<Token>(response);
        if (data.access_token) {
            localStorage.setItem("vina_token", data.access_token);
        }
        return { ...data, user: this.normalizeUser(data.user) };
    }

    /**
     * Exchange a Firebase ID token for a Vina backend JWT.
     * This is the primary sign-in method for Google and Email/Password users.
     */
    static async firebaseLogin(idToken: string, fullName?: string): Promise<Token> {
        const response = await fetch(`${API_BASE_URL}/auth/firebase`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: idToken, ...(fullName ? { full_name: fullName } : {}) }),
        });
        const data = await this.handleResponse<Token>(response);
        if (data.access_token) {
            localStorage.setItem("vina_token", data.access_token);
        }
        return { ...data, user: this.normalizeUser(data.user) };
    }

    static async getProfile(): Promise<VinaUser> {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: this.getAuthHeader(),
        });
        return this.normalizeUser(await this.handleResponse<any>(response));
    }

    static async getProgress(): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/user/progress`, {
            headers: this.getAuthHeader(),
        });
        return this.handleResponse<any>(response);
    }

    static async updateProfile(updates: any): Promise<VinaUser> {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...this.getAuthHeader(),
            },
            body: JSON.stringify(this.normalizeProfileUpdate(updates)),
        });
        return this.normalizeUser(await this.handleResponse<any>(response));
    }

    static async getCourses(): Promise<CourseSummary[]> {
        const response = await fetch(`${API_BASE_URL}/course/map`, {
            headers: this.getAuthHeader(),
        });
        const lessons = this.normalizeLessons(await this.handleResponse<LegacyLesson[]>(response));
        return [this.buildDefaultCourse(lessons)];
    }

    static async getCourseMap(courseId: string): Promise<Lesson[]> {
        void courseId;
        const response = await fetch(`${API_BASE_URL}/course/map`, {
            headers: this.getAuthHeader(),
        });
        return this.normalizeLessons(await this.handleResponse<LegacyLesson[]>(response));
    }


    static async getLesson(courseId: string, lessonId: string, difficulty: number = 3, profession?: string, adaptation?: string): Promise<Lesson> {
        const professionParam = profession ? `&profession=${encodeURIComponent(profession)}` : '';
        const adaptationParam = adaptation ? `&adaptation=${encodeURIComponent(adaptation)}` : '';
        const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}?course_id=${courseId}&difficulty=${difficulty}${professionParam}${adaptationParam}`, {
            headers: this.getAuthHeader(),
        });
        return this.handleResponse<Lesson>(response);
    }

    static async completeLesson(courseId: string, lessonId: string, score: number = 0, total: number = 0, totalLessonTimeS?: number, appSessionId?: string): Promise<any> {
        const payload: any = { course_id: courseId, score, total };
        if (totalLessonTimeS !== undefined) payload.total_lesson_time_s = totalLessonTimeS;
        if (appSessionId) payload.app_session_id = appSessionId;

        const response = await fetch(`${API_BASE_URL}/user/progress/lesson/${lessonId}/complete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this.getAuthHeader(),
            },
            body: JSON.stringify(payload),
        });
        return this.handleResponse<any>(response);
    }

    static async getPreAssessment(): Promise<QuizQuestion[]> {
        const response = await fetch(`${API_BASE_URL}/assessment/pre-quiz`, {
            headers: this.getAuthHeader(),
        });
        const data = await this.handleResponse<any>(response);
        return data.questions || [];
    }

    static async submitPreAssessment(answers: any[]): Promise<{ startingLesson: string; score: number }> {
        const response = await fetch(`${API_BASE_URL}/assessment/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this.getAuthHeader(),
            },
            body: JSON.stringify({ answers }),
        });
        return this.handleResponse<{ startingLesson: string; score: number }>(response);
    }

    static async syncProgress(minutes: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/user/progress/sync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this.getAuthHeader(),
            },
            body: JSON.stringify({ minutes_added: minutes }),
        });
        return this.handleResponse<any>(response);
    }

    static async adaptLesson(lessonId: string, adaptationType: string, currentDifficulty: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/lessons/adapt`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this.getAuthHeader(),
            },
            body: JSON.stringify({ lessonId, adaptationType, currentDifficulty }),
        });
        return this.handleResponse<any>(response);
    }

    static async getQuiz(lessonId: string, profession?: string): Promise<QuizQuestion[]> {
        const storedUser = localStorage.getItem("vina_user");
        const userId = storedUser ? JSON.parse(storedUser).id : "";

        // Build query parameters
        const params = new URLSearchParams();
        if (userId) params.append("userId", userId);
        if (profession) params.append("profession", profession);

        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await fetch(`${API_BASE_URL}/quizzes/${lessonId}${queryString}`, {
            headers: this.getAuthHeader(),
        });
        const data = await this.handleResponse<any>(response);
        return data.questions || [];
    }

    static async submitQuiz(lessonId: string, answers: any[]): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/quizzes/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this.getAuthHeader(),
            },
            body: JSON.stringify({ lessonId, answers }),
        });
        return this.handleResponse<any>(response);
    }
}
