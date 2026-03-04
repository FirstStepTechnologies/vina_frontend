"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { ApiService } from "@/lib/api/service";
import {
    signInWithGoogle,
    registerWithEmail,
    loginWithEmail,
} from "@/lib/firebase/auth";

type Mode = "signin" | "signup";

export default function LoginPage() {
    const router = useRouter();
    const { login, user, isLoading: isUserLoading } = useUser();

    // Prevent flashing the login screen if already authenticated
    useEffect(() => {
        if (!isUserLoading && user) {
            router.replace("/dashboard");
        }
    }, [user, isUserLoading, router]);

    const [mode, setMode] = useState<Mode>("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState<string | null>(null); // which button is loading
    const [error, setError] = useState<string | null>(null);

    // If session is loading or if we are skipping login, show spinner
    if (isUserLoading || user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin opacity-50"></div>
            </div>
        );
    }

    const handleError = (err: unknown) => {
        const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
        console.error('[Login] Auth error:', msg);
        // Firebase client-side error codes
        if (msg.includes("auth/email-already-in-use")) setError("That email is already registered. Try signing in instead.");
        else if (msg.includes("auth/user-not-found") || msg.includes("auth/wrong-password") || msg.includes("auth/invalid-credential")) setError("Incorrect email or password.");
        else if (msg.includes("auth/weak-password")) setError("Password must be at least 6 characters.");
        else if (msg.includes("auth/popup-closed-by-user") || msg.includes("auth/cancelled-popup-request")) setError(null); // user dismissed — not an error
        else if (msg.includes("auth/too-many-requests")) setError("Too many attempts. Please try again later.");
        else if (msg.includes("auth/unauthorized-domain")) setError("This domain is not authorised in Firebase. Add it to Firebase Console → Authentication → Authorised Domains.");
        // Backend error — Firebase token verification failed (usually means FIREBASE_SERVICE_ACCOUNT_JSON not set on server)
        else if (msg.toLowerCase().includes("could not validate firebase") || msg.toLowerCase().includes("firebase authentication is not configured")) setError("Authentication service is not configured on the server. Please contact support.");
        // Network error — server unreachable
        else if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("networkerror")) setError("Could not reach the server. Please check your connection and try again.");
        else setError(msg);
    };

    const afterFirebaseToken = async (firebaseIdToken: string, redirectToIntro: boolean) => {
        const token = await ApiService.firebaseLogin(firebaseIdToken);
        login(token);
        // New users should go through onboarding; returning users straight to dashboard
        router.replace(redirectToIntro ? "/intro" : "/dashboard");
    };

    const handleGoogle = async () => {
        setError(null);
        setIsLoading("google");
        try {
            const idToken = await signInWithGoogle();
            // We don't know yet if it's a new or returning user — the backend knows.
            // Redirect to /intro if the profile has no profession set (handled by /intro check).
            const token = await ApiService.firebaseLogin(idToken);
            login(token);
            const isNewUser = !token.user?.onboardingResponses || Object.keys(token.user?.onboardingResponses ?? {}).length === 0;
            router.replace(isNewUser ? "/intro" : "/dashboard");
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(null);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading("email");
        try {
            let idToken: string;
            let isNewUser = false;
            if (mode === "signup") {
                idToken = await registerWithEmail(email, password);
                isNewUser = true;
            } else {
                idToken = await loginWithEmail(email, password);
            }
            await afterFirebaseToken(idToken, isNewUser);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-15%] left-[-10%] w-80 h-80 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-12">
                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white border-2 border-teal-100 shadow-xl shadow-teal-100 mb-4">
                        <Image
                            src="/assets/Vina Logo.png"
                            alt="Vina"
                            fill
                            className="object-contain mix-blend-multiply p-1"
                            priority
                        />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">Vina</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-1 text-sm tracking-wide">Learning that Listens</p>
                </div>

                {/* Main card */}
                <div className="w-full max-w-sm bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-teal-100/50 border border-white p-7 space-y-5">
                    {/* Mode toggle */}
                    <div className="flex bg-gray-100 rounded-2xl p-1">
                        <button
                            type="button"
                            onClick={() => { setMode("signin"); setError(null); }}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${mode === "signin" ? "bg-white shadow text-teal-700" : "text-gray-500"}`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode("signup"); setError(null); }}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${mode === "signup" ? "bg-white shadow text-teal-700" : "text-gray-500"}`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Google button */}
                    <button
                        type="button"
                        onClick={handleGoogle}
                        disabled={isLoading !== null}
                        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/50 transition-all duration-200 font-bold text-gray-700 text-sm shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isLoading === "google" ? (
                            <Loader2 size={20} className="animate-spin text-teal-600" />
                        ) : (
                            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 font-bold">or with email</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Email form */}
                    <form onSubmit={handleEmailSubmit} className="space-y-3">
                        {mode === "signup" && (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="w-full pl-4 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-teal-400 focus:ring-0 outline-none text-sm font-medium bg-gray-50 transition-colors"
                                />
                            </div>
                        )}
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-teal-400 focus:ring-0 outline-none text-sm font-medium bg-gray-50 transition-colors"
                            />
                        </div>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder={mode === "signup" ? "Create a password (6+ chars)" : "Password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full pl-10 pr-11 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-teal-400 focus:ring-0 outline-none text-sm font-medium bg-gray-50 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 font-medium">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="default"
                            disabled={isLoading !== null}
                            className="w-full h-13 rounded-2xl text-base font-bold shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                        >
                            {isLoading === "email" ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    {mode === "signup" ? "Create Account" : "Sign In"}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-xs text-gray-400 mt-6 text-center max-w-xs leading-relaxed">
                    By continuing, you agree to Vina's Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
