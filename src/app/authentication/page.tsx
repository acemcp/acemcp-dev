"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Github, Mail, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSupabaseAuth } from "@/providers/supabase-auth-provider";

const DEFAULT_REDIRECT = "/landing";

function AuthenticationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const redirectTo = searchParams.get("redirectTo") ?? DEFAULT_REDIRECT;
  const prompt = searchParams.get("prompt") ?? "";
  const urlError = searchParams.get("error");

  // Check if user is already authenticated
  const { user, isLoading: authLoading } = useSupabaseAuth();

  useEffect(() => {
    if (user && !authLoading) {
      // User is already authenticated, redirect to callback to handle routing
      const params = new URLSearchParams();
      if (redirectTo) params.set("redirectTo", redirectTo);
      if (prompt) params.set("prompt", prompt);
      router.replace(`/auth/callback${params.toString() ? `?${params.toString()}` : ""}`);
    }
  }, [user, authLoading, redirectTo, prompt, router]);

  // Display error from URL parameters (e.g., from failed OAuth)
  useEffect(() => {
    if (urlError) {
      const errorMessages: Record<string, string> = {
        auth_failed: "Authentication failed. Please try again.",
        no_session: "Could not create session. Please try again.",
        invalid_session: "Invalid session. Please sign in again.",
        unexpected: "An unexpected error occurred. Please try again.",
      };
      setErrorMessage(errorMessages[urlError] || "Authentication error occurred.");
    }
  }, [urlError]);

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const mode = searchParams.get("mode") === "signup" ? "signup" : "signin";

      if (mode === "signup") {
        // First, check if user already exists by attempting to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        // If sign-in succeeds, user already exists
        if (signInData?.session) {
          setErrorMessage("This email is already registered. Signing you in instead...");
          setTimeout(() => {
            const params = new URLSearchParams();
            if (redirectTo) params.set("redirectTo", redirectTo);
            if (prompt) params.set("prompt", prompt);
            router.push(`/auth/callback${params.toString() ? `?${params.toString()}` : ""}`);
          }, 1500);
          return;
        }

        // If sign-in fails with invalid credentials, proceed with sign-up
        if (signInError && signInError.message.includes("Invalid login credentials")) {
          // User doesn't exist, proceed with sign-up
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username: email,
              },
              emailRedirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}${prompt ? `&prompt=${encodeURIComponent(prompt)}` : ""}`,
            },
          });

          if (error) {
            // Handle other sign-up errors
            if (error.message.includes("already registered") || error.message.includes("already exists")) {
              setErrorMessage("This email is already registered. Please sign in instead.");
              setTimeout(() => {
                const params = new URLSearchParams();
                params.set("mode", "signin");
                if (redirectTo) params.set("redirectTo", redirectTo);
                if (prompt) params.set("prompt", prompt);
                router.push(`/authentication?${params.toString()}`);
              }, 2000);
              return;
            }
            throw error;
          }

          // Check if email confirmation is required
          if (data?.user && !data.session) {
            setSuccessMessage("Check your email to confirm your account. A confirmation link has been sent.");
          } else if (data?.session) {
            // Auto-confirmed, redirect to callback
            const params = new URLSearchParams();
            if (redirectTo) params.set("redirectTo", redirectTo);
            if (prompt) params.set("prompt", prompt);
            router.push(`/auth/callback${params.toString() ? `?${params.toString()}` : ""}`);
          }
        } else if (signInError && signInError.message.includes("Email not confirmed")) {
          // User exists but hasn't confirmed email
          setErrorMessage("This email is already registered but not confirmed. Please check your inbox for the confirmation link, or sign in to resend it.");
          setTimeout(() => {
            const params = new URLSearchParams();
            params.set("mode", "signin");
            if (redirectTo) params.set("redirectTo", redirectTo);
            if (prompt) params.set("prompt", prompt);
            router.push(`/authentication?${params.toString()}`);
          }, 3000);
          return;
        } else if (signInError) {
          // Other sign-in errors
          throw signInError;
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // Provide user-friendly error messages
          if (error.message.includes("Invalid login credentials") || error.message.includes("invalid_credentials")) {
            setErrorMessage("Invalid email or password. Please check your credentials and try again.");
          } else if (error.message.includes("Email not confirmed")) {
            setErrorMessage("Please confirm your email address before signing in. Check your inbox for the confirmation link.");
          } else {
            throw error;
          }
          return;
        }
        
        // Successful sign-in, redirect to callback
        if (data?.session) {
          const params = new URLSearchParams();
          if (redirectTo) params.set("redirectTo", redirectTo);
          if (prompt) params.set("prompt", prompt);
          router.push(`/auth/callback${params.toString() ? `?${params.toString()}` : ""}`);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Authentication failed. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      
      // Build callback URL with redirectTo and prompt parameters
      const callbackParams = new URLSearchParams();
      if (redirectTo) callbackParams.set("redirectTo", redirectTo);
      if (prompt) callbackParams.set("prompt", prompt);
      
      const callbackUrl = `${window.location.origin}/auth/callback${callbackParams.toString() ? `?${callbackParams.toString()}` : ""}`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (error) {
        throw error;
      }
      // Don't set isLoading to false here as user will be redirected
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in with GitHub.");
      setIsLoading(false);
    }
  };

  const mode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const heading = mode === "signup" ? "Create your account" : "Welcome back";
  const description =
    mode === "signup"
      ? "Sign up to start building AI agents with AcEMCP."
      : "Sign in to continue building your AI agents.";

  const ctaLabel = mode === "signup" ? "Sign up with email" : "Sign in with email";
  const altMode = mode === "signup" ? "signin" : "signup";
  const altCopy = mode === "signup" ? "Already have an account?" : "New to AcEMCP?";
  const altLinkLabel = mode === "signup" ? "Sign in" : "Create one";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] font-sans text-white">
      {/* Background - Same as landing page */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Base flowing gradient - Dark blue to lighter blue */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg, 
                #0a0a0a 0%, 
                #0f1419 15%, 
                #1a1f2e 30%, 
                #1e2a3a 45%, 
                #243447 60%, 
                #2a3f54 75%, 
                #304a61 90%, 
                #36556e 100%
              )
            `,
          }}
        />

        {/* Complementary blue tone overlays for depth */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(30, 58, 138, 0.4) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 30%, rgba(37, 99, 235, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 40% 70%, rgba(29, 78, 216, 0.35) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(30, 64, 175, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse at 10% 60%, rgba(31, 81, 194, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 90% 40%, rgba(28, 100, 242, 0.2) 0%, transparent 50%)
            `,
          }}
        />

        {/* Gritty texture with blue tones only */}
        <div
          className="absolute inset-0 opacity-35 mix-blend-overlay"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(30, 58, 138, 0.6) 1px, transparent 0),
              radial-gradient(circle at 2px 2px, rgba(37, 99, 235, 0.4) 1px, transparent 0),
              radial-gradient(circle at 3px 3px, rgba(29, 78, 216, 0.3) 1px, transparent 0),
              radial-gradient(circle at 4px 4px, rgba(30, 64, 175, 0.2) 1px, transparent 0)
            `,
            backgroundSize: '20px 20px, 30px 30px, 40px 40px, 50px 50px',
            backgroundPosition: '0 0, 10px 10px, 20px 20px, 30px 30px',
          }}
        />

        {/* Large flowing orbs - Only blue tones */}
        <div
          className="absolute top-0 left-0 w-[100vh] h-[100vh] rounded-full opacity-12 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(30, 58, 138, 0.8) 0%, rgba(37, 99, 235, 0.3) 40%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '12s',
            transform: 'translate(-40%, -40%)',
          }}
        />

        <div
          className="absolute top-1/4 right-0 w-[90vh] h-[90vh] rounded-full opacity-15 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(29, 78, 216, 0.7) 0%, rgba(30, 64, 175, 0.4) 35%, transparent 65%)',
            filter: 'blur(70px)',
            animationDuration: '10s',
            animationDelay: '4s',
            transform: 'translate(40%, -20%)',
          }}
        />

        <div
          className="absolute bottom-0 left-1/2 w-[120vh] h-[120vh] rounded-full opacity-10 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(31, 81, 194, 0.6) 0%, rgba(28, 100, 242, 0.3) 30%, transparent 60%)',
            filter: 'blur(90px)',
            animationDuration: '14s',
            animationDelay: '2s',
            transform: 'translate(-50%, 40%)',
          }}
        />

        {/* Additional mid-screen flowing orb */}
        <div
          className="absolute top-1/2 left-1/3 w-[80vh] h-[80vh] rounded-full opacity-8 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.5) 0%, rgba(30, 58, 138, 0.2) 40%, transparent 70%)',
            filter: 'blur(60px)',
            animationDuration: '16s',
            animationDelay: '6s',
            transform: 'translate(-30%, -50%)',
          }}
        />

        {/* Enhanced grain effect with blue noise */}
        <div
          className="absolute inset-0 opacity-12"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' fill='%231e3a8a' opacity='0.3'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />

        {/* Subtle blue-tinted grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,58,138,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(30,58,138,0.015)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
      </div>

      {/* Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
        {/* AKRON Logo */}
        <div className="mb-12 flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#5F96F1] to-[#2472eb] blur-sm" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#5F96F1] to-[#2472eb]">
              <Zap className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <span className="text-3xl font-bold text-white">akron</span>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-xl font-normal text-white/80 leading-relaxed">
              To use Akron you must log into an existing account or create one using one of the options below
            </h1>
          </div>

          {/* Auth Buttons */}
          <div className="space-y-3">
            {/* GitHub Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 justify-center rounded-xl border border-white/15 bg-[#2a2a2a] text-white/90 hover:bg-[#333333] hover:border-white/25 transition-all duration-200 backdrop-blur-sm font-medium text-base"
              onClick={handleGithubSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <Github className="mr-3 h-5 w-5" />
              )}
              {mode === "signup" ? "Sign up with GitHub" : "Sign in with GitHub"}
            </Button>

            {/* Email and Password */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 justify-center rounded-xl border border-white/15 bg-[#2a2a2a] text-white/90 hover:bg-[#333333] hover:border-white/25 transition-all duration-200 backdrop-blur-sm font-medium text-base"
              onClick={() => setShowEmailForm(!showEmailForm)}
              disabled={isLoading}
            >
              <Mail className="mr-3 h-5 w-5" />
              {mode === "signup" ? "Sign up with email and password" : "Sign in with email and password"}
            </Button>
          </div>

          {/* Email Form - Conditionally rendered */}
          {showEmailForm && (
          <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
            <form className="space-y-4" onSubmit={handleEmailAuth}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-white/70 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isLoading}
                  required
                  className="h-12 rounded-xl border border-white/15 bg-[#2a2a2a] text-white placeholder:text-white/40 focus:border-white/30 focus:bg-[#333333] backdrop-blur-sm text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-white/70 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isLoading}
                  required
                  className="h-12 rounded-xl border border-white/15 bg-[#2a2a2a] text-white placeholder:text-white/40 focus:border-white/30 focus:bg-[#333333] backdrop-blur-sm text-base"
                />
                <p className="text-xs text-white/50">
                  Password must be at least 6 characters.
                </p>
              </div>
              <Button
                type="submit"
                className="w-full h-12 justify-center bg-gradient-to-r from-[#5F96F1] to-[#2472eb] text-white hover:opacity-90 transition-all duration-200 rounded-xl font-medium text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-5 w-5" />
                )}
                {ctaLabel}
              </Button>
            </form>
          </div>
          )}

          {/* Error/Success Messages */}
          {errorMessage && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 backdrop-blur-sm">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400 backdrop-blur-sm">
              {successMessage}
            </div>
          )}

          {/* Footer Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-white/50 leading-relaxed">
              By signing in, you accept the{" "}
              <Link href="#" className="text-white/70 underline hover:text-white/90 transition-colors">
                Terms of Service
              </Link>{" "}
              and acknowledge our{" "}
              <Link href="#" className="text-white/70 underline hover:text-white/90 transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="mt-6 text-center text-sm text-white/60">
            {altCopy}{" "}
            <Link
              className="font-medium text-white/80 hover:text-white transition-colors underline"
              href={`/authentication?mode=${altMode}&redirectTo=${encodeURIComponent(redirectTo)}${prompt ? `&prompt=${encodeURIComponent(prompt)}` : ""}`}
            >
              {altLinkLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthenticationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <AuthenticationContent />
    </Suspense>
  );
}