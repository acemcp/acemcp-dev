"use client";

import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

type TabKey = "chat" | "workflow" | "workflow_builder";

interface DashboardHeaderProps {
  user: User | null;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  breadcrumb: string;
}

export function DashboardHeader({
  user,
  activeTab,
  onTabChange,
  breadcrumb,
}: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-6 py-3">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-medium text-foreground">
          {breadcrumb}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/profile")}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 hover:bg-secondary/80 border border-border transition cursor-pointer"
          title="View Profile"
        >
          <div className="inline-flex size-6 items-center justify-center rounded-full bg-[#5F96F1] text-xs font-semibold text-white">
            {user?.user_metadata?.full_name || user?.user_metadata?.name
              ? (user.user_metadata.full_name || user.user_metadata.name)
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : user?.email
              ? user.email.substring(0, 2).toUpperCase()
              : "U"}
          </div>
          <span className="text-sm font-medium text-foreground">Profile</span>
        </button>
      </div>
    </header>
  );
}
