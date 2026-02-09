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
import { CelebrationOverlay } from "@/app/lesson/[id]/components/CelebrationOverlay";

export default function PracticePage() {
    const { progress, updateProgress, addMinutes, addDiamonds } = useProgress();
    const { user } = useUser();

    const [questions, setQuestions] = useState<IQuizQuestion[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [isPracticing, setIsPracticing] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    // Celebration State
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

    const hasCompletedLessons = progress.completed_lessons.length > 0;
    // Note: lastPracticeDate field doesn't exist in VinaProgress type
    // For now, we'll always allow practice (can be enhanced later)
    const hasPracticedToday = false; // Disabled until backend supports this field

    useEffect(() => {
        if (hasPracticedToday) {
            setIsCompleted(true);
        }
    }, [hasPracticedToday]);

    const startPractice = async () => {
        setIsPracticing(true);
        const data = await ApiService.getQuiz("l01_what_llms_are"); // Just mock data
        setQuestions(data);
    };

    const handleAnswer = (selected: string, isCorrect: boolean) => {
        const newScore = isCorrect ? score + 1 : score;
        if (isCorrect) setScore(newScore);

        setTimeout(() => {
            if (currentIdx < questions.length - 1) {
                setCurrentIdx(prev => prev + 1);
            } else {
                finishPractice(newScore);
            }
        }, 1000);
    };

    const finishPractice = (finalScoreOverride?: number) => {
        // Use the passed-in score to avoid closure staleness
        const finalScore = typeof finalScoreOverride === 'number' ? finalScoreOverride : score;

        // Gamification Logic for Practice
        const practiceMins = 2; // Fixed time for daily challenge
        const newMinutesToday = progress.minutes_today + practiceMins;
        const dailyGoal = user?.profile?.daily_goal_minutes || 10;
        const reachedGoal = newMinutesToday >= dailyGoal && progress.minutes_today < dailyGoal;
        const diamondReward = finalScore * 10; // 10 pts per correct answer

        // Update Global State - removed lastPracticeDate and practicePointsToday as they don't exist in VinaProgress type
        // These would need to be added to the backend type definition if needed

        addDiamonds(diamondReward);
        addMinutes(practiceMins);

        const isFirstOfToday = progress.minutes_today === 0;
        if (isFirstOfToday) {
            updateProgress({ streak: progress.streak + 1 });
        }

        setCelebrationStats({
            diamondsEarned: diamondReward,
            streakEarned: isFirstOfToday,
            minutes_today: newMinutesToday,
            minutes_this_week: progress.minutes_this_week + practiceMins,
            minutes_total: progress.minutes_total + practiceMins,
            dailyGoalAchieved: reachedGoal,
            dailyGoalMinutes: dailyGoal
        });

        setIsPracticing(false);
        setShowCelebration(true);
    };

    const handleContinueToResult = () => {
        setShowCelebration(false);
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
                <div className="flex flex-col w-full gap-3">
                    <Button onClick={() => window.location.href = '/dashboard'} className="h-14 font-black text-lg rounded-2xl">
                        Go to Lessons
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0fdfa] relative">
            <CelebrationOverlay
                isOpen={showCelebration}
                onContinue={handleContinueToResult}
                buttonText="Finish Practice"
                stats={celebrationStats}
            />

            {isCompleted ? (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-xl text-green-500 border-2 border-green-50 transform rotate-12">
                        <CheckCircle size={48} strokeWidth={3} />
                    </div>
                    <h1 className="text-3xl font-black text-teal-900 mb-3 tracking-tight">You're all set!</h1>
                    <p className="text-teal-600/70 font-bold mb-10 max-w-[240px]">
                        You've smashed your daily practice. Come back tomorrow for more!
                    </p>
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-teal-50 flex items-center gap-4">
                        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                            <Clock size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest leading-none mb-1">Next Challenge</p>
                            <span className="font-black text-teal-900">in 14h 32m</span>
                        </div>
                    </div>
                </div>
            ) : isPracticing && questions.length > 0 ? (
                <div className="min-h-screen p-6 flex flex-col pt-12 max-w-lg mx-auto w-full">
                    <div className="mb-8 flex justify-between items-center bg-white/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/50 shadow-sm">
                        <span className="font-black text-teal-900/40 uppercase tracking-widest text-xs">Daily Challenge</span>
                        <div className="bg-teal-600 px-3 py-1 rounded-full">
                            <span className="text-white font-black text-xs">{currentIdx + 1}/{questions.length}</span>
                        </div>
                    </div>

                    <div className="flex-1 animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-teal-900/5 border border-teal-50">
                            <QuizQuestion
                                key={questions[currentIdx].id}
                                question={questions[currentIdx]}
                                onAnswer={handleAnswer}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="min-h-screen p-6 pt-16 max-w-lg mx-auto w-full flex flex-col">
                    <div className="mb-10 text-center">
                        <h1 className="text-4xl font-black text-teal-900 tracking-tight leading-tight">Let's<br />Practice 📝</h1>
                        <p className="text-teal-600/70 font-bold mt-3">Sharpen your skills today</p>
                    </div>

                    <Card className="mb-8 p-8 border-teal-100 bg-white shadow-xl shadow-teal-900/5 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                            <CheckCircle size={150} />
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-xl font-black text-teal-900 mb-2">Daily Sprint</h2>
                            <p className="text-teal-600/70 font-bold text-sm mb-8">Personalised questions based on your history.</p>

                            <div className="grid grid-cols-1 gap-4 mb-8">
                                <div className="flex items-center gap-4 bg-teal-50 p-4 rounded-2xl border border-teal-100/50">
                                    <span className="text-2xl">🎯</span>
                                    <div>
                                        <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest leading-none mb-1">Target</p>
                                        <p className="font-black text-teal-900 leading-none">3 Questions</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100/50">
                                    <span className="text-2xl">💎</span>
                                    <div>
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">Reward</p>
                                        <p className="font-black text-blue-900 leading-none">30 Diamonds</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-orange-50 p-4 rounded-2xl border border-orange-100/50">
                                    <span className="text-2xl">🔥</span>
                                    <div>
                                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest leading-none mb-1">Status</p>
                                        <p className="font-black text-orange-900 leading-none">Keep Streak</p>
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full h-16 text-xl font-black rounded-2xl bg-teal-600 shadow-xl shadow-teal-500/20 hover:bg-teal-700 transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={startPractice}>
                                Start Sprint →
                            </Button>
                        </div>
                    </Card>

                    <p className="text-xs font-black text-center text-teal-900/30 uppercase tracking-[0.2em] mt-auto pb-8">
                        L01-L{progress.completed_lessons.length} REVIEW
                    </p>
                </div>
            )}
        </div>
    );
}
