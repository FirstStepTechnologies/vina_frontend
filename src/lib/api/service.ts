import { Lesson, QuizQuestion, VinaUser, Token } from "./types";

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
            throw new Error(error.detail || response.statusText);
        }
        return response.json();
    }

    static async register(email: string, fullName: string): Promise<Token> {
        // For Hackathon, we use a fixed password or generate one
        const url = `${API_BASE_URL}/auth/register`;
        console.log('[API] Registering user at:', url);
        console.log('[API] API_BASE_URL:', API_BASE_URL);

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
            return data;
        } catch (error) {
            console.error('[API] Registration failed:', error);
            console.error('[API] Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        }
    }

    static async login(email: string): Promise<Token> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: "password123" }),
        });
        const data = await this.handleResponse<Token>(response);
        if (data.access_token) {
            localStorage.setItem("vina_token", data.access_token);
        }
        return data;
    }

    static async getProfile(): Promise<VinaUser> {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: this.getAuthHeader(),
        });
        return this.handleResponse<VinaUser>(response);
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
            body: JSON.stringify(updates),
        });
        return this.handleResponse<VinaUser>(response);
    }

    static async getCourseMap(): Promise<Lesson[]> {
        const response = await fetch(`${API_BASE_URL}/course/map`, {
            headers: this.getAuthHeader(),
        });
        return this.handleResponse<Lesson[]>(response);
    }


    static async getLesson(lessonId: string, difficulty: number = 3, profession?: string, adaptation?: string): Promise<Lesson> {
        const professionParam = profession ? `&profession=${encodeURIComponent(profession)}` : '';
        const adaptationParam = adaptation ? `&adaptation=${encodeURIComponent(adaptation)}` : '';
        const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}?difficulty=${difficulty}${professionParam}${adaptationParam}`, {
            headers: this.getAuthHeader(),
        });
        return this.handleResponse<Lesson>(response);
    }

    static async completeLesson(lessonId: string, score: number = 0, total: number = 0): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/user/progress/lesson/${lessonId}/complete`, {
            method: "POST",
            headers: this.getAuthHeader(),
            body: JSON.stringify({ score, total }),
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

    // Helper for finding/creating a user profile during onboarding
    static async ensureUser(fullName: string): Promise<Token> {
        const email = `${fullName.toLowerCase().replace(/\s+/g, ".")}@example.com`;
        try {
            return await this.login(email);
        } catch (e) {
            return await this.register(email, fullName);
        }
    }
}
