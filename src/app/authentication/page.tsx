"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Github, Mail, Loader2 } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-16 text-slate-100">
      <Card className="w-full max-w-md border border-slate-800/60 bg-slate-950/70 shadow-2xl shadow-slate-950/50">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold text-white">{heading}</CardTitle>
          <CardDescription className="text-slate-400">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center rounded-lg border border-slate-700 bg-slate-900/50 text-slate-100 hover:bg-slate-900"
              onClick={handleGithubSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Github className="mr-2 size-4" />
              )}
            </Button>
            <form className="space-y-4" onSubmit={handleEmailAuth}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isLoading}
                  required
                />
                <p className="text-xs text-slate-500">
                  Password must be at least 6 characters.
                </p>
              </div>
              <Button
                type="submit"
                className="w-full justify-center bg-blue-500 text-white hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 size-4" />
                )}
                {ctaLabel}
              </Button>
            </form>

            {errorMessage ? (
              <p className="text-sm text-red-500">{errorMessage}</p>
            ) : null}
            {successMessage ? (
              <p className="text-sm text-green-500">{successMessage}</p>
            ) : null}

            <div className="text-center text-sm text-slate-400">
              {altCopy}{" "}
              <Link
                className="font-medium text-blue-400 hover:text-blue-300"
                href={`/authentication?mode=${altMode}&redirectTo=${encodeURIComponent(redirectTo)}${prompt ? `&prompt=${encodeURIComponent(prompt)}` : ""}`}
              >
                {altLinkLabel}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
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