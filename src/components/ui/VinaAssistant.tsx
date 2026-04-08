"use client";

import { useState, useEffect, useMemo } from "react";
import { useProgress } from "@/contexts/ProgressContext";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import { X, ChevronRight, Sparkles } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface TourStep {
    id: number;
    title: string;
    message: string;
    targetId?: string; // HTML ID to highlight if needed
    page: string; // Pathname where this step should show
    action?: () => void; // Optional action (like navigating)
}

export function VinaAssistant() {
    const { progress, updateProgress } = useProgress();
    const router = useRouter();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [bubbleStyle, setBubbleStyle] = useState<React.CSSProperties>({});

    const TOUR_STEPS: TourStep[] = useMemo(() => [
        {
            id: 0,
            page: "/dashboard",
            title: "Welcome to Vina! 👋",
            message: "I'm Vina, your AI Learning Assistant. Let me show you how we'll build your learning habit together.",
        },
        {
            id: 1,
            page: "/dashboard",
            title: "Your 2026 Resolution 💪",
            message: "This is your anchor. Your personal 'Why' and your daily minute goal are tracked here. Hit your goal to earn +100 Diamonds!",
            targetId: "tour-resolution",
        },
        {
            id: 2,
            page: "/dashboard",
            title: "Professional Growth Stats 💎",
            message: "Keep an eye on your Diamonds, Streaks, and daily Learning Minutes here. They grow as your expertise does.",
            targetId: "tour-stats",
        },
        {
            id: 3,
            page: "/dashboard",
            title: "Your Tailored Pathway 🗺️",
            message: "Vina builds this path just for you. Each node is a lesson specially curated for your role and industry.",
            targetId: "tour-path",
        },
        {
            id: 4,
            page: "/dashboard",
            title: "Start Your Journey",
            message: "Let's dive into your first lesson to see the AI in action!",
            action: () => {
                router.push("/lesson/l01_what_llms_are");
            }
        },
        {
            id: 5,
            page: "/lesson",
            title: "The Lesson Room 📽️",
            message: "Here's where the core learning happens. Watch the video to gain new professional insights.",
        },
        {
            id: 6,
            page: "/lesson",
            title: "Guided Flow ✨",
            message: "Lessons now unfold in short segments with quick checkpoints and reflection moments, so the experience keeps moving without feeling heavy.",
            action: () => {
                router.push("/profile");
            }
        },
        {
            id: 7,
            page: "/profile",
            title: "My Personalisation 👤",
            message: "Your profile stores your professional goals and learning context, and it helps Vina request the right lesson experience for you.",
        },
        {
            id: 8,
            page: "/profile",
            title: "Stay Aligned",
            message: "You can update your 2026 Resolution here anytime to keep your learning habit anchored to a real goal.",
            targetId: "tour-profile",
        },
        {
            id: 9,
            page: "/profile",
            title: "Ready to Grow! 🚀",
            message: "You're all set to master AI. Your journey starts now. Good luck, and enjoy building your learning habit!",
            action: () => {
                router.push("/dashboard");
            }
        }
    ], [router]);

    const currentStep = TOUR_STEPS.find(s => s.id === progress.currentTourStep);

    // Dynamic positioning and collision detection
    useEffect(() => {
        const updatePosition = () => {
            if (currentStep?.targetId) {
                const el = document.getElementById(currentStep.targetId);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setTargetRect(rect);

                    // Position bubble intelligently relative to the rect
                    const padding = 20;
                    const bubbleWidth = 280;
                    const bubbleHeight = 160; // Approximate

                    let top = rect.bottom + padding;
                    let left = rect.left + (rect.width / 2) - (bubbleWidth / 2);

                    // Collision checking for viewport
                    if (left < padding) left = padding;
                    if (left + bubbleWidth > window.innerWidth - padding) {
                        left = window.innerWidth - bubbleWidth - padding;
                    }
                    if (top + bubbleHeight > window.innerHeight - padding) {
                        // Position above the element instead
                        top = rect.top - bubbleHeight - padding;
                    }

                    setBubbleStyle({
                        position: 'fixed',
                        top: `${top}px`,
                        left: `${left}px`,
                        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    });
                    return;
                }
            }
            setTargetRect(null);
            // Default centered position for steps without targets
            setBubbleStyle({
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.5s ease-out'
            });
        };

        if (isVisible) {
            updatePosition();
            window.addEventListener("resize", updatePosition);
            document.addEventListener("scroll", updatePosition, true);
            return () => {
                window.removeEventListener("resize", updatePosition);
                document.removeEventListener("scroll", updatePosition, true);
            };
        }
    }, [currentStep, pathname, isVisible]);

    useEffect(() => {
        if (progress.tourCompleted) {
            setIsVisible(false);
            return;
        }

        if (currentStep && (pathname === currentStep.page || pathname.startsWith(currentStep.page))) {
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [pathname, currentStep, progress.tourCompleted]);

    const handleNext = () => {
        if (!currentStep) return;
        if (currentStep.id < TOUR_STEPS.length - 1) {
            if (currentStep.action) currentStep.action();
            updateProgress({ currentTourStep: currentStep.id + 1 });
        } else {
            updateProgress({ tourCompleted: true });
            setIsVisible(false);
        }
    };

    const handleDismiss = () => {
        updateProgress({ tourCompleted: true });
        setIsVisible(false);
    };

    if (!isVisible || !currentStep) return null;

    return (
        <>
            {/* Spotlight Overlay */}
            <div className="fixed inset-0 z-[190] pointer-events-none overflow-hidden h-screen w-screen">
                <svg className="w-full h-full">
                    <defs>
                        <mask id="spotlight-mask">
                            <rect width="100%" height="100%" fill="white" />
                            {targetRect && (
                                <rect
                                    x={targetRect.left - 8}
                                    y={targetRect.top - 8}
                                    width={targetRect.width + 16}
                                    height={targetRect.height + 16}
                                    rx="24"
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect
                        width="100%"
                        height="100%"
                        fill="rgba(0, 0, 0, 0.6)"
                        mask="url(#spotlight-mask)"
                        className="backdrop-blur-[2px] pointer-events-auto"
                        onClick={handleDismiss} // Click overlay to exit
                    />

                    {/* Animated Spotlight Ring */}
                    {targetRect && (
                        <rect
                            x={targetRect.left - 10}
                            y={targetRect.top - 10}
                            width={targetRect.width + 20}
                            height={targetRect.height + 20}
                            rx="26"
                            fill="none"
                            stroke="#5eead4"
                            strokeWidth="3"
                            className="animate-pulse shadow-[0_0_20px_rgba(20,184,166,0.5)] transition-all duration-500"
                        />
                    )}
                </svg>
            </div>

            {/* Chat Bubble & AI Orb Container */}
            <div style={bubbleStyle} className="z-[200] flex flex-col items-center gap-4 w-[280px]">
                {/* AI Orb (Persona) */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-teal-400 rounded-full blur-xl opacity-20 animate-pulse group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-teal-500/10">
                        <div className="w-7 h-7 bg-white/20 rounded-full animate-pulse-slow flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Chat Bubble */}
                <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] p-6 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] border border-white/50 animate-in zoom-in-95 duration-500 relative w-full">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-teal-50 rounded-xl text-teal-600">
                            <Sparkles size={16} />
                        </div>
                        <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em]">{currentStep.title}</span>
                    </div>

                    <p className="text-[15px] font-bold text-gray-900 leading-relaxed mb-6">
                        {currentStep.message}
                    </p>

                    <button
                        onClick={handleNext}
                        className="w-full flex items-center justify-center gap-2 h-12 bg-teal-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20 active:scale-95"
                    >
                        {currentStep.id === TOUR_STEPS.length - 1 ? "Finish Journey" : "Next Step"}
                        <ChevronRight size={16} strokeWidth={3} />
                    </button>

                    {/* Bubble Tail/Pointer (Optional but looks nice) */}
                    {/* <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45 border-l border-t border-white/50" /> */}
                </div>
            </div>
        </>
    );
}
