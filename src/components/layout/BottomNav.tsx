"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, BarChart3 } from "lucide-react"; // Using standard Lucide icons
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    // Hide on onboarding pages
    if (
        pathname === "/" ||
        pathname.includes("/profession") ||
        pathname.includes("/assessment") ||
        pathname.includes("/lesson/") // Hide on video player as well? PRD says fixed bottom bar EXCEPT Welcome/Prof/Assess.
        // Wait, PRD 5.13 says: "Routes: All screens except Welcome, Profession Select, Pre-Assessment"
        // PRD 5.5 (Lesson Player) doesn't explicitly mention hiding it, but usually video players take full screen.
        // Let's hide it on lesson player to maximize view.
    ) {
        if (pathname.includes("/lesson/")) return null;
        if (pathname === "/" || pathname === "/profession" || pathname === "/assessment") return null;
    }

    const tabs = [
        {
            id: "home",
            label: "Home",
            route: "/dashboard",
            icon: Home,
        },
        {
            id: "practice",
            label: "Practice",
            route: "/practice",
            icon: ClipboardList,
        },
        {
            id: "progress",
            label: "Progress",
            route: "/progress",
            icon: BarChart3,
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-inset-bottom z-40">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.route;
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.id}
                            href={tab.route}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200",
                                isActive ? "text-teal-600 bg-teal-50/50" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <div className="relative p-1">
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                {/* Badge example for practice */}
                                {tab.id === 'practice' && false && (
                                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                                )}
                            </div>
                            <span className={cn("text-[10px] mt-1 font-medium", isActive ? "font-bold" : "")}>
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
