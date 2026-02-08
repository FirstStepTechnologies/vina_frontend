"use client";

import { useProgress } from "@/contexts/ProgressContext";
import { useUser } from "@/contexts/UserContext";
import { Card } from "@/components/ui/card";
import { BarChart3, CheckCircle, Clock, Flame, Gem, Heart, Trophy } from "lucide-react";
import { MOCK_LESSONS } from "@/lib/api/mock-data";
import { cn } from "@/lib/utils";

export default function ProgressPage() {
    const { progress } = useProgress();
    const { user } = useUser();

    const completionPercent = Math.round((progress.completedLessons.length / 17) * 100);

    // Get recent activity
    const recentLessons = progress.completedLessons
        .slice()
        .reverse()
        .slice(0, 3)
        .map(id => MOCK_LESSONS.find(l => l.lessonId === id))
        .filter(Boolean);

    return (
        <div className="min-h-screen p-6 bg-[#f0fdfa] pt-10 pb-24 relative overflow-hidden">
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/20 blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-md mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-teal-900 drop-shadow-sm">Your Progress</h1>
                        <p className="text-sm text-teal-600/70 font-medium">Keep up the great momentum!</p>
                    </div>
                    <Trophy className="text-amber-400" size={32} strokeWidth={2.5} />
                </div>

                {/* Unified Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Diamonds */}
                    <Card className="p-5 border-blue-100 bg-white shadow-sm flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                            <Gem size={28} fill="#3b82f6" fillOpacity={0.2} className="text-blue-500" strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-black text-blue-900 leading-none">{progress.diamonds || 0}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 mt-2">Diamonds</span>
                    </Card>

                    {/* Streak */}
                    <Card className="p-5 border-orange-100 bg-white shadow-sm flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-3">
                            <Flame size={28} fill="#f97316" fillOpacity={0.2} className="text-orange-500" strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-black text-orange-900 leading-none">{progress.streak || 0}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 mt-2">Day Streak</span>
                    </Card>

                    {/* Today's Minutes */}
                    <Card className="p-5 border-teal-100 bg-white shadow-sm flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-3">
                            <Clock size={28} className="text-teal-600" strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-black text-teal-900 leading-none">{progress.minutesToday || 0}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 mt-2">Mins Today</span>
                    </Card>

                    {/* Total Lessons */}
                    <Card className="p-5 border-purple-100 bg-white shadow-sm flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-3">
                            <CheckCircle size={28} className="text-purple-600" strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-black text-purple-900 leading-none">{progress.completedLessons.length}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 mt-2">Lessons</span>
                    </Card>
                </div>

                {/* Social Impact Reinforced */}
                <Card className="mb-8 border-teal-100 bg-teal-50/50 p-6 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-[0.05] group-hover:scale-125 transition-transform duration-1000">
                        <Heart size={120} fill="currentColor" className="text-teal-600" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                                <Heart size={20} fill="white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-teal-900 uppercase tracking-widest">Global Impact</h3>
                                <p className="text-xs font-bold text-teal-600">You're making a difference</p>
                            </div>
                        </div>
                        <p className="text-sm font-bold text-teal-800 leading-relaxed italic">
                            "By spending {progress.totalLearningTimeSeconds / 60 >= 1 ? Math.floor(progress.totalLearningTimeSeconds / 60) : progress.minutesToday} minutes on Vina, you've funded an equal amount of education for children in need. Your learning empowers the world."
                        </p>
                    </div>
                </Card>

                {/* Course Completion Progress */}
                <div className="mb-8 p-6 bg-white rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="flex justify-between items-end mb-3">
                        <h2 className="font-black text-gray-900 tracking-tight uppercase text-xs opacity-50">Course Mastery</h2>
                        <span className="font-black text-teal-600">{completionPercent}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                        <div
                            className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-1000"
                            style={{ width: `${completionPercent}%` }}
                        />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 mt-3 uppercase tracking-widest">
                        {progress.completedLessons.length} OF 17 LESSONS COMPLETED
                    </p>
                </div>

                {/* Recent Activity */}
                <div>
                    <h2 className="font-black text-gray-900 mb-4 tracking-tight uppercase text-xs opacity-50 px-2 text-center">Recent Activity</h2>
                    {recentLessons.length > 0 ? (
                        <div className="space-y-3 px-2">
                            {recentLessons.map((lesson: any) => (
                                <div key={lesson.lessonId} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm active:scale-95 transition-transform">
                                    <div>
                                        <p className="font-black text-gray-900 text-sm leading-tight">{lesson.shortTitle}</p>
                                        <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mt-1">Completed</p>
                                    </div>
                                    <div className="bg-teal-50 p-2 rounded-xl text-teal-600">
                                        <CheckCircle size={18} strokeWidth={3} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center">
                            <p className="text-gray-400 text-sm font-bold italic">No recent activity yet. Start a lesson to track progress!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
