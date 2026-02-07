"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ApiService } from "@/lib/api/service";
import { useProgress } from "@/contexts/ProgressContext";
import { useUser } from "@/contexts/UserContext";
import { QuizQuestion } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export default function AssessmentScreen() {
    const router = useRouter();
    const { updateProgress } = useProgress();
    const { user } = useUser();

    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> selectedOption
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load questions
    useEffect(() => {
        async function loadQuiz() {
            try {
                const data = await ApiService.getPreAssessment();
                setQuestions(data);
            } catch (err) {
                console.error("Failed to load assessment", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadQuiz();
    }, []);

    const handleSelect = (option: string) => {
        if (!questions[currentIdx]) return;

        const questionId = questions[currentIdx].id;
        setAnswers(prev => ({ ...prev, [questionId]: option }));

        // Auto-advance after short delay
        setTimeout(() => {
            if (currentIdx < questions.length - 1) {
                setCurrentIdx(prev => prev + 1);
            } else {
                submitAssessment();
            }
        }, 400);
    };

    const submitAssessment = async () => {
        setIsSubmitting(true);
        // Build answers array for API
        const answersArray = Object.entries(answers).map(([qId, selected]) => ({
            questionId: qId,
            selected,
            // In real app, correctness checked on server for pre-assessment often
            // but here we might just pass selections
        }));

        try {
            const result = await ApiService.submitPreAssessment(answersArray);

            // Update progress context
            updateProgress({
                preAssessmentCompleted: true,
                preAssessmentScore: result.score,
                startingLesson: result.startingLesson,
                preAssessmentDate: new Date().toISOString()
            });

            // Navigate to dashboard
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to submit assessment", error);
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        // Default start
        updateProgress({
            preAssessmentCompleted: false,
            startingLesson: "l01_what_llms_are",
        });
        router.push("/dashboard");
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (isSubmitting) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900">Personalizing your course...</h2>
            <p className="text-gray-500 mt-2">Designing a learning path just for you</p>
        </div>
    );

    const currentQuestion = questions[currentIdx];
    const progressPercent = ((currentIdx + 1) / questions.length) * 100;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header */}
            <header className="px-6 py-6 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Pre-Assessment</span>
                    <span className="text-xs text-gray-400">Step 2 of 2</span>
                </div>
                <button onClick={handleSkip} className="text-gray-400 text-sm font-medium hover:text-teal-600">
                    Skip
                </button>
            </header>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-1">
                <div
                    className="bg-teal-600 h-1 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            <div className="flex-1 px-6 py-8 flex flex-col max-w-lg mx-auto w-full">
                <div className="mb-8">
                    <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full mb-4">
                        Question {currentIdx + 1} of {questions.length}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                        {currentQuestion.questionText}
                    </h2>
                </div>

                <div className="space-y-3 flex-1">
                    {currentQuestion.options.map((option) => (
                        <button
                            key={option}
                            onClick={() => handleSelect(option)}
                            className={cn(
                                "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-lg font-medium",
                                answers[currentQuestion.id] === option
                                    ? "border-teal-600 bg-teal-50 text-teal-800"
                                    : "border-gray-200 text-gray-700 hover:border-teal-300 hover:bg-gray-50"
                            )}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
