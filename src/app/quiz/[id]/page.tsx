"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ApiService } from "@/lib/api/service";
import { QuizQuestion as IQuizQuestion } from "@/lib/api/types";
import { QuizQuestion } from "@/components/ui/quiz-question";
import { Button } from "@/components/ui/button";

export default function QuizPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const [questions, setQuestions] = useState<IQuizQuestion[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [showNext, setShowNext] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const data = await ApiService.getQuiz(params.id);
            if (data && data.length > 0) {
                setQuestions(data);
            } else {
                // Fallback if no questions (mock data limitation)
                console.warn("No questions found for lesson", params.id);
                router.replace("/dashboard");
            }
            setIsLoading(false);
        }
        load();
    }, [params.id, router]);

    const handleAnswer = (selected: string, isCorrect: boolean) => {
        if (isCorrect) setScore(prev => prev + 1);

        // Show next button after interaction
        setShowNext(true);

        // Auto-advance logic (optional, but button is better for reading explanation)
    };

    const handleNext = () => {
        setShowNext(false);
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
        } else {
            // Finish
            router.push(`/quiz/${params.id}/results?score=${score + (showNext && questions[currentIdx].correctAnswer ? 0 : 0)}&total=${questions.length}`);
            // Passing score in query for simplicity, in real app likely via state or POST
            // Wait, handleAnswer already updated score for the CURRENT question if correct.
            // So passed score is correct.
        }
    };

    if (isLoading) return <div className="min-h-screen pt-20 text-center">Loading Quiz...</div>;
    if (questions.length === 0) return null;

    const currentQ = questions[currentIdx];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
            <header className="px-6 py-6 bg-white border-b border-gray-100 flex items-center">
                <button onClick={() => router.back()} className="mr-4 text-gray-500">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Quiz: Lesson {params.id.split('_')[0].slice(1)}</h1>
                    <p className="text-xs text-gray-500">Question {currentIdx + 1} of {questions.length}</p>
                </div>
            </header>

            {/* Progress */}
            <div className="w-full bg-gray-200 h-1">
                <div
                    className="bg-teal-500 h-1 transition-all duration-300"
                    style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                />
            </div>

            <div className="flex-1 px-6 py-8 flex flex-col max-w-lg mx-auto w-full">
                <div className="flex-1">
                    <QuizQuestion
                        key={currentQ.id} // Re-mount to reset state
                        question={currentQ}
                        onAnswer={handleAnswer}
                    />
                </div>

                {showNext && (
                    <div className="mt-8 pt-4 animate-slide-up">
                        <Button
                            className="w-full h-14 text-lg"
                            onClick={handleNext}
                        >
                            {currentIdx < questions.length - 1 ? "Next Question →" : "See Results"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
