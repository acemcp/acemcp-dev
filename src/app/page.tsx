"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Root page - redirects all users to the landing page
 * This is the entry point for the application
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Always redirect to landing page as the entry point
    router.replace("/landing");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );
}
