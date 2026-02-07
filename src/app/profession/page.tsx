"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiService } from "@/lib/api/service";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";

const PROFESSIONS = [
    "Clinical Researcher",
    "HR Manager",
    "Project Manager",
    "Marketing Manager"
];

export default function ProfessionSelectScreen() {
    const router = useRouter();
    const { login } = useUser();
    const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleContinue = async () => {
        if (!selectedProfession) return;

        setIsSubmitting(true);
        try {
            // Create user via API (Mock)
            const newUser = await ApiService.createUserProfile(selectedProfession);
            login(newUser);

            // Navigate to pre-assessment
            router.push("/assessment");
        } catch (error) {
            console.error("Failed to create profile", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            {/* Header */}
            <header className="relative z-10 px-6 py-6 flex items-center">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
            </header>

            <div className="flex-1 px-6 pb-8 flex flex-col relative z-10 max-w-md mx-auto w-full">
                <div className="mb-8 animate-slide-up">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        What's your role?
                    </h1>
                    <p className="text-lg text-gray-500 leading-relaxed">
                        We'll adapt the course content to match your daily work.
                    </p>
                </div>

                <div className="space-y-3 flex-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    {PROFESSIONS.map((prof) => (
                        <button
                            key={prof}
                            onClick={() => setSelectedProfession(prof)}
                            className={cn(
                                "w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between group relative overflow-hidden",
                                selectedProfession === prof
                                    ? "border-teal-500 bg-white shadow-lg shadow-teal-100 ring-1 ring-teal-500"
                                    : "border-transparent bg-white/60 hover:bg-white hover:shadow-md hover:-translate-y-0.5"
                            )}
                        >
                            <span className={cn(
                                "font-medium text-lg relative z-10 transition-colors",
                                selectedProfession === prof ? "text-teal-900" : "text-gray-600 group-hover:text-gray-900"
                            )}>
                                {prof}
                            </span>

                            {selectedProfession === prof ? (
                                <div className="bg-teal-500 rounded-full p-1 animate-scale-in text-white shadow-glow">
                                    <Check size={16} strokeWidth={3} />
                                </div>
                            ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-teal-300 transition-colors" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-8 pt-6">
                    <Button
                        variant="default"
                        className="w-full h-14 text-lg shadow-xl shadow-teal-500/20"
                        isLoading={isSubmitting}
                        disabled={!selectedProfession}
                        onClick={handleContinue}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
}
