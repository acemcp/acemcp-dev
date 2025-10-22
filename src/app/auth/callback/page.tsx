"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/providers/supabase-auth-provider';

export default function AuthCallbackPage() {
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
          
          // Check if user has any projects
          const response = await fetch('/api/user/projects');
          const data = await response.json();
          
          const redirectTo = searchParams.get('redirectTo');
          const prompt = searchParams.get('prompt');
          
          // If new user (no projects), redirect to onboarding
          if (data.projects && data.projects.length === 0) {
            const params = new URLSearchParams();
            if (prompt) params.set('prompt', prompt);
            router.push(`/onboarding${params.toString() ? `?${params.toString()}` : ''}`);
          } else {
            // Existing user, redirect to requested page or landing
            router.push(redirectTo || '/landing');
          }
        } catch (error) {
          console.error('Error checking user:', error);
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
