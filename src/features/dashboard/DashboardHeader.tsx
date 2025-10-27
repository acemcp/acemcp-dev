"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Play } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <header className="relative flex items-center justify-between border-b border-slate-800/60 bg-slate-950/80 px-6 py-4 backdrop-blur">
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="#" className="hover:text-slate-100">
            Dashboard
          </Link>
          <Play className="size-3 text-slate-600" />
          <span className="font-medium text-slate-100">{breadcrumb}</span>
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-slate-50">
          Chat Playground
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded-full border border-slate-800/60 p-2 text-slate-400 transition hover:bg-slate-900/80 hover:text-slate-100">
          <Bell className="size-4" />
        </button>
        <button
          onClick={() => router.push("/profile")}
          className="inline-flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:shadow-blue-500/50 cursor-pointer"
          title="View Profile"
        >
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
        </button>
      </div>
      {/* Floating Tab Buttons in Header */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 rounded-full border border-slate-800/60 bg-slate-900/90 p-1.5 backdrop-blur-xl shadow-2xl">
        {(["chat", "workflow", "workflow_builder"] as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300",
              activeTab === tab
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50 border border-white/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 hover:border hover:border-white/40"
            )}
          >
            {tab === "chat"
              ? "Chat Playground"
              : tab === "workflow"
              ? "Workflow View"
              : "Workflow Builder"}
          </button>
        ))}
      </div>
    </header>
  );
}
