"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useProgress } from "@/contexts/ProgressContext";
import { ApiService } from "@/lib/api/service";
import { Lock, ArrowRight, BookOpen, Zap, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const PATHWAY_COURSES = [
    {
        id: "c_llm_foundations",
        title: "Foundations of LLM",
        description: "Master the basics, understand tokens, and learn to write effective prompts.",
        status: "active",
        icon: FileText,
        color: "text-teal-600",
        bg: "bg-teal-50",
        border: "border-teal-200"
    },
    {
        id: "c_rag_arch",
        title: "RAG Architectures",
        description: "Connect LLMs to your own data to build powerful, context-aware applications.",
        status: "locked",
        icon: BookOpen,
        color: "text-gray-400",
        bg: "bg-gray-50",
        border: "border-gray-200"
    },
    {
        id: "c_agentic_ai",
        title: "Agentic AI Workflows",
        description: "Deploy autonomous agents that can plan and execute multi-step tasks.",
        status: "locked",
        icon: Zap,
        color: "text-gray-400",
        bg: "bg-gray-50",
        border: "border-gray-200"
    }
];

export default function PathwayScreen() {
    const router = useRouter();
    const { user } = useUser();
    const { updateProgress } = useProgress();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const profession = user?.onboardingResponses?.role || user?.profile?.profession || "Learner";

    const finalizePathway = async (redirectTarget: string) => {
        setIsSubmitting(true);
        try {
            // Submitting an empty array results in a 0 score, completing assessment
            // and placing user at the beginning of the foundational course.
            const result = await ApiService.submitPreAssessment([]);
            updateProgress({
                pre_assessment_completed: true,
                starting_lesson: result.startingLesson || "l01_what_llms_are",
            });
            router.replace(redirectTarget);
        } catch (error) {
            console.error("Failed to start pathway", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-teal-900 via-teal-800 to-gray-50 z-0"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" />

            {/* Header */}
            <header className="relative z-10 px-6 pt-16 pb-8 text-center text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-widest uppercase mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                    Your Personalised Pathway
                </div>
                <h1 className="text-3xl font-black mb-3 leading-tight tracking-tight">
                    Custom-built for your role as a <span className="text-teal-300">{profession}</span>
                </h1>
                <p className="text-teal-100 font-medium text-sm px-4">
                    We've designed a 3-step learning journey to help you achieve your goals faster.
                </p>
            </header>

            {/* Pathway Timeline */}
            <div className="relative z-10 flex-1 px-6 pb-32 w-full max-w-md mx-auto">
                <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-teal-200 via-gray-300 to-gray-200 z-0"></div>

                    <div className="space-y-6 relative z-10">
                        {PATHWAY_COURSES.map((course, index) => {
                            const isActive = course.status === "active";
                            return (
                                <div key={course.id} className="relative flex items-stretch gap-4 group">
                                    {/* Timeline Node */}
                                    <div className="flex flex-col items-center pt-3">
                                        <div className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-4 shadow-sm relative z-10 transition-transform duration-300 group-hover:scale-105",
                                            isActive ? "bg-white border-teal-100 text-teal-600 shadow-teal-500/10" : "bg-gray-100 border-white text-gray-400"
                                        )}>
                                            {isActive ? <span className="text-xl font-black">1</span> : <Lock size={20} strokeWidth={2.5} />}
                                        </div>
                                    </div>

                                    {/* Course Card */}
                                    <div
                                        onClick={() => isActive && setShowModal(true)}
                                        className={cn(
                                            "flex-1 rounded-[1.5rem] p-5 transition-all duration-300 border-2 shadow-sm relative overflow-hidden",
                                            isActive
                                                ? "bg-white border-teal-100 hover:border-teal-300 hover:shadow-md cursor-pointer"
                                                : "bg-white/60 border-transparent border-dashed cursor-not-allowed border-gray-200"
                                        )}
                                    >
                                        {isActive && (
                                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-teal-50 rounded-full blur-xl"></div>
                                        )}
                                        <div className="flex items-center gap-2 mb-1.5 relative z-10">
                                            <span className={cn("text-xs font-black uppercase tracking-widest", course.color)}>
                                                Step {index + 1}
                                            </span>
                                            {isActive && (
                                                <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[9px] font-bold rounded-full uppercase tracking-wider">
                                                    Up Next
                                                </span>
                                            )}
                                        </div>
                                        <h3 className={cn("font-black text-lg mb-1.5 leading-tight tracking-tight relative z-10", isActive ? "text-gray-900" : "text-gray-500")}>
                                            {course.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-medium leading-relaxed relative z-10">
                                            {course.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Action Bottom Bar (Sticky) */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent z-40">
                <div className="max-w-md mx-auto relative bottom-6">
                    <Button
                        className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-teal-500/20 bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2 transition-transform active:scale-95"
                        onClick={() => setShowModal(true)}
                    >
                        Start Learning <ArrowRight size={20} />
                    </Button>
                </div>
            </div>

            {/* Action Modal (Bottom Sheet style) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center p-4">
                    {/* Click outside to close */}
                    <div className="absolute inset-0" onClick={() => setShowModal(false)}></div>

                    <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 animate-in slide-in-from-bottom-10 fade-in duration-300 shadow-2xl">
                        {/* Drag Handle */}
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>

                        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Ready to begin?</h2>
                        <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed px-1">
                            You're about to start <strong>Foundations of LLM</strong>. How would you like to proceed?
                        </p>

                        <div className="space-y-3">
                            <Button
                                variant="default"
                                className="w-full h-14 rounded-xl font-bold bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/20 text-base flex justify-center items-center"
                                disabled={isSubmitting}
                                onClick={() => finalizePathway("/dashboard")}
                            >
                                {isSubmitting ? "Starting..." : "Start from Lesson 1"}
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full h-14 rounded-xl font-bold border-2 border-teal-100 text-teal-700 hover:bg-teal-50 bg-white shadow-sm flex justify-center items-center"
                                disabled={isSubmitting}
                                onClick={() => router.replace("/assessment")}
                            >
                                Take 2-min quiz to skip ahead
                            </Button>

                            <button
                                className="w-full pt-4 pb-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors tracking-wide underline decoration-gray-300 underline-offset-4"
                                disabled={isSubmitting}
                                onClick={() => finalizePathway("/portfolio")}
                            >
                                Wait, explore other courses first
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
