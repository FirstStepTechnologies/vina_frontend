export function MobileContainer({ children }: { children: React.ReactNode }) {
    // Constrains content to mobile width on desktop
    return (
        <div className="min-h-screen bg-gray-50 flex justify-center">
            <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
                {children}
            </div>
        </div>
    );
}
