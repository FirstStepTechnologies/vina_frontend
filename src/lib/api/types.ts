export interface Token {
    access_token: string;
    token_type: string;
    user: VinaUser;
}

export interface VinaUser {
    id: string; // Map from backend 'id'
    email: string;
    fullName?: string;
    profile?: VinaProfile;
    progress?: VinaProgress;
    onboardingResponses?: Record<string, string>;
    pre_assessment_completed?: boolean;
}

export interface VinaProfile {
    profession: string;
    industry?: string;
    experience_level?: string;
    leadership_level?: string;
    daily_goal_minutes: number;
    resolution?: string;
}

export interface CourseProgress {
    completed_lessons: string[];
    lesson_scores: Record<string, number>;
    current_difficulty: number;
}

export interface VinaProgress {
    course_progress: Record<string, CourseProgress>;
    primary_track_id?: string;
    secondary_track_ids: string[];
    daily_goal_history?: Record<string, boolean>;
    diamonds: number;
    streak: number;
    minutes_today: number;
    minutes_this_week: number;
    minutes_total: number;
    total_learning_time_seconds: number;
    pre_assessment_completed: boolean;
    starting_lesson?: string;
    currentTourStep?: number;
    tourCompleted?: boolean;
}

export interface Lesson {
    lessonId: string;
    lessonNumber: number;
    lessonName: string;
    shortTitle: string;
    topicGroup: string;
    estimatedDuration: number;
    prerequisites: string[];
    videoUrl?: string;
    status?: "locked" | "active" | "completed";
}

export interface QuizOption {
    text: string;
    is_correct: boolean;
}

export interface QuizQuestion {
    id: string;
    text: string;
    options: QuizOption[];
    correctAnswer: string;
    explanation: string;
}
