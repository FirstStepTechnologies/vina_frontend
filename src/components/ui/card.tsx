import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "glass-panel rounded-3xl p-6 transition-all duration-300",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
