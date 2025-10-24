"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useSupabaseAuth } from '@/providers/supabase-auth-provider';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useSupabaseAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (session) {
        try {
          // Sync user to database
          await fetch('/api/user/sync', { method: 'POST' });
          
          const redirectTo = searchParams.get('redirectTo');
          const prompt = searchParams.get('prompt');
          
          // Build redirect URL with prompt if available
          let redirectUrl = redirectTo || '/landing';
          if (prompt) {
            const separator = redirectUrl.includes('?') ? '&' : '?';
            redirectUrl = `${redirectUrl}${separator}prompt=${encodeURIComponent(prompt)}`;
          }
          
          // Redirect to landing page (or specified redirectTo) with prompt
          router.push(redirectUrl);
        } catch (error) {
          console.error('Error syncing user:', error);
          router.push('/landing');
        } finally {
          setIsChecking(false);
        }
      }
    };

    checkUserAndRedirect();
  }, [session, router, searchParams]);

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
