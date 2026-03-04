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

  // While loading session, or if we have a user (meaning we are about to redirect),
  // show a clean loading state to prevent flashing the Get Started page.
  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin opacity-50"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between h-screen py-16 px-6 text-center bg-[url('/assets/grid-pattern.svg')] bg-cover relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-teal-400/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 flex flex-col items-center w-full max-w-md mx-auto h-full justify-between">
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="mb-12 animate-float">
            <div className="relative w-36 h-36 mx-auto filter drop-shadow-glow rounded-full overflow-hidden bg-white border border-white/20">
              <Image
                src="/assets/Vina Logo.png"
                alt="Vina Logo"
                fill
                className="object-contain mix-blend-multiply"
                priority
              />
            </div>
          </div>

          <div className="space-y-6 mb-12 animate-slide-up">
            <h1 className="text-6xl font-black tracking-tighter text-gray-900 leading-none">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">
                Vina
              </span>
            </h1>
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-black uppercase tracking-[0.3em] text-teal-600/80">
                Learning that Listens
              </h2>
              <p className="text-gray-500 text-lg max-w-[260px] mx-auto leading-tight font-medium opacity-90">
                The Video tutor that adapts to your professional pace.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full animate-slide-up mt-auto" style={{ animationDelay: '0.2s' }}>
          <Button
            variant="default" // Uses the new gradient default
            className="w-full text-lg h-16 shadow-2xl shadow-teal-500/20 rounded-2xl"
            onClick={() => router.push("/login")}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
