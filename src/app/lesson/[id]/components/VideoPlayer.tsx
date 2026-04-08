"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
    src: string;
    onEnded: (durationSeconds: number) => void;
    className?: string;
    poster?: string;
    autoPlay?: boolean;
}

export function VideoPlayer({ src, onEnded, className, poster, autoPlay = false }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [speed, setSpeed] = useState(1);
    const controlsTimeoutRef = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            if (video.duration) {
                setCurrentTime(video.currentTime);
                setDuration(video.duration);
                setProgress((video.currentTime / video.duration) * 100);
            }
        };

        const handleVideoEnded = () => {
            setIsPlaying(false);
            onEnded(video.duration || 0);
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        const handleLoadedMetadata = () => {
            setDuration(video.duration || 0);
            setCurrentTime(video.currentTime || 0);
        };

        video.addEventListener("timeupdate", updateProgress);
        video.addEventListener("ended", handleVideoEnded);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("loadedmetadata", handleLoadedMetadata);

        return () => {
            video.removeEventListener("timeupdate", updateProgress);
            video.removeEventListener("ended", handleVideoEnded);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
    }, [onEnded]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
        resetControlsTimeout();
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
        resetControlsTimeout();
    };

    const handleReplay = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setIsPlaying(true);
    };

    const toggleSpeed = () => {
        if (!videoRef.current) return;
        const speeds = [1, 1.25, 1.5, 2];
        const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
        const nextSpeed = speeds[nextIdx];

        setSpeed(nextSpeed);
        videoRef.current.playbackRate = nextSpeed;
        resetControlsTimeout(); // Ensure controls stay visible while interacting
    };

    const resetControlsTimeout = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;
        const time = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
        videoRef.current.currentTime = time;
        setProgress(parseFloat(e.target.value));
        resetControlsTimeout();
    };

    return (
        <div
            className={cn("relative bg-black group overflow-hidden", className)}
            onMouseMove={resetControlsTimeout}
            onClick={resetControlsTimeout}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-cover"
                onClick={togglePlay}
                playsInline
                autoPlay={autoPlay}
            />

            {/* Overlay Controls */}
            <div
                className={cn(
                    "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
                    showControls ? "opacity-100" : "opacity-0"
                )}
            >
                {/* Progress Bar */}
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-teal-500 mb-4"
                />

                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="hover:text-teal-400">
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                        </button>

                        <button onClick={toggleMute} className="hover:text-teal-400">
                            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                        </button>

                        <span className="text-sm font-medium">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleSpeed(); }}
                            className="text-xs font-bold border border-white/30 rounded px-2 py-1 hover:bg-white/20 min-w-[36px] transition-colors"
                        >
                            {speed}x
                        </button>

                        <button onClick={handleReplay} className="hover:text-teal-400">
                            <RotateCcw size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Big Play Button Overlay */}
            {!isPlaying && (
                <button
                    onClick={togglePlay}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-110"
                >
                    <Play size={32} fill="white" className="text-white ml-1" />
                </button>
            )}
        </div>
    );
}

function formatTime(seconds: number): string {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
