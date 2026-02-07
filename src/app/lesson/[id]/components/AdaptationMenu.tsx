"use client";

import { Zap, BookOpen, CheckCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdaptationMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: string) => void;
}

const OPTIONS = [
    {
        id: "simplify",
        title: "Simplify this",
        subtitle: "Make it easier to understand",
        icon: BookOpen,
        color: "text-green-600",
        bg: "bg-green-100",
        border: "hover:border-green-300"
    },
    {
        id: "concise",
        title: "Get to the point",
        subtitle: "Skip the fluff",
        icon: Zap,
        color: "text-orange-600",
        bg: "bg-orange-100",
        border: "hover:border-orange-300"
    },
    {
        id: "skip",
        title: "I know this already",
        subtitle: "Quiz me to skip ahead",
        icon: CheckCircle,
        color: "text-blue-600",
        bg: "bg-blue-100",
        border: "hover:border-blue-300"
    },
    {
        id: "examples",
        title: "More examples",
        subtitle: "Show me real-world cases",
        icon: Lightbulb,
        color: "text-purple-600",
        bg: "bg-purple-100",
        border: "hover:border-purple-300"
    }
];

export function AdaptationMenu({ isOpen, onClose, onSelect }: AdaptationMenuProps) {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative w-full max-w-sm glass-panel bg-white/90 rounded-3xl p-6 shadow-2xl animate-slide-up border-t border-white/50">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">How can we adapt?</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5 transition-colors">
                        {/* Close Icon if needed, or just use Cancel button below */}
                    </button>
                </div>

                <div className="space-y-3">
                    {OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => onSelect(opt.id)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left bg-white/50 hover:bg-white shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] group",
                                opt.border
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:rotate-12",
                                opt.bg,
                                opt.color
                            )}>
                                <opt.icon size={22} className="drop-shadow-sm" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 group-hover:text-gray-900 transition-colors">{opt.title}</p>
                                <p className="text-sm text-gray-500 group-hover:text-gray-600 font-medium">{opt.subtitle}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full py-4 rounded-xl text-gray-500 font-bold hover:text-gray-800 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
