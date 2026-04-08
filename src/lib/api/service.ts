import {
    CourseIntro,
    Lesson,
    LessonExperienceManifest,
    LessonExperienceRequestContext,
    LessonQuiz,
    QuizQuestion,
    VinaUser,
    Token,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://vina-backend-6snh.onrender.com/api/v1";

export class ApiService {
    private static getAuthHeader(): Record<string, string> {
        if (typeof window === "undefined") return {};
        const token = localStorage.getItem("vina_token");
        return token ? { "Authorization": `Bearer ${token}` } : {};
    }

    private static async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: "Unknown error" }));
            const detail = error?.detail;
            const message =
                typeof detail === "string"
                    ? detail
                    : typeof detail?.message === "string"
                        ? detail.message
                        : typeof error?.message === "string"
                            ? error.message
                            : response.statusText || "Unknown error";
            const enrichedError = new Error(message) as Error & {
                status?: number;
                payload?: unknown;
            };
            enrichedError.status = response.status;
            enrichedError.payload = error;
            throw enrichedError;
        }
        return response.json();
    }

    public static buildApiUrl(path: string): string {
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        const apiOrigin = API_BASE_URL.replace(/\/api\/v1$/, "");

        if (path.startsWith("/api/")) {
            return `${apiOrigin}${path}`;
        }

        if (path.startsWith("/")) {
            return `${API_BASE_URL}${path}`;
        }

        return `${API_BASE_URL}/${path}`;
    }

    private static createLessonExperienceParams(context: LessonExperienceRequestContext): URLSearchParams {
        const params = new URLSearchParams();
        params.set("profession", context.profession);
        params.set("industry", context.industry);
        params.set("experience_level", context.experienceLevel);
        return params;
    }

    private static normalizeCourseIntro(courseId: string, data: any): CourseIntro | null {
        const hookVideoUrl =
            data?.hook?.video_url ||
            data?.hook?.videoUrl ||
            data?.hook_video_url ||
            data?.hookVideoUrl;
        const orientationVideoUrl =
            data?.orientation?.video_url ||
            data?.orientation?.videoUrl ||
            data?.orientation_video_url ||
            data?.orientationVideoUrl;

        if (!hookVideoUrl || !orientationVideoUrl) {
            return null;
        }

        return {
            courseId: data?.course_id || data?.courseId || courseId,
            title: data?.title || data?.course_title,
            description: data?.description,
            hook: {
                title: data?.hook?.title || "Course hook",
                videoUrl: hookVideoUrl,
                durationSeconds:
                    data?.hook?.duration_seconds ||
                    data?.hook?.durationSeconds ||
                    data?.hook_target_duration_seconds,
                bridgeText: data?.hook?.bridge_to_orientation || data?.bridge_to_orientation,
            },
            orientation: {
                title: data?.orientation?.title || "Course orientation",
                videoUrl: orientationVideoUrl,
                durationSeconds:
                    data?.orientation?.duration_seconds ||
                    data?.orientation?.durationSeconds ||
                    data?.orientation_target_duration_seconds,
            },
        };
    }

    static async register(email: string, fullName: string, password: string): Promise<Token> {
        const url = `${API_BASE_URL}/auth/register`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, fullName }),
            });
            const data = await this.handleResponse<Token>(response);
            if (data.access_token) {
                localStorage.setItem("vina_token", data.access_token);
            }
            return data;
        } catch (error) {
            console.error('[API] Registration failed:', error);
            throw error;
        }
    }

    static async login(email: string, password: string): Promise<Token> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await this.handleResponse<Token>(response);
        if (data.access_token) {
            localStorage.setItem("vina_token", data.access_token);
        }
        return data;
    }

    /**
     * Exchange a Firebase ID token for a Vina backend JWT.
     * This is the primary sign-in method for Google and Email/Password users.
     */
    static async firebaseLogin(idToken: string): Promise<Token> {
        const response = await fetch(`${API_BASE_URL}/auth/firebase`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: idToken }),
        });
        const data = await this.handleResponse<Token>(response);
        if (data.access_token) {
            localStorage.setItem("vina_token", data.access_token);
        }
        return data;
    }

    static async getProfile(): Promise<VinaUser> {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: this.getAuthHeader(), cache: "no-store",
        });
        return this.handleResponse<VinaUser>(response);
    }

    static async getProgress(): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/user/progress`, {
            headers: this.getAuthHeader(), cache: "no-store",
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
            body: JSON.stringify(updates),
        });
        return this.handleResponse<VinaUser>(response);
    }

    static async getCourses(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/courses`, {
            headers: this.getAuthHeader(), cache: "no-store",
        });
        return this.handleResponse<any[]>(response);
    }

    static async getCourseMap(courseId: string): Promise<Lesson[]> {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}/map`, {
            headers: this.getAuthHeader(), cache: "no-store",
        });
        return this.handleResponse<Lesson[]>(response);
    }


    static async getLesson(courseId: string, lessonId: string, difficulty: number = 3, profession?: string, adaptation?: string): Promise<Lesson> {
        const professionParam = profession ? `&profession=${encodeURIComponent(profession)}` : '';
        const adaptationParam = adaptation ? `&adaptation=${encodeURIComponent(adaptation)}` : '';
        const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}?course_id=${courseId}&difficulty=${difficulty}${professionParam}${adaptationParam}`, {
            headers: this.getAuthHeader(), cache: "no-store",
        });
        return this.handleResponse<Lesson>(response);
    }

    static async getLessonExperience(
        courseId: string,
        lessonId: string,
        context: LessonExperienceRequestContext
    ): Promise<LessonExperienceManifest> {
        const params = this.createLessonExperienceParams(context);
        const response = await fetch(
            `${API_BASE_URL}/lesson-experiences/${courseId}/${lessonId}?${params.toString()}`,
            {
                headers: this.getAuthHeader(), cache: "no-store",
            }
        );
        return this.handleResponse<LessonExperienceManifest>(response);
    }

    static async getLessonExperienceQuiz(
        endpoint: string,
        context: LessonExperienceRequestContext
    ): Promise<LessonQuiz> {
        const params = this.createLessonExperienceParams(context);
        const separator = endpoint.includes("?") ? "&" : "?";
        const response = await fetch(
            `${this.buildApiUrl(endpoint)}${separator}${params.toString()}`,
            {
                headers: this.getAuthHeader(), cache: "no-store",
            }
        );
        return this.handleResponse<LessonQuiz>(response);
    }

    static async getCourseIntro(courseId: string): Promise<CourseIntro | null> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/course-intros/${courseId}`,
                {
                    headers: this.getAuthHeader(), cache: "no-store",
                }
            );

            if (response.status === 404) {
                return null;
            }

            const data = await this.handleResponse<any>(response);
            return this.normalizeCourseIntro(courseId, data);
        } catch (error) {
            console.warn("[API] Course intro unavailable:", error);
            return null;
        }
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

    static async completeCourseIntro(courseId: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/user/progress/course-intro/${courseId}/complete`, {
            method: "POST",
            headers: {
                ...this.getAuthHeader(),
            },
        });
        return this.handleResponse<any>(response);
    }

    static async getPreAssessment(): Promise<QuizQuestion[]> {
        const response = await fetch(`${API_BASE_URL}/assessment/pre-quiz`, {
            headers: this.getAuthHeader(), cache: "no-store",
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
            headers: this.getAuthHeader(), cache: "no-store",
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
