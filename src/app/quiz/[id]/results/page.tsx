"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useProgress } from "@/contexts/ProgressContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import confetti from "canvas-confetti";

import { useUser } from "@/contexts/UserContext";
import { CelebrationOverlay } from "@/app/lesson/[id]/components/CelebrationOverlay";

export default function QuizResultsPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const { user } = useUser();
    const { progress, completeLesson, addDiamonds, addMinutes } = useProgress();

    const score = parseInt(searchParams.get("score") || "0");
    const total = parseInt(searchParams.get("total") || "3");
    const passed = score >= 2;

    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationStats, setCelebrationStats] = useState({
        diamondsEarned: 0,
        streakEarned: false,
        minutes_today: 0,
        minutes_this_week: 0,
        minutes_total: 0,
        dailyGoalAchieved: false,
        dailyGoalMinutes: 0
    });

    useEffect(() => {
        if (passed) {
            completeLesson(params.id);

            // Gamification Logic
            const diamondReward = score * 10;
            const dailyGoal = user?.profile?.daily_goal_minutes || 10;
            const reachedGoal = progress.minutes_today >= dailyGoal && (progress.minutes_today - 2) < dailyGoal; // Approximation

            addDiamonds(diamondReward);

            setCelebrationStats({
                diamondsEarned: diamondReward,
                streakEarned: false,
                minutes_today: progress.minutes_today,
                minutes_this_week: progress.minutes_this_week,
                minutes_total: progress.minutes_total,
                dailyGoalAchieved: reachedGoal,
                dailyGoalMinutes: dailyGoal
            });

            setShowCelebration(true);

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleContinueToDashboard = () => {
        router.replace("/dashboard");
    };

    const handleRetry = () => {
        router.replace(`/lesson/${params.id}`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center relative">
            <CelebrationOverlay
                isOpen={showCelebration}
                onContinue={handleContinueToDashboard}
                buttonText="Finish Lesson"
                stats={celebrationStats}
            />

            <Card className="w-full max-w-sm flex flex-col items-center p-8 animate-slide-up">
                {passed ? (
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                        <CheckCircle size={48} />
                    </div>
                ) : (
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
                        <XCircle size={48} />
                    </div>
                )}

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {passed ? "Lesson Complete!" : "Not quite there"}
                </h1>

                <p className="text-gray-500 mb-6">
                    You got <strong className={passed ? "text-green-600" : "text-red-500"}>{score}/{total}</strong> correct
                </p>

                {passed && (
                    <div className="flex gap-4 mb-8 w-full justify-center">
                        <div className="text-center">
                            <span className="block text-2xl mb-1">🔥</span>
                            <span className="text-xs font-bold text-gray-500 uppercase">Streak</span>
                        </div>
                        <div className="w-px bg-gray-200" />
                        <div className="text-center">
                            <span className="block text-2xl mb-1">💎</span>
                            <span className="text-xs font-bold text-gray-500 uppercase">+{score * 10} Pts</span>
                        </div>
                    </div>
                )}

                <Button
                    className="w-full h-14 text-lg mb-3"
                    onClick={passed ? handleContinueToDashboard : handleRetry}
                    variant={passed ? "default" : "secondary"}
                >
                    {passed ? "Continue Learning" : "Review Lesson"}
                </Button>

                {!passed && (
                    <button onClick={handleContinueToDashboard} className="text-sm text-gray-400 font-medium hover:text-gray-600">
                        Skip for now
                    </button>
                )}
            </Card>
        </div>
    );
}
