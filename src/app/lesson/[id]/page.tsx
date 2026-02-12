"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { ApiService } from "@/lib/api/service";
import { Lesson } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "./components/VideoPlayer";
import { AdaptationMenu } from "./components/AdaptationMenu";

import { useProgress } from "@/contexts/ProgressContext";
import { useUser } from "@/contexts/UserContext";
import { CelebrationOverlay } from "./components/CelebrationOverlay";

export default function LessonPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { user } = useUser();
    const { progress, addMinutes, addDiamonds } = useProgress();

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [showAdaptMenu, setShowAdaptMenu] = useState(false);
    const [isAdapting, setIsAdapting] = useState(false);
    const [videoSrc, setVideoSrc] = useState("/assets/lesson1-normal.mp4");

    useEffect(() => {
        async function load() {
            // Use currentDifficulty from progress or default to 3
            const diff = (progress as any).currentDifficulty || 3;
            const profession = user?.profile?.profession;  // Get profession from user context
            const data = await ApiService.getLesson(params.id, diff, profession);
            if (data) {
                setLesson(data);
                if (data.videoUrl) {
                    setVideoSrc(data.videoUrl);
                } else if (params.id === "l01_what_llms_are") {
                    setVideoSrc("/assets/lesson1-normal.mp4");
                }
            }
            else router.replace("/dashboard");
        }
        load();
    }, [params.id, router, progress, user]);

    const handleVideoEnd = async () => {
        // Calculate minutes based on lesson estimatedDuration (e.g. 5)
        const lessonMins = lesson?.estimatedDuration || 5;

        // Update Learning Time (Impact) - This handles sync to server
        // Fire and forget - don't block navigation on sync
        addMinutes(lessonMins).catch(e => console.error("Background sync failed", e));

        // Navigate to Quiz immediately for rewards
        router.push(`/quiz/${params.id}`);
    };

    const handleContinueToQuiz = () => {
        router.push(`/quiz/${params.id}`);
    };

    const handleAdapt = async (type: string) => {
        setShowAdaptMenu(false);
        if (type === "skip") {
            router.push(`/quiz/${params.id}/checkpoint`);
            return;
        }

        setIsAdapting(true);

        let newDifficulty = 3;
        // Map adaptation type to difficulty
        // simplify -> 1
        // concise -> 5
        // examples -> 3 (but re-fetches latest video for that context)
        if (type === "simplify") newDifficulty = 1;
        else if (type === "concise" || type === "get_to_the_point") newDifficulty = 5;

        try {
            // Fetch the adapted lesson video
            // The backend router now returns the Cloudinary URL from the cache
            const profession = user?.profile?.profession;  // Get profession from user context
            const data = await ApiService.getLesson(params.id, newDifficulty, profession, type);

            // Artificial delay for "Personalizing" experience
            setTimeout(() => {
                if (data && data.videoUrl) {
                    setLesson(data);
                    setVideoSrc(data.videoUrl);
                } else {
                    console.error("No video found for adaptation");
                }
                setIsAdapting(false);
            }, 2000);

        } catch (error) {
            console.error("Failed to adapt lesson:", error);
            setIsAdapting(false);
        }
    };

    if (!lesson) return <div className="min-h-screen pt-20 text-center">Loading Lesson...</div>;

    return (
        <div className="flex flex-col h-screen bg-black text-white relative">
            {/* Custom Header (Absolute over video) */}
            {!isAdapting && (
                <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 via-black/40 to-transparent pb-12 pointer-events-none">
                    <button
                        onClick={() => router.back()}
                        className="pointer-events-auto p-2.5 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 text-white transition-all ring-1 ring-white/10 hover:ring-white/30"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="text-right pointer-events-auto">
                        <p className="text-xs font-bold text-teal-300 uppercase tracking-widest mb-0.5 drop-shadow-md">Lesson {lesson.lessonNumber}</p>
                        <p className="text-lg font-bold drop-shadow-md leading-tight">{lesson.shortTitle}</p>
                    </div>
                </div>
            )}

            {/* Video Area */}
            <div className="flex-1 relative flex items-center justify-center">
                {isAdapting ? (
                    <div className="absolute inset-0 bg-white z-40 flex flex-col items-center justify-center p-6 text-center">
                        {/* Background Decorative Blob */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#f0fdfa_0%,#fff_100%)] pointer-events-none" />

                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mx-auto mb-8 shadow-sm" />
                            {/* Inner Logo Hint */}
                            <div className="absolute inset-0 flex items-center justify-center mb-8">
                                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
                                    <div className="w-4 h-4 bg-teal-500 rounded-full animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h2 className="text-3xl font-black text-teal-900 mb-3 tracking-tight">Personalising...</h2>
                            <p className="text-teal-600/70 font-bold max-w-xs mx-auto leading-relaxed">
                                Curating the perfect learning experience specifically for you.
                            </p>
                        </div>
                    </div>
                ) : (
                    <VideoPlayer
                        src={videoSrc}
                        onEnded={handleVideoEnd}
                        className="w-full h-full"
                    />
                )}

                {/* Custom Adaptation Button - Using the provided V-Brand Icon */}
                {!isAdapting && !showAdaptMenu && (
                    <button
                        id="tour-adapt"
                        onClick={() => setShowAdaptMenu(true)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 group"
                        aria-label="Adapt Lesson"
                    >
                        {/* Pulse Effect for the "Magic" feel */}
                        <div className="absolute inset-0 bg-teal-400 rounded-full blur-xl opacity-0 group-hover:opacity-40 animate-pulse transition-opacity" />

                        <div className="relative w-16 h-16 bg-white rounded-full p-1.5 shadow-[0_0_30px_rgba(20,184,166,0.3)] border-2 border-white ring-1 ring-teal-500/10 hover:scale-110 active:scale-95 transition-all duration-300 overflow-hidden">
                            <Image
                                src="/assets/adapt-icon.png"
                                alt="Adapt"
                                fill
                                className="object-contain p-1"
                            />
                        </div>

                        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 pointer-events-none whitespace-nowrap border border-white/10">
                            Adapt Lesson
                        </span>
                    </button>
                )}
            </div>

            {/* Adaptation Overlay */}
            <AdaptationMenu
                isOpen={showAdaptMenu}
                onClose={() => setShowAdaptMenu(false)}
                onSelect={handleAdapt}
            />
        </div>
    );
}
