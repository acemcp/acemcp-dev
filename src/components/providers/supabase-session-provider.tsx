"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type SupabaseSessionContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

const SupabaseSessionContext = createContext<SupabaseSessionContextValue | undefined>(undefined);

export default function SupabaseSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;
      setSession(newSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [pathname]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
    }),
    [session, isLoading],
  );

  return <SupabaseSessionContext.Provider value={value}>{children}</SupabaseSessionContext.Provider>;
}

export function useSupabaseSession(): SupabaseSessionContextValue {
  const context = useContext(SupabaseSessionContext);
  if (!context) {
    throw new Error("useSupabaseSession must be used within SupabaseSessionProvider");
  }
  return context;
}