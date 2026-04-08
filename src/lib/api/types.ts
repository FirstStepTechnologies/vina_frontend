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
    course_intro_progress?: Record<string, boolean>;
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

export interface LessonExperienceRequestContext {
    profession: string;
    industry: string;
    experienceLevel: string;
    adaptationPreference?: string;
    targetDifficulty?: number;
}

export interface LessonExperienceAudienceContext {
    profession: string;
    industry: string;
    experience_level: string;
    [key: string]: unknown;
}

export interface PreLessonCard {
    lesson_promise: string;
    provocative_question: string;
    audience_label: string;
    estimated_duration: string;
}

export interface RenderedSegmentAsset {
    segment_id: string;
    segment_number: number;
    segment_type: string;
    display_condition?: string | null;
    title: string;
    video_url: string;
    captions_url?: string | null;
    thumbnail_url?: string | null;
    duration_seconds: number;
    cloudinary_public_id: string;
    tts_recovery_metadata?: Record<string, unknown> | null;
}

export interface InteractionOption {
    id: string;
    text: string;
}

export interface SegmentInteraction {
    interaction_id: string;
    after_segment_number: number;
    interaction_type: "checkpoint_quiz" | "confidence_check" | "feedback_prompt";
    prompt: string;
    options?: InteractionOption[] | null;
    correct_option_id?: string | null;
    explanation?: string | null;
    required: boolean;
}

export interface MicroInteraction {
    interaction_id: string;
    after_segment_number: number;
    interaction_type: "predict" | "reflect" | "spot_the_issue";
    prompt_text: string;
    hint_text?: string | null;
    duration_seconds: number;
}

export interface FinalQuizRef {
    quiz_id: string;
    question_count: number;
    endpoint: string;
}

export interface LessonResource {
    kind: "template" | "worksheet" | "case_study" | "model_snapshot" | "reference";
    title: string;
    url?: string | null;
    local_path?: string | null;
    source_url?: string | null;
    verified_at?: string | null;
    description?: string | null;
}

export interface LessonExperienceManifest {
    experience_id: string;
    course_id: string;
    lesson_id: string;
    difficulty: number;
    experience_mode: "segmented_level3" | string;
    title: string;
    audience_context: LessonExperienceAudienceContext;
    segment_count: number;
    estimated_duration_seconds: number;
    segments: RenderedSegmentAsset[];
    pre_lesson_card?: PreLessonCard | null;
    interactions: SegmentInteraction[];
    micro_interactions: MicroInteraction[];
    final_quiz: FinalQuizRef;
    takeaway_card_url?: string | null;
    depth_level?: string;
    used_artifact_candidates?: string[];
    available_artifact_candidates?: string[];
    resources: LessonResource[];
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
    conceptTested?: string;
    rationale?: string;
}

export interface LessonQuiz {
    lessonId: string;
    profession?: string;
    questions: QuizQuestion[];
    passThreshold?: number;
}

export interface CourseIntroVideo {
    title: string;
    videoUrl: string;
    durationSeconds?: number;
    bridgeText?: string;
}

export interface CourseIntro {
    courseId: string;
    title?: string;
    description?: string;
    hook: CourseIntroVideo;
    orientation: CourseIntroVideo;
}
