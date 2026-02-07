import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            default: 'bg-vina-gradient text-white hover:brightness-110 shadow-lg shadow-teal-500/20 active:scale-95 border-0',
            destructive: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 shadow-sm',
            outline: 'border-2 border-teal-200 bg-transparent hover:bg-teal-50 text-teal-700',
            secondary: 'bg-white text-teal-700 border border-gray-100 hover:bg-gray-50 shadow-sm hover:shadow-md active:scale-95',
            ghost: 'bg-transparent text-teal-600 hover:text-teal-800 hover:bg-teal-50/50',
            link: 'text-teal-600 underline-offset-4 hover:underline',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "relative inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
