"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  // Auto-redirect if user already exists
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[url('/assets/grid-pattern.svg')] bg-cover relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-teal-400/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 flex flex-col items-center w-full max-w-md mx-auto">
        <div className="mb-10 animate-float">
          <div className="relative w-40 h-40 mx-auto filter drop-shadow-glow">
            <Image
              src="/assets/Vina Logo.png"
              alt="Vina Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="space-y-4 mb-12 animate-slide-up">
          <h1 className="text-6xl font-black tracking-tighter text-gray-900">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">
              Vina
            </span>
          </h1>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-black uppercase tracking-[0.3em] text-teal-600/80">
              Learning that Listens
            </h2>
            <p className="text-gray-500 text-lg max-w-[280px] mx-auto leading-tight font-medium">
              The AI tutor that adapts to your professional pace.
            </p>
          </div>
        </div>

        <div className="w-full animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Button
            variant="default" // Uses the new gradient default
            className="w-full text-lg h-14 shadow-xl shadow-teal-500/20"
            onClick={() => router.push("/profession")}
          >
            Get Started
          </Button>

          <p className="mt-6 text-xs text-gray-400 font-medium tracking-wide uppercase">
            Personalized for Professionals
          </p>
        </div>
      </div>
    </div>
  );
}
