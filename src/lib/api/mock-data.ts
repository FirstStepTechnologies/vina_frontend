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
        lessonId: "l03_why_outputs_vary",
        lessonNumber: 3,
        lessonName: "Why Outputs Vary",
        shortTitle: "Output Variation",
        topicGroup: "The Foundations",
        estimatedDuration: 4,
        prerequisites: ["l02_tokens_context"],
    },
    {
        lessonId: "l04_where_llms_excel",
        lessonNumber: 4,
        lessonName: "Where LLMs Excel",
        shortTitle: "LLM Strengths",
        topicGroup: "The Foundations",
        estimatedDuration: 3,
        prerequisites: ["l03_why_outputs_vary"],
    },
    {
        lessonId: "l05_hallucinations",
        lessonNumber: 5,
        lessonName: "Hallucinations & Accuracy",
        shortTitle: "Hallucinations",
        topicGroup: "Risks & Limitations",
        estimatedDuration: 5,
        prerequisites: ["l04_where_llms_excel"],
    },
    // Adding a few more for the mock
    {
        lessonId: "l06_bias_issues",
        lessonNumber: 6,
        lessonName: "Bias in LLMs",
        shortTitle: "Bias Issues",
        topicGroup: "Risks & Limitations",
        estimatedDuration: 4,
        prerequisites: ["l05_hallucinations"],
    },
    {
        lessonId: "l17_final_project",
        lessonNumber: 17,
        lessonName: "Putting it all together",
        shortTitle: "Final Project",
        topicGroup: "Advanced",
        estimatedDuration: 10,
        prerequisites: ["l16_advanced_prompting"], // simplified for mock
    }
];

export const MOCK_QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
    "l01_what_llms_are": [
        {
            id: "q_l01_01",
            questionText: "What does LLM stand for?",
            options: [
                "Large Language Model",
                "Linear Learning Machine",
                "Logical Language Module",
                "Limited Language Memory"
            ],
            correctAnswer: "Large Language Model",
            explanation: "LLM stands for Large Language Model, which are AI systems trained on vast amounts of text data."
        },
        {
            id: "q_l01_02",
            questionText: "How do LLMs primarily work?",
            options: [
                "By understanding human consciousness",
                "By predicting the next token in a sequence",
                "By querying a structured database",
                "By copying wikipedia articles"
            ],
            correctAnswer: "By predicting the next token in a sequence",
            explanation: "At their core, LLMs are probabilistic engines that predict the most likely next word (token) based on context."
        },
        {
            id: "q_l01_03",
            questionText: "Which is an example of an LLM?",
            options: [
                "Microsoft Excel",
                "GPT-4",
                "Adobe Photoshop",
                "Linux"
            ],
            correctAnswer: "GPT-4",
            explanation: "GPT-4 is a popular Large Language Model developed by OpenAI."
        }
    ]
};

export const MOCK_PRE_ASSESSMENT_QUESTIONS: QuizQuestion[] = [
    {
        id: "pa_01",
        questionText: "Have you used an LLM before?",
        options: ["Never", "Once or twice", "Weekly", "Daily"],
        correctAnswer: "Daily", // Configuring "Daily" as the 'advanced' answer for logic simplicity
        explanation: "This helps us gauge your familiarity."
    },
    // Add more as needed
];
