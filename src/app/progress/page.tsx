"use client";

import { useProgress } from "@/contexts/ProgressContext";
import { useUser } from "@/contexts/UserContext";
import { Card } from "@/components/ui/card";
import { BarChart3, CheckCircle, Clock, Flame } from "lucide-react";
import { MOCK_LESSONS } from "@/lib/api/mock-data";

export default function ProgressPage() {
    const { progress } = useProgress();
    const { user } = useUser();

    const completionPercent = Math.round((progress.completedLessons.length / 17) * 100);

    // Get recent activity (mocking lessons data join)
    const recentLessons = progress.completedLessons
        .slice()
        .reverse()
        .slice(0, 3)
        .map(id => {
            const lesson = MOCK_LESSONS.find(l => l.lessonId === id);
            return lesson;
        })
        .filter(Boolean);

    return (
        <div className="min-h-screen p-6 bg-gray-50 pt-10 pb-24">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Progress 📊</h1>

            {/* Overview Card */}
            <Card className="mb-6 border-none bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        <span className="text-teal-100 text-sm font-medium">Total Points</span>
                        <span className="text-3xl font-bold">{progress.totalPoints}</span>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl">💎</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                    <div className="flex items-center gap-2">
                        <Flame className="text-orange-300" size={20} />
                        <div>
                            <p className="text-xs text-teal-100">Streak</p>
                            <p className="font-bold">{progress.streak} Days</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-300" size={20} />
                        <div>
                            <p className="text-xs text-teal-100">Completed</p>
                            <p className="font-bold">{progress.completedLessons.length} Lessons</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Course Progress */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                    <h2 className="font-bold text-gray-800">Overall Course</h2>
                    <span className="font-bold text-teal-600">{completionPercent}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-teal-600 rounded-full transition-all duration-1000"
                        style={{ width: `${completionPercent}%` }}
                    />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    {progress.completedLessons.length}/17 Lessons Completed
                </p>
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="font-bold text-gray-800 mb-4">Recent Activity</h2>
                {recentLessons.length > 0 ? (
                    <div className="space-y-3">
                        {recentLessons.map((lesson: any) => (
                            <div key={lesson.lessonId} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{lesson.shortTitle}</p>
                                    <p className="text-xs text-gray-400">Completed</p>
                                </div>
                                <div className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">
                                    Passed
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm italic">No recent activity yet.</p>
                )}
            </div>
        </div>
    );
}
