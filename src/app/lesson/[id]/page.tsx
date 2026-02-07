"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Zap } from "lucide-react";
import { ApiService } from "@/lib/api/service";
import { Lesson } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "./components/VideoPlayer";
import { AdaptationMenu } from "./components/AdaptationMenu";

export default function LessonPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [showAdaptMenu, setShowAdaptMenu] = useState(false);
    const [isAdapting, setIsAdapting] = useState(false);
    const [videoSrc, setVideoSrc] = useState("/assets/lesson1-normal.mp4");

    useEffect(() => {
        async function load() {
            const data = await ApiService.getLesson(params.id);
            if (data) {
                setLesson(data);
                // For lesson 1, we use the specific assets provided
                if (params.id === "l01_what_llms_are") {
                    setVideoSrc("/assets/lesson1-normal.mp4");
                }
            }
            else router.replace("/dashboard");
        }
        load();
    }, [params.id, router]);

    const handleVideoEnd = () => {
        // Navigate to Lesson Quiz on completion
        router.push(`/quiz/${params.id}`);
    };

    const handleAdapt = async (type: string) => {
        setShowAdaptMenu(false);

        if (type === "skip") {
            // "I know this already" -> Checkpoint Quiz
            router.push(`/quiz/${params.id}/checkpoint`);
            return;
        }

        // Simulate Adaptation Loading
        setIsAdapting(true);
        setTimeout(() => {
            setIsAdapting(false);

            // Map adaptation types to the provided video files
            if (params.id === "l01_what_llms_are") {
                if (type === "simplify") {
                    setVideoSrc("/assets/lesson1-toohard.mp4");
                } else if (type === "concise") {
                    setVideoSrc("/assets/lesson1-tooeasy.mp4");
                }
            }

            console.log(`Adapted lesson with strategy: ${type}`);
        }, 2000);
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
                    <div className="text-center p-6 animate-pulse">
                        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Personalizing...</h2>
                        <p className="text-gray-400 text-sm">Generating a version that matches your style.</p>
                    </div>
                ) : (
                    <VideoPlayer
                        src={videoSrc}
                        onEnded={handleVideoEnd}
                        className="w-full h-full"
                    />
                )}

                {/* Adapt Button (Always visible logic handled by position) */}
                {!isAdapting && !showAdaptMenu && (
                    <button
                        onClick={() => setShowAdaptMenu(true)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-teal-600 text-white p-3 rounded-full shadow-lg hover:bg-teal-700 hover:scale-110 transition-all group"
                        aria-label="Adapt Lesson"
                    >
                        <Zap size={24} fill="white" className="group-hover:animate-pulse" />
                        <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Adapt
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
