export interface VinaUser {
    userId: string;
    profession: string;
    dailyGoalMinutes: number; // Added for gamification
    resolution?: string;
    onboardingResponses?: Record<string, string>;
    createdAt: string;
}

export interface VinaProgress {
    currentLessonId: string;
    completedLessons: string[];
    lessonScores: {
        [lessonId: string]: {
            score: number;
            total: number;
            passedAt: string;
        };
    };
    currentDifficulty: number;
    totalPoints: number; // This will act as Diamonds
    diamonds: number; // Explicit diamonds
    streak: number;
    minutesToday: number; // Added for gamification
    minutesThisWeek: number; // Added for gamification
    lastActiveDate: string;
    practicePointsToday: number;
    lastPracticeDate: string;
    totalLearningTimeSeconds: number;
    preAssessmentCompleted: boolean;
    preAssessmentScore: number;
    startingLesson: string;
    preAssessmentDate: string;
    dailyGoalHistory?: Record<string, boolean>;
    tourCompleted?: boolean;
    currentTourStep?: number;
}

export interface Lesson {
    lessonId: string;
    lessonNumber: number;
    lessonName: string;
    shortTitle: string;
    topicGroup: string;
    estimatedDuration: number;
    prerequisites: string[];
}

export interface QuizQuestion {
    id: string;
    questionText: string;
    options: string[];
    correctAnswer: string; // "A", "B", "C", "D"
    explanation: string;
    associatedLesson?: string;
    difficultyLevel?: number;
}

export interface DailyPractice {
    practiceDate: string;
    questions: QuizQuestion[];
}

export interface MockApiResponse<T> {
    data: T;
    error?: string;
}
