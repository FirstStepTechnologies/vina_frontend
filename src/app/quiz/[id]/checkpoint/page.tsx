"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, BrainCircuit } from "lucide-react";
import { ApiService } from "@/lib/api/service";
import { QuizQuestion as IQuizQuestion } from "@/lib/api/types";
import { QuizQuestion } from "@/components/ui/quiz-question";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/contexts/ProgressContext";

export default function CheckpointQuizPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { completeLesson } = useProgress();
    const [questions, setQuestions] = useState<IQuizQuestion[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [showNext, setShowNext] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            // In a real app, this would get specific "Checkpoint" questions
            // For mock, we reuse the lesson quiz questions
            const data = await ApiService.getQuiz(params.id);
            if (data && data.length > 0) {
                setQuestions(data);
            } else {
                router.replace(`/lesson/${params.id}`);
            }
            setIsLoading(false);
        }
        load();
    }, [params.id, router]);

    const handleAnswer = (selected: string, isCorrect: boolean) => {
        if (isCorrect) setScore(prev => prev + 1);
        setShowNext(true);
    };

    const handleNext = () => {
        setShowNext(false);
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
        } else {
            finishCheckpoint();
        }
    };

    const finishCheckpoint = () => {
        const finalScore = score + (showNext && questions[currentIdx].correctAnswer ? 0 : 0); // Logic correction if needed
        // Actually handleAnswer updates score for current q.

        // Checkpoint pass logic (strict 2/3 or 3/3)
        const passed = score >= 2;

        if (passed) {
            // Mark lesson complete immediately
            completeLesson(params.id, score, questions.length);
            // Navigate to dashboard
            router.push("/dashboard");
        } else {
            // Fail: Go back to lesson
            router.push(`/lesson/${params.id}?msg=checkpoint_failed`);
        }
    };

    if (isLoading) return <div className="min-h-screen pt-20 text-center">Loading Assessment...</div>;
    if (questions.length === 0) return null;

    const currentQ = questions[currentIdx];

    return (
        <div className="flex flex-col min-h-screen bg-teal-50 pb-20">
            <header className="px-6 py-6 bg-white border-b border-teal-100 flex items-center">
                <button onClick={() => router.back()} className="mr-4 text-gray-400 hover:text-gray-600">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <BrainCircuit className="text-teal-600" size={20} />
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Knowledge Checkpoint</h1>
                        <p className="text-xs text-gray-500">Prove your skills to skip ahead</p>
                    </div>
                </div>
            </header>

            {/* Progress */}
            <div className="w-full bg-gray-200 h-1">
                <div
                    className="bg-teal-600 h-1 transition-all duration-300"
                    style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                />
            </div>

            <div className="flex-1 px-6 py-8 flex flex-col max-w-lg mx-auto w-full">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100 mb-6">
                    <QuizQuestion
                        key={currentQ.id}
                        question={currentQ}
                        onAnswer={handleAnswer}
                    />
                </div>

                {showNext && (
                    <div className="animate-slide-up">
                        <Button
                            className="w-full h-14 text-lg"
                            onClick={handleNext}
                        >
                            {currentIdx < questions.length - 1 ? "Next Question →" : "Finish Checkpoint"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
