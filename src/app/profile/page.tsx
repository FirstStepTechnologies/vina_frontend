"use client";

import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, User, LogOut, Save, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const { user, updateUser, logout } = useUser();

    const [resolution, setResolution] = useState(user?.profile?.resolution || "");
    const [dailyGoal, setDailyGoal] = useState(user?.profile?.daily_goal_minutes || 10);
    const [isSaving, setIsSaving] = useState(false);
    const [showSavedMsg, setShowSavedMsg] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateUser({
                profile: {
                    ...user?.profile,
                    resolution,
                    daily_goal_minutes: dailyGoal
                }
            });
            setShowSavedMsg(true);
            setTimeout(() => setShowSavedMsg(false), 3000);
        } catch (error) {
            console.error("Failed to save profile", error);
        } finally {
            setIsSaving(false);
        }
    };

    const role = user?.onboardingResponses?.role || user?.profile?.profession || "Not set";

    return (
        <div className="flex flex-col min-h-screen bg-[#f0fdfa] pb-24">
            {/* Header */}
            <header className="px-6 py-8 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-teal-100/50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-black text-teal-900 tracking-tight">Profile & Resolution</h1>
                </div>
            </header>

            <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full space-y-8 animate-slide-up">
                {/* 2026 Resolution Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">💪</span>
                        <h2 className="text-lg font-black text-teal-900 uppercase tracking-widest">My 2026 Resolution</h2>
                    </div>
                    <Card className="p-6 bg-white border-teal-100 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full blur-2xl -translate-y-12 translate-x-12" />

                        <div className="space-y-6 relative z-10">
                            <div>
                                <label className="block text-xs font-black text-teal-600 uppercase tracking-widest mb-2">The "Why" Statement</label>
                                <textarea
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value)}
                                    placeholder="Enter your learning resolution..."
                                    className="w-full bg-teal-50/50 border-2 border-teal-100 rounded-2xl p-4 text-sm font-bold text-teal-900 focus:outline-none focus:border-teal-500 transition-all min-h-[100px] shadow-inner"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-teal-600 uppercase tracking-widest mb-2">Daily Commitment (Minutes)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="5"
                                        max="60"
                                        step="5"
                                        value={dailyGoal}
                                        onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                                        className="flex-1 accent-teal-600 h-2 bg-teal-100 rounded-full appearance-none cursor-pointer"
                                    />
                                    <span className="w-12 text-center font-black text-teal-900 text-lg">{dailyGoal}m</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleSave}
                                isLoading={isSaving}
                                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-teal-500/20"
                            >
                                <Save size={18} className="mr-2" />
                                Save Resolution
                            </Button>

                            {showSavedMsg && (
                                <div className="flex items-center justify-center gap-2 text-teal-600 font-bold animate-pulse">
                                    <CheckCircle2 size={16} />
                                    <span className="text-xs uppercase tracking-widest shrink-0">Updated successfully</span>
                                </div>
                            )}
                        </div>
                    </Card>
                </section>

                {/* Personalisation Summary */}
                <section id="tour-profile">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <User size={20} className="text-teal-600" />
                            <h2 className="text-lg font-black text-teal-900 uppercase tracking-widest">My Personalisation</h2>
                        </div>
                        <button
                            onClick={() => router.push('/profession')}
                            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-teal-100 rounded-lg text-[10px] font-black text-teal-600 uppercase tracking-widest hover:bg-teal-50 transition-colors shadow-sm"
                        >
                            <span className="text-xs">✏️</span>
                            Edit
                        </button>
                    </div>
                    <Card className="p-6 bg-white border-teal-100 shadow-sm relative overflow-hidden">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-[10px] font-black text-teal-600/60 uppercase tracking-widest">Role</span>
                                <span className="text-xs font-bold text-teal-900 uppercase tracking-tight">{role}</span>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Account Actions */}
                <section className="pt-4">
                    <Button
                        variant="secondary"
                        onClick={() => logout()}
                        className="w-full h-12 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-black uppercase tracking-widest rounded-xl"
                    >
                        <LogOut size={18} className="mr-2" />
                        Log Out
                    </Button>
                </section>
            </div>
        </div>
    );
}
