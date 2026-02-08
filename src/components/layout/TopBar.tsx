"use client";

import { useProgress } from "@/contexts/ProgressContext";
import { useUser } from "@/contexts/UserContext";
import { usePathname } from "next/navigation";

import Image from "next/image";

export function TopBar() {
    const { progress } = useProgress();
    const { user } = useUser();
    const pathname = usePathname();

    // Only show on specific pages (Hidden on dashboard to prevent stat duplication)
    const showTopBar = ["/practice", "/progress"].includes(pathname);
    const isProgressPage = pathname === "/progress";

    if (!showTopBar) return null;

    const initials = user?.profession ? user.profession.split(' ').map(w => w[0]).join('').substring(0, 2) : "User";

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 mb-0">
            <div className="flex items-center justify-between px-4 h-14 max-w-md mx-auto">
                <div className="flex items-center gap-4">
                    {isProgressPage ? (
                        /* Vina Logo - Left Side (Progress Page Specific) */
                        <div className="flex items-center gap-2">
                            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-teal-50">
                                <Image
                                    src="/assets/Vina Logo.png"
                                    alt="Vina"
                                    fill
                                    className="object-contain mix-blend-multiply"
                                />
                            </div>
                            <span className="font-black text-lg text-teal-900 tracking-tight">Vina</span>
                        </div>
                    ) : (
                        /* Default Stats (Practice Page etc) */
                        <>
                            {/* Streak */}
                            <div className="flex items-center gap-1.5" aria-label={`${progress.streak} day streak`}>
                                <span className="text-xl">🔥</span>
                                <span className="text-sm font-bold text-gray-700">{progress.streak}</span>
                            </div>

                            {/* Points */}
                            <div className="flex items-center gap-1.5" aria-label={`${progress.totalPoints} points`}>
                                <span className="text-xl">💎</span>
                                <span className="text-sm font-bold text-gray-700">{progress.totalPoints}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* User Avatar (Initials) - Top Right */}
                <div
                    className="w-8 h-8 rounded-full bg-teal-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-teal-100 shadow-sm"
                    aria-label="User profile"
                >
                    {initials}
                </div>
            </div>
        </header>
    );
}
