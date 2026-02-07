"use client";

import { useEffect, useState } from "react";
import { Lock, CheckCircle, Clock } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { useUser } from "@/contexts/UserContext";
import { ApiService } from "@/lib/api/service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuizQuestion as IQuizQuestion } from "@/lib/api/types";
import { QuizQuestion } from "@/components/ui/quiz-question";

export default function PracticePage() {
    const { progress, updateProgress } = useProgress();
    const { user } = useUser();

    const [questions, setQuestions] = useState<IQuizQuestion[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [isPracticing, setIsPracticing] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const hasCompletedLessons = progress.completedLessons.length > 0;
    // Simple check for "today" practice
    const today = new Date().toISOString().split("T")[0];
    const hasPracticedToday = progress.lastPracticeDate === today;

    useEffect(() => {
        if (hasPracticedToday) {
            setIsCompleted(true);
        }
    }, [hasPracticedToday]);

    const startPractice = async () => {
        // In real app, fetch personalized questions
        // Here we just fetch mock
        setIsPracticing(true);
        const data = await ApiService.getQuiz("l01_what_llms_are"); // Just mock data
        setQuestions(data);
    };

    const handleAnswer = (selected: string, isCorrect: boolean) => {
        if (isCorrect) setScore(prev => prev + 1);

        setTimeout(() => {
            if (currentIdx < questions.length - 1) {
                setCurrentIdx(prev => prev + 1);
            } else {
                finishPractice();
            }
        }, 1000);
    };

    const finishPractice = () => {
        const finalScore = score + (questions[questions.length - 1].correctAnswer ? 0 : 0); // Correct logic for last q handled in handleAnswer mostly
        // Wait, handleAnswer increments score if correct.

        updateProgress({
            lastPracticeDate: today,
            practicePointsToday: score * 10,
            totalPoints: progress.totalPoints + (score * 10)
        });

        setIsPracticing(false);
        setIsCompleted(true);
    };

    if (!hasCompletedLessons) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Lock size={32} />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Daily Practice Locked</h1>
                <p className="text-gray-500 mb-6 max-w-xs">
                    Complete your first lesson to unlock personalized daily text-based practice.
                </p>
                <Button onClick={() => window.location.href = '/dashboard'}>
                    Go to Lessons
                </Button>
            </div>
        );
    }

    if (isCompleted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 animate-bounce">
                    <CheckCircle size={48} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h1>
                <p className="text-gray-500 mb-6">
                    You've completed your daily practice for today. Come back tomorrow!
                </p>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <Clock className="text-teal-600" size={20} />
                    <span className="font-medium text-gray-700">Next challenge in 14h 32m</span>
                </div>
            </div>
        );
    }

    if (isPracticing && questions.length > 0) {
        const currentQ = questions[currentIdx];
        return (
            <div className="min-h-screen p-6 bg-gray-50 flex flex-col pt-10">
                <div className="mb-6 flex justify-between items-center">
                    <span className="font-bold text-gray-500">Practice</span>
                    <span className="text-teal-600 font-bold">{currentIdx + 1}/{questions.length}</span>
                </div>

                <div className="flex-1">
                    <QuizQuestion
                        key={currentQ.id}
                        question={currentQ}
                        onAnswer={handleAnswer}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-gray-50 pt-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Let's Practice 📝</h1>

            <Card className="mb-8">
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Daily Challenge</h2>
                    <p className="text-gray-500 text-sm">Test your knowledge from completed lessons.</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">🎯</span>
                        <span className="text-sm font-medium text-gray-700">3 Questions</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-lg">💎</span>
                        <span className="text-sm font-medium text-gray-700">10 pts each</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-lg">🔥</span>
                        <span className="text-sm font-medium text-gray-700">Keep your streak</span>
                    </div>
                </div>

                <Button className="w-full" onClick={startPractice}>
                    Start Practice →
                </Button>
            </Card>

            <p className="text-sm text-center text-gray-400">
                Reviewing content from L01-L{progress.completedLessons.length}
            </p>
        </div>
    );
}
