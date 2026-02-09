import { Lesson, QuizQuestion } from "./types";

export const MOCK_LESSONS: Lesson[] = [
    {
        lessonId: "l01_what_llms_are",
        lessonNumber: 1,
        lessonName: "What LLMs Are",
        shortTitle: "What are LLMs?",
        topicGroup: "The Foundations",
        estimatedDuration: 3,
        prerequisites: [],
    },
    {
        lessonId: "l02_tokens_context",
        lessonNumber: 2,
        lessonName: "Tokens & Context Windows",
        shortTitle: "Tokens & Context",
        topicGroup: "The Foundations",
        estimatedDuration: 3,
        prerequisites: ["l01_what_llms_are"],
    },
    {
        lessonId: "l03_prompting_basics",
        lessonNumber: 3,
        lessonName: "Prompting Basics",
        shortTitle: "Prompting 101",
        topicGroup: "The Foundations",
        estimatedDuration: 4,
        prerequisites: ["l02_tokens_context"],
    },
    {
        lessonId: "l04_where_llms_excel",
        lessonNumber: 4,
        lessonName: "Where LLMs Excel & Fail",
        shortTitle: "LLM Capability",
        topicGroup: "The Foundations",
        estimatedDuration: 4,
        prerequisites: ["l03_prompting_basics"],
    },
    {
        lessonId: "l05_hallucinations",
        lessonNumber: 5,
        lessonName: "Understanding Hallucinations",
        shortTitle: "Hallucinations",
        topicGroup: "Risks & Reliability",
        estimatedDuration: 5,
        prerequisites: ["l04_where_llms_excel"],
    },
    {
        lessonId: "l06_bias_issues",
        lessonNumber: 6,
        lessonName: "Bias & Safety Issues",
        shortTitle: "Bias & Safety",
        topicGroup: "Risks & Reliability",
        estimatedDuration: 4,
        prerequisites: ["l05_hallucinations"],
    },
    {
        lessonId: "l07_data_privacy",
        lessonNumber: 7,
        lessonName: "Data Privacy & Security",
        shortTitle: "Data Privacy",
        topicGroup: "Risks & Reliability",
        estimatedDuration: 3,
        prerequisites: ["l06_bias_issues"],
    }
];

export const MOCK_QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
    "l01_what_llms_are": [
        {
            id: "q_l01_01",
            text: "What does LLM stand for?",
            options: [
                { text: "Large Language Model", is_correct: true },
                { text: "Linear Learning Machine", is_correct: false },
                { text: "Logical Language Module", is_correct: false },
                { text: "Limited Language Memory", is_correct: false }
            ],
            correctAnswer: "Large Language Model",
            explanation: "LLM stands for Large Language Model, which are AI systems trained on vast amounts of text data."
        },
        {
            id: "q_l01_02",
            text: "How do LLMs primarily work?",
            options: [
                { text: "By understanding human consciousness", is_correct: false },
                { text: "By predicting the next token in a sequence", is_correct: true },
                { text: "By querying a structured database", is_correct: false },
                { text: "By copying wikipedia articles", is_correct: false }
            ],
            correctAnswer: "By predicting the next token in a sequence",
            explanation: "At their core, LLMs are probabilistic engines that predict the most likely next word (token) based on context."
        },
        {
            id: "q_l01_03",
            text: "Which is an example of an LLM?",
            options: [
                { text: "Microsoft Excel", is_correct: false },
                { text: "GPT-4", is_correct: true },
                { text: "Adobe Photoshop", is_correct: false },
                { text: "Linux", is_correct: false }
            ],
            correctAnswer: "GPT-4",
            explanation: "GPT-4 is a popular Large Language Model developed by OpenAI."
        }
    ],
    "l03_prompting_basics": [
        {
            id: "q_l03_01", // ID kept for simplicity, content mismatch accepted as mock
            text: "Which is an example of an LLM?",
            options: [
                { text: "Microsoft Excel", is_correct: false },
                { text: "GPT-4", is_correct: true },
                { text: "Adobe Photoshop", is_correct: false },
                { text: "Linux", is_correct: false }
            ],
            correctAnswer: "GPT-4",
            explanation: "GPT-4 is a popular Large Language Model developed by OpenAI."
        }
    ]
};

export const MOCK_PRE_ASSESSMENT_QUESTIONS: QuizQuestion[] = [
    {
        id: "pa_01",
        text: "Have you used an LLM before?",
        options: [
            { text: "Never", is_correct: false },
            { text: "Once or twice", is_correct: false },
            { text: "Weekly", is_correct: false },
            { text: "Daily", is_correct: true }
        ],
        correctAnswer: "Daily", // Configuring "Daily" as the 'advanced' answer for logic simplicity
        explanation: "This helps us gauge your familiarity."
    },
    // Add more as needed
];
