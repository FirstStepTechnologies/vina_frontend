"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookOpen, Zap, HelpCircle, Lightbulb } from "lucide-react";

const INTRO_STEPS = [
    {
        id: "role",
        title: "Built for your role",
        description: "Pick your profession and get a personalised 2026 Skills Portfolio in minutes.",
        image: "/assets/intro-built-for-role.png",
        color: "bg-teal-500",
    },
    {
        id: "listen",
        title: "Learning that Listens",
        description: "Tell us \"too fast\", \"too slow\", or \"more examples\", and your video lesson adapts in real time.",
        image: null,
        color: "bg-teal-500",
    },
    {
        id: "social",
        title: "Learn, and help someone else learn too",
        description: "With our 1-for-1 model, every minute you learn on Vina funds a minute of education for a child in need.",
        image: "/assets/intro-social-v2.jpg",
        color: "bg-teal-500",
    },
];

const UNLOCK_SCREEN = {
    title: "Unlock Your Personalised Journey",
    description: "Tell us about yourself to unlock a structured path designed to help you achieve your learning goals.",
    image: "/assets/intro-unlock-journey-v3.jpg"
};

const AdaptationMenu = () => (
    <div className="w-[85%] bg-white/90 backdrop-blur-md rounded-[2.5rem] p-5 shadow-[0_0_40px_rgba(13,148,136,0.15)] border-[6px] border-white ring-1 ring-teal-100/50 scale-90 sm:scale-100">
        <h3 className="text-gray-900 font-black text-lg mb-4 ml-2">How can we adapt?</h3>
        <div className="space-y-3">
            {[
                { icon: BookOpen, title: "Simplify this", sub: "Make it easier to understand", color: "bg-green-100 text-green-600" },
                { icon: Zap, title: "Get to the point", sub: "Skip the fluff", color: "bg-orange-100 text-orange-600" },
                { icon: HelpCircle, title: "I know this already", sub: "Quiz me to skip ahead", color: "bg-blue-100 text-blue-600" },
                { icon: Lightbulb, title: "More examples", sub: "Show me real-world cases", color: "bg-purple-100 text-purple-600" },
            ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/60 p-3 rounded-2xl border border-white/40 shadow-sm">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", item.color)}>
                        <item.icon size={20} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                        <p className="font-black text-gray-900 leading-tight">{item.title}</p>
                        <p className="text-[11px] font-bold text-gray-500 leading-tight">{item.sub}</p>
                    </div>
                </div>
            ))}
        </div>
        <p className="text-center mt-5 text-gray-400 font-bold text-sm tracking-wide">Cancel</p>
    </div>
);

export default function IntroScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [showWelcome, setShowWelcome] = useState(false);
    const [isUnlockScreen, setIsUnlockScreen] = useState(false);

    const handleNext = () => {
        if (isUnlockScreen) {
            router.push("/profession");
            return;
        }

        if (currentStep < INTRO_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Trigger Welcome Animation before moving to Unlock screen
            setShowWelcome(true);
            setTimeout(() => {
                setShowWelcome(false);
                setIsUnlockScreen(true);
            }, 2000);
        }
    };

    const handleSkip = () => {
        // Navigate directly to the Unlock screen
        setIsUnlockScreen(true);
    };

    const step = isUnlockScreen ? UNLOCK_SCREEN : INTRO_STEPS[currentStep];

    return (
        <div className="flex flex-col h-screen bg-white relative overflow-hidden">
            {/* Welcome Animation Overlay */}
            {showWelcome && (
                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white animate-fade-in">
                    {/* CSS Confetti */}
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(30)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute animate-confetti-fall"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `-5%`,
                                    backgroundColor: ['#0d9488', '#2dd4bf', '#fbbf24', '#3b82f6'][Math.floor(Math.random() * 4)],
                                    width: `${Math.random() * 10 + 5}px`,
                                    height: `${Math.random() * 15 + 10}px`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${Math.random() * 1 + 1.5}s`,
                                    opacity: 0.8,
                                    transform: `rotate(${Math.random() * 360}deg)`
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 text-center space-y-4 animate-pop-in">
                        <div className="text-7xl mb-6">🎉</div>
                        <h1 className="text-5xl font-black text-teal-900 tracking-tighter">
                            Welcome to <span className="text-teal-600">Vina</span>
                        </h1>
                        <p className="text-gray-500 text-xl font-bold animate-pulse">
                            Let's build your future.
                        </p>
                    </div>

                    <style jsx global>{`
                        @keyframes confetti-fall {
                            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                        }
                        @keyframes pop-in {
                            0% { transform: scale(0.8); opacity: 0; }
                            70% { transform: scale(1.1); opacity: 1; }
                            100% { transform: scale(1); opacity: 1; }
                        }
                        .animate-confetti-fall {
                            animation: confetti-fall linear forwards;
                        }
                        .animate-pop-in {
                            animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                        }
                    `}</style>
                </div>
            )}

            {/* Top Bar - Logo & Skip */}
            <div className="flex justify-between items-center px-6 pt-10 pb-2 relative z-50">
                <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white border border-teal-50">
                        <Image
                            src="/assets/Vina Logo.png"
                            alt="Vina"
                            fill
                            className="object-contain mix-blend-multiply"
                        />
                    </div>
                    <span className="font-black text-xl text-teal-900 tracking-tight">Vina</span>
                </div>
                {!isUnlockScreen && (
                    <button
                        onClick={handleSkip}
                        className="px-8 py-2.5 rounded-full bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20 active:scale-95"
                    >
                        Skip
                    </button>
                )}
            </div>

            {/* Content Area - Balanced for No-Scroll */}
            <div className="flex-1 flex flex-col items-center px-8 justify-between pb-10">

                {/* Image Section - Adaptive height without global scaling */}
                <div className="w-full flex-1 min-h-[35vh] max-h-[42vh] relative flex items-center justify-center mt-2 group">
                    <div className="absolute inset-0 bg-gradient-to-b from-teal-50 to-transparent rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-1000" />

                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                        {/* Orbital Decorations - Adaptive Sizing */}
                        <div className="absolute w-[80%] aspect-square border border-dashed border-teal-100/50 rounded-full animate-[spin_60s_linear_infinite]" />
                        <div className="absolute w-[95%] aspect-square border border-dotted border-teal-200/20 rounded-full animate-[spin_40s_linear_infinite_reverse]" />

                        {/* The Image/Orb/Mockup - Scaled per Step */}
                        {!isUnlockScreen && currentStep === 1 ? (
                            <div className="relative z-10 w-full flex justify-center animate-slide-up scale-[0.78] sm:scale-[0.85] -mt-4">
                                <AdaptationMenu />
                            </div>
                        ) : (
                            <div className={cn(
                                "relative bg-white rounded-full shadow-2xl flex items-center justify-center overflow-hidden border-[6px] border-white ring-1 ring-teal-50 transition-all duration-700",
                                isUnlockScreen || currentStep === 0 || currentStep === 2 ? "w-[90%] max-w-[300px] aspect-square" : "w-[75%] max-w-[240px] aspect-square"
                            )}>
                                <Image
                                    src={
                                        isUnlockScreen ? UNLOCK_SCREEN.image :
                                            currentStep === 0 ? "/assets/intro-built-for-role.png" : "/assets/intro-social-v2.jpg"
                                    }
                                    alt={step.title}
                                    fill
                                    className="object-cover transition-transform duration-1000"
                                    priority
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Text and Controls Section */}
                <div className="w-full flex flex-col items-center">
                    {/* Text Copy */}
                    <div className="text-center max-w-xs space-y-3 mb-6 animate-fade-in" key={isUnlockScreen ? "unlock" : currentStep}>
                        <h2 className="text-3xl font-black text-teal-800 leading-[1.1] tracking-tight">
                            {step.title}
                        </h2>
                        <p className="text-gray-500 text-lg font-medium leading-[1.3] opacity-80 px-2">
                            {step.description}
                        </p>
                    </div>

                    {/* Navigation Dots - Hidden on Unlock screen */}
                    {!isUnlockScreen && (
                        <div className="flex gap-2.5 mb-8">
                            {INTRO_STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-2 rounded-full transition-all duration-500",
                                        currentStep === i ? "w-10 bg-teal-600 shadow-sm" : "w-2.5 bg-teal-100"
                                    )}
                                />
                            ))}
                        </div>
                    )}

                    {/* Primary Button */}
                    <div className="w-full max-w-sm">
                        <Button
                            variant="default"
                            className="w-full h-16 text-xl font-bold shadow-2xl shadow-teal-500/20 rounded-2xl"
                            onClick={handleNext}
                        >
                            {isUnlockScreen ? "Continue" : currentStep === INTRO_STEPS.length - 1 ? "Let's Start" : "Next"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
