"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/providers/supabase-auth-provider";
import {
  MessageCircle,
  BarChart3,
  Bot,
  Server,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { key: "playground", label: "Playground", icon: MessageCircle },
];

interface ProjectLayoutProps {
  children: React.ReactNode;
}

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  projects: Array<{
    id: string;
    name: string;
    createdAt: Date;
  }>;
  _count: {
    projects: number;
    conversations: number;
    mcpConfigs: number;
  };
}

export default function ProjectLayout({
  children
}: ProjectLayoutProps) {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Collapsible Sidebar */}
      <aside
        className={cn(
          "hidden flex-col border-r border-border bg-card lg:flex transition-all duration-300 relative",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#5F96F1] text-sm font-semibold text-white">
              A
            </span>
            {!isSidebarCollapsed && (
              <span className="text-base font-medium text-foreground">
                Akron AI
              </span>
            )}
          </div>
        </div>
        <nav className="mt-4 space-y-1 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === "playground";
            return (
              <button
                key={item.key}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-[#5F96F1]/10 text-[#5F96F1]"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon className="size-4 flex-shrink-0" />
                {!isSidebarCollapsed && item.label}
              </button>
            );
          })}
        </nav>

        {/* Activity Stats Section */}
        {!isSidebarCollapsed && profile && (
          <div className="mt-6 px-4">
            <Card className="border-border bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#5F96F1]" />
                  Activity Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2 text-xs">
                    <Bot className="h-3 w-3" />
                    Projects
                  </span>
                  <Badge variant="outline" className="border-[#5F96F1]/20 text-[#5F96F1] text-xs">
                    {profile._count.projects}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2 text-xs">
                    <MessageCircle className="h-3 w-3" />
                    Conversations
                  </span>
                  <Badge variant="outline" className="border-[#5F96F1]/20 text-[#5F96F1] text-xs">
                    {profile._count.conversations}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2 text-xs">
                    <Server className="h-3 w-3" />
                    MCP Configs
                  </span>
                  <Badge variant="outline" className="border-[#5F96F1]/20 text-[#5F96F1] text-xs">
                    {profile._count.mcpConfigs}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Projects Section */}
        {!isSidebarCollapsed && profile && profile.projects.length > 0 && (
          <div className="mt-4 px-4 flex-1 overflow-hidden">
            <Card className="border-border bg-card/50 h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-sm text-foreground">Recent Projects</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Your latest projects
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1 overflow-y-auto flex flex-col">
                <div className="space-y-2 flex-1">
                  {profile.projects.slice(0, 3).map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-xs truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(project.createdAt)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/project/${project.id}`)}
                        className="text-[#5F96F1] hover:text-[#5F96F1]/80 h-6 px-2 text-xs ml-2 flex-shrink-0"
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>

                {/* New Project Button */}
                <div className="mt-3 pt-3 border-t border-border">
                  <Button
                    onClick={() => router.push("/landing")}
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs border-[#5F96F1]/20 text-[#5F96F1] hover:bg-[#5F96F1]/10 hover:text-[#5F96F1] hover:border-[#5F96F1]/30"
                  >
                    <Plus className="h-3 w-3 mr-1.5" />
                    New Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}


      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}