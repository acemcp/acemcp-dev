"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        
        // Exchange the code for a session (handles OAuth callbacks)
        const code = searchParams.get('code');
        
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError);
            setError(exchangeError.message);
            // Redirect to authentication page with error
            setTimeout(() => {
              router.replace('/authentication?error=auth_failed');
            }, 2000);
            return;
          }

          if (!data.session) {
            setError('No session created');
            setTimeout(() => {
              router.replace('/authentication?error=no_session');
            }, 2000);
            return;
          }
        }

        // Verify we have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('No valid session found:', sessionError);
          setError('Authentication failed');
          setTimeout(() => {
            router.replace('/authentication?error=invalid_session');
          }, 2000);
          return;
        }

        // Sync user to database
        try {
          await fetch('/api/user/sync', { method: 'POST' });
        } catch (syncError) {
          console.error('Error syncing user:', syncError);
          // Continue anyway - user is authenticated
        }

        // Get redirect parameters
        const redirectTo = searchParams.get('redirectTo');
        const prompt = searchParams.get('prompt');

        // Build redirect URL
        let redirectUrl = redirectTo || '/landing';

        if (prompt) {
          const separator = redirectUrl.includes('?') ? '&' : '?';
          redirectUrl = `${redirectUrl}${separator}prompt=${encodeURIComponent(prompt)}`;
        }

        // Redirect to destination
        router.replace(redirectUrl);
        
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        setError('An unexpected error occurred');
        setTimeout(() => {
          router.replace('/authentication?error=unexpected');
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c0c0c] font-sans text-white">
      {/* Perplexity-style dark background with subtle gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Base dark background similar to Perplexity */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg, 
                #0c0c0c 0%, 
                #111111 20%, 
                #151515 40%, 
                #181818 60%, 
                #1a1a1a 80%, 
                #1c1c1c 100%
              )
            `,
          }}
        />

        {/* Subtle brand color accents */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(ellipse at 10% 10%, rgba(95, 150, 241, 0.08) 0%, transparent 40%),
              radial-gradient(ellipse at 90% 20%, rgba(95, 150, 241, 0.06) 0%, transparent 35%),
              radial-gradient(ellipse at 30% 80%, rgba(95, 150, 241, 0.05) 0%, transparent 30%),
              radial-gradient(ellipse at 80% 90%, rgba(95, 150, 241, 0.04) 0%, transparent 25%)
            `,
          }}
        />

        {/* Subtle floating orbs with brand color */}
        <div
          className="absolute top-1/4 left-1/4 w-[60vh] h-[60vh] rounded-full opacity-[0.03] animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(95, 150, 241, 0.4) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animationDuration: '15s',
          }}
        />

        <div
          className="absolute bottom-1/3 right-1/3 w-[50vh] h-[50vh] rounded-full opacity-[0.02] animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(95, 150, 241, 0.3) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animationDuration: '18s',
            animationDelay: '5s',
          }}
        />

        {/* Fine noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' fill='%23ffffff'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-spin rounded-full border-4 border-[#5F96F1] border-t-transparent h-12 w-12 mx-auto" />
          {error ? (
            <div>
              <p className="text-red-400 mb-2">Authentication Error</p>
              <p className="text-sm text-white/60">{error}</p>
              <p className="text-xs text-white/40 mt-2">Redirecting...</p>
            </div>
          ) : (
            <p className="text-white/80">Completing sign in...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0c0c0c] text-white">
          <div className="text-center">
            <div className="mb-4 animate-spin rounded-full border-4 border-[#5F96F1] border-t-transparent h-12 w-12 mx-auto" />
            <p className="text-white/80">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
