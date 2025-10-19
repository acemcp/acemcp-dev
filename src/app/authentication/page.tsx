"use client";

import { FormEvent, useEffect, useState } from "react";
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

export default function AuthenticationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const redirectTo = searchParams.get("redirectTo") ?? DEFAULT_REDIRECT;
  const prompt = searchParams.get("prompt") ?? "";

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && event === "SIGNED_IN") {
        const params = new URLSearchParams();
        if (prompt) {
          params.set("prompt", prompt);
        }
        router.replace(`${redirectTo}${params.toString() ? `?${params.toString()}` : ""}`);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [prompt, redirectTo, router]);

  const handleEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const mode = searchParams.get("mode") === "signup" ? "signup" : "signin";

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: email,
            },
            emailRedirectTo: `${window.location.origin}/authentication?redirectTo=${encodeURIComponent(redirectTo)}${prompt ? `&prompt=${encodeURIComponent(prompt)}` : ""}`,
          },
        });

        if (error) {
          throw error;
        }

        setSuccessMessage("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed. Try again.");
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
      });

      if (error) {
        throw error;
      }
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