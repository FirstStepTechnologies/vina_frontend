import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";
import { UserProvider } from "@/contexts/UserContext";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { VinaAssistant } from "@/components/ui/VinaAssistant";

const inter = Inter({ subsets: ["latin"] });

// ... (skipping some metadata)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "antialiased text-gray-900 bg-gray-50 selection:bg-teal-100 selection:text-teal-900")}>
        <UserProvider>
          <ProgressProvider>
            <MobileContainer>
              <div className="relative flex flex-col min-h-screen">
                <TopBar />
                <main className="flex-1 overflow-y-auto pb-24 hide-scrollbar relative z-10">
                  {children}
                </main>
                <BottomNav />
                <VinaAssistant />
              </div>
            </MobileContainer>
          </ProgressProvider>
        </UserProvider>
      </body>
    </html>
  );
}
