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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="text-center">
        <div className="mb-4 animate-spin rounded-full border-4 border-blue-400 border-t-transparent h-12 w-12 mx-auto" />
        {error ? (
          <div>
            <p className="text-red-400 mb-2">Authentication Error</p>
            <p className="text-sm text-slate-400">{error}</p>
            <p className="text-xs text-slate-500 mt-2">Redirecting...</p>
          </div>
        ) : (
          <p className="text-slate-300">Completing sign in...</p>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="mb-4 animate-spin rounded-full border-4 border-blue-400 border-t-transparent h-12 w-12 mx-auto" />
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
