"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ApiService } from "@/lib/api/service";
import { QuizQuestion as IQuizQuestion } from "@/lib/api/types";
import { QuizQuestion } from "@/components/ui/quiz-question";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { trackEvent } from "@/lib/analytics";

export default function QuizPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { user } = useUser();
    const [questions, setQuestions] = useState<IQuizQuestion[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [showNext, setShowNext] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const quizStartedAt = useRef<number>(Date.now());
    const questionStartedAt = useRef<number>(Date.now());

    useEffect(() => {
        async function load() {
            const profession = user?.profile?.profession;
            const data = await ApiService.getQuiz(params.id, profession);
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

    // Fire quiz_started event when questions load
    useEffect(() => {
        if (questions.length === 0) return;
        quizStartedAt.current = Date.now();
        questionStartedAt.current = Date.now();
        trackEvent('quiz_started', {
            lesson_id: params.id,
            question_count: questions.length,
        });
    }, [questions.length]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAnswer = (selected: string, isCorrect: boolean) => {
        const timeOnQuestion = Math.round((Date.now() - questionStartedAt.current) / 1000);
        const currentQ = questions[currentIdx];

        trackEvent('quiz_answer_submitted', {
            lesson_id: params.id,
            question_id: currentQ?.id,
            is_correct: isCorrect,
            time_on_question_s: timeOnQuestion,
        });

        if (isCorrect) setScore(prev => prev + 1);

        // Show next button after interaction
        setShowNext(true);

        // Auto-advance logic (optional, but button is better for reading explanation)
    };

    const handleNext = () => {
        setShowNext(false);
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
            questionStartedAt.current = Date.now(); // Reset per-question timer
        } else {
            // Finish — fire quiz_completed before navigating
            const quizDurationS = Math.round((Date.now() - quizStartedAt.current) / 1000);
            const finalScore = score; // current score (already updated by handleAnswer)
            trackEvent('quiz_completed', {
                lesson_id: params.id,
                score: finalScore,
                total: questions.length,
                quiz_duration_s: quizDurationS,
            });
            router.push(`/quiz/${params.id}/results?score=${finalScore}&total=${questions.length}`);
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

            <div className="flex-1 px-6 py-8 flex flex-col max-w-lg mx-auto w-full" id="tour-quiz">
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
