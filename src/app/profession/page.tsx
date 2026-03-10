"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiService } from "@/lib/api/service";
import { useUser } from "@/contexts/UserContext";
import { useProgress } from "@/contexts/ProgressContext";
import { cn } from "@/lib/utils";

const STEPS = [
    {
        id: "role",
        section: "Role",
        title: "What's your role?",
        description: "We'll adapt the course content to match your daily work.",
        options: [
            { label: "HR Manager", value: "HR Manager", sub: "" },
            { label: "Investment Analyst", value: "Investment Analyst", sub: "" },
            { label: "Marketing Manager", value: "Marketing Manager", sub: "" },
            { label: "Product Manager", value: "Product Manager", sub: "" },
            { label: "Project Manager", value: "Project Manager", sub: "" },
            { label: "Clinical Researcher", value: "Clinical Researcher", sub: "" },
        ]
    },
    {
        id: "goal",
        section: "Goal",
        title: "What are you aiming for?",
        description: "We'll prioritise modules that help you reach this goal faster.",
        options: [
            { label: "Advance in my current role", value: "advance", sub: "" },
            { label: "Move into a new role", value: "new-role", sub: "" },
            { label: "Switch profession entirely", value: "switch", sub: "" },
            { label: "Prepare for job search", value: "job-search", sub: "" },
            { label: "Learn for confidence & capability", value: "confidence", sub: "" },
            { label: "Something specific...", value: "specific", sub: "" }
        ]
    }
];

const SECTION_THEMES: Record<string, { color: string, bg: string, ring: string, blob: string, light: string }> = {
    Role: {
        color: "text-teal-600",
        bg: "bg-teal-600",
        ring: "ring-teal-500/20",
        blob: "bg-teal-100/40",
        light: "bg-teal-50"
    },
    Goal: {
        color: "text-indigo-600",
        bg: "bg-indigo-600",
        ring: "ring-indigo-500/20",
        blob: "bg-indigo-100/40",
        light: "bg-indigo-50"
    }
};

export default function PersonalisationFlow() {
    const router = useRouter();
    // Multi-step State with Default Values
    const [step, setStep] = useState(0);
    const { user, updateUser } = useUser();
    const [selections, setSelections] = useState<Record<string, string>>(() => {
        // Pre-fill from existing user profile if available
        if (user?.onboardingResponses) {
            return { ...user.onboardingResponses };
        }
        return {
            pace: "steady",
            reminders: "yes" // Preselected by default
        };
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResetWarning, setShowResetWarning] = useState(false);
    const { resetProgress } = useProgress();

    const currentStepData = STEPS[step];
    const currentTheme = SECTION_THEMES[currentStepData.section];
    const isLastStep = step === STEPS.length - 1;
    const progress = ((step + 1) / STEPS.length) * 100;

    const handleSelect = (value: string) => {
        setSelections(prev => ({ ...prev, [currentStepData.id]: value }));
    };

    const submitProfile = async (shouldReset = false) => {
        setIsSubmitting(true);
        try {
            // Mapping for backend schema
            const goalMins = 10; // Defaulting for simple 2-screen onboarding

            const industryMap: Record<string, string> = {
                "Clinical Researcher": "Pharma/Biotech",
                "HR Manager": "Tech Company",
                "Marketing Manager": "E-Commerce",
                "Project Manager": "Software/Tech",
                "Product Manager": "FinTech",
                "Investment Analyst": "Venture Capital"
            };

            const industry = industryMap[selections.role] || "Technology";

            if (shouldReset) {
                resetProgress();
            }

            const resolution = selections.goal === 'specific'
                ? selections.specific_goal
                : STEPS.find(s => s.id === 'goal')?.options.find(o => o.value === selections.goal)?.label || selections.goal;

            // Update Profile on server
            const profileUpdates = {
                profession: selections.role,
                industry: industry,
                experience_level: "Beginner",
                daily_goal_minutes: goalMins,
                resolution: resolution,
                onboarding_responses: {
                    ...selections,
                    industry: industry,
                    experience: "Beginner",
                    pace: selections.pace || "steady",
                    reminders: selections.reminders || "yes",
                    timeline: selections.timeline || "3m"
                }
            };

            await updateUser(profileUpdates);

            // Navigate to pathway screen
            router.replace("/pathway");
        } catch (error) {
            console.error("Failed to create profile", error);
            setIsSubmitting(false);
        }
    };

    const handleContinue = async () => {
        if (!selections[currentStepData.id]) return;

        if (!isLastStep) {
            setStep(step + 1);
        } else {
            // Check for role change if user already had a profile
            const originalRole = user?.onboardingResponses?.role;
            const newRole = selections.role;

            if (originalRole && originalRole !== newRole) {
                setShowResetWarning(true);
            } else {
                submitProfile();
            }
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        } else {
            router.back();
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white relative overflow-hidden transition-colors duration-700">
            {/* Role-Change Warning Modal */}
            {showResetWarning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-sm bg-white rounded-3xl p-8 border-none shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-inner">
                                <AlertTriangle size={32} strokeWidth={2.5} />
                            </div>

                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Change Job Role?</h2>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8">
                                Changing your professional role is a major shift. To re-tailor Vina to your new role, your <span className="text-red-600 font-bold">current learning pathway will be reset</span>.
                            </p>

                            <div className="w-full space-y-3">
                                <Button
                                    variant="default"
                                    className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-500/20"
                                    onClick={() => submitProfile(true)}
                                    isLoading={isSubmitting}
                                >
                                    Reset & Continue
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full h-12 border-gray-100 text-gray-400 font-bold uppercase tracking-widest rounded-xl hover:bg-gray-50"
                                    onClick={() => setShowResetWarning(false)}
                                    disabled={isSubmitting}
                                >
                                    Go Back
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Premium Background Blobs - Theme Responsive */}
            <div className={cn(
                "absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 transition-colors duration-1000",
                currentTheme.blob
            )} />
            <div className={cn(
                "absolute bottom-0 left-0 w-96 h-96 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 transition-colors duration-1000 opacity-40",
                currentTheme.blob
            )} />

            {/* Header & Progress Bar */}
            <header className="relative z-20 px-6 pt-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={handleBack}
                        className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors bg-white rounded-full shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    {/* Section Badge */}
                    <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2 duration-500",
                        currentTheme.light,
                        currentTheme.color
                    )}>
                        {currentStepData.section}
                    </div>

                    <span className="text-xs font-bold text-gray-400">
                        {step + 1}/{STEPS.length}
                    </span>
                </div>

                {/* Progress Tracks - Slimmer */}
                <div className="flex gap-1 h-1 w-full">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex-1 rounded-full transition-all duration-700",
                                i < step ? currentTheme.bg : i === step ? cn(currentTheme.bg, "shadow-sm opacity-100 scale-y-125") : "bg-gray-100 opacity-50"
                            )}
                        />
                    ))}
                </div>
            </header>

            <div className="flex-1 px-6 py-4 flex flex-col justify-center relative z-20 max-w-md mx-auto w-full">
                {/* Question Header - More Compact */}
                <div className="mb-4 animate-slide-up" key={`header-${step}`}>
                    <h1 className="text-2xl font-black text-gray-900 mb-1 leading-tight tracking-tight">
                        {currentStepData.title}
                    </h1>
                    <p className="text-sm text-gray-500 font-medium leading-tight opacity-90">
                        {currentStepData.description}
                    </p>
                </div>

                {/* Options List - No flex-1 to keep it tight */}
                <div className="space-y-2 animate-slide-up pb-2" key={`options-${step}`} style={{ animationDelay: '0.05s' }}>
                    {currentStepData.options.map((option) => {
                        const isSelected = selections[currentStepData.id] === option.value;
                        const isSpecific = option.value === "specific";

                        return (
                            <div key={option.value} className="space-y-2">
                                <button
                                    onClick={() => handleSelect(option.value)}
                                    className={cn(
                                        "w-full text-left p-3.5 rounded-[1.25rem] border-2 transition-all duration-300 flex items-center justify-between group relative overflow-hidden bg-white/50 backdrop-blur-sm",
                                        isSelected
                                            ? cn("bg-white shadow-lg ring-1", currentTheme.color.replace('text-', 'border-'), currentTheme.ring)
                                            : "border-transparent hover:bg-white hover:shadow-md hover:-translate-y-0.5"
                                    )}
                                >
                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "font-bold text-base relative z-10 transition-colors uppercase tracking-tight",
                                            isSelected ? currentTheme.color : "text-gray-700 group-hover:text-gray-900"
                                        )}>
                                            {option.label}
                                        </span>
                                        {option.sub && (
                                            <span className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
                                                {option.sub}
                                            </span>
                                        )}
                                    </div>

                                    {isSelected ? (
                                        <div className={cn("rounded-full p-1 animate-scale-in text-white shadow-lg", currentTheme.bg)}>
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-gray-300 transition-colors bg-white/50" />
                                    )}
                                </button>

                                {/* Animated Text Area for "Something Specific" */}
                                {isSpecific && isSelected && (
                                    <div className="animate-in fade-in slide-in-from-top-1 duration-300 px-1">
                                        <textarea
                                            autoFocus
                                            placeholder="Tell us a bit more about your goal..."
                                            className={cn(
                                                "w-full bg-white border-2 rounded-xl p-3 text-sm text-gray-700 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-4 transition-all min-h-[80px] shadow-sm italic",
                                                currentTheme.color.replace('text-', 'border-'),
                                                currentTheme.ring.replace('/20', '/10')
                                            )}
                                            value={selections.specific_goal || ""}
                                            onChange={(e) => setSelections(prev => ({ ...prev, specific_goal: e.target.value }))}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer Action - Snapped to options */}
                <div className="mt-4">
                    <p className="text-center text-[10px] font-bold text-gray-400 mb-2 animate-fade-in flex items-center justify-center gap-1.5 opacity-80">
                        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", currentTheme.bg)} />
                        No pressure, you can change this anytime.
                    </p>
                    <Button
                        variant="default"
                        className={cn(
                            "w-full h-12 text-base font-black uppercase tracking-widest shadow-xl rounded-xl transition-all duration-500",
                            currentTheme.bg,
                            "shadow-" + currentTheme.bg.split('-')[1] + "-500/20"
                        )}
                        isLoading={isSubmitting}
                        disabled={!selections[currentStepData.id] || (selections.goal === 'specific' && !selections.specific_goal)}
                        onClick={handleContinue}
                    >
                        {isLastStep ? "Personalise My Vina" : "Continue"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
