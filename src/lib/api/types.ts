export interface VinaUser {
    userId: string;
    profession: string;
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
    totalPoints: number;
    streak: number;
    lastActiveDate: string;
    practicePointsToday: number;
    lastPracticeDate: string;
    totalLearningTimeSeconds: number;
    preAssessmentCompleted: boolean;
    preAssessmentScore: number;
    startingLesson: string;
    preAssessmentDate: string;
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
