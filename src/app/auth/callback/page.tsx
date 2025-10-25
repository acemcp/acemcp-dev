"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useSupabaseAuth } from '@/providers/supabase-auth-provider';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useSupabaseAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      // Prevent multiple redirects
      if (hasRedirected) return;
      
      if (session) {
        try {
          setHasRedirected(true);
          
          // Sync user to database
          await fetch('/api/user/sync', { method: 'POST' });
          
          const redirectTo = searchParams.get('redirectTo');
          const prompt = searchParams.get('prompt');
          
          // Build redirect URL with prompt if available
          let redirectUrl = redirectTo || '/landing';
          console.log("redirectUrl", redirectUrl);
          if (prompt) {
            const separator = redirectUrl.includes('?') ? '&' : '?';
            redirectUrl = `${redirectUrl}${separator}prompt=${encodeURIComponent(prompt)}`;
          }
          
          // Small delay to ensure state is settled before redirect
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Redirect to landing page (or specified redirectTo) with prompt
          router.replace(redirectUrl);
        } catch (error) {
          console.error('Error syncing user:', error);
          router.replace('/landing');
        } finally {
          setIsChecking(false);
        }
      }
    };

    // Only run after initial loading is complete
    if (!isChecking) {
      checkUserAndRedirect();
    } else {
      // Set a timeout to finish checking
      const timeout = setTimeout(() => {
        setIsChecking(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [session, hasRedirected, isChecking, router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="mb-4 animate-spin rounded-full border-4 border-blue-400 border-t-transparent h-12 w-12 mx-auto" />
        <p>Completing sign in...</p>
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
