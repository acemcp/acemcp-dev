"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSupabaseAuth } from '@/providers/supabase-auth-provider';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { session } = useSupabaseAuth();

  useEffect(() => {
    if (session) {
      router.push('/landing');
    }
  }, [session, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="mb-4 animate-spin rounded-full border-4 border-blue-400 border-t-transparent h-12 w-12 mx-auto" />
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}
