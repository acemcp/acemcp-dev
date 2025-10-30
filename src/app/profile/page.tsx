"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/providers/supabase-auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  User,
  Mail,
  Calendar,
  Shield,
  Trash2,
  Save,
  ArrowLeft,
  Crown,
  Sparkles,
  BarChart3,
  Bot,
  Server,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  accounts: Array<{
    provider: string;
    type: string;
  }>;
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

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, signOut } = useSupabaseAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/authentication?redirectTo=/profile");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/user/profile");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch profile");
      }
      
      setProfile(data.profile);
      setName(data.profile.name || "");
      setImageUrl(data.profile.image || "");
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: imageUrl }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }
      
      setProfile((prev) => prev ? { ...prev, ...data.profile } : null);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const response = await fetch("/api/user/profile", {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }
      
      await signOut();
      router.push("/landing");
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[#5F96F1]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="border-red-500/20 bg-card">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
            <CardDescription className="text-muted-foreground">
              {error || "Failed to load profile"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isProUser = false;
  const proFeatures = [
    "Unlimited AI agents",
    "Advanced analytics",
    "Priority support",
    "Custom integrations",
    "Team collaboration",
    "Advanced security",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Badge className="border-[#5F96F1]/20 bg-[#5F96F1]/10 text-[#5F96F1] px-3 py-1">
            <User className="mr-1 h-3 w-3" />
            Profile Settings
          </Badge>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <p className="text-emerald-400">{successMessage}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border bg-card">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24 border-4 border-[#5F96F1]/20">
                    <AvatarImage src={profile.image || undefined} alt={profile.name || "User"} />
                    <AvatarFallback className="bg-[#5F96F1] text-white text-2xl font-bold">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl text-foreground">{profile.name || "Anonymous User"}</CardTitle>
                <CardDescription className="text-muted-foreground flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </CardDescription>
                {isProUser && (
                  <Badge className="mt-3 border-yellow-500/20 bg-yellow-500/10 text-yellow-400 px-3 py-1">
                    <Crown className="mr-1 h-3 w-3" />
                    Pro Member
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator className="bg-border" />
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Joined
                    </span>
                    <span className="text-foreground">{formatDate(profile.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Provider
                    </span>
                    <span className="text-foreground capitalize">
                      {profile.accounts[0]?.provider || "Email"}
                    </span>
                  </div>
                  {profile.emailVerified && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Email Verified</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#5F96F1]" />
                  Activity Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Projects
                  </span>
                  <Badge variant="outline" className="border-[#5F96F1]/20 text-[#5F96F1]">
                    {profile._count.projects}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Conversations
                  </span>
                  <Badge variant="outline" className="border-[#5F96F1]/20 text-[#5F96F1]">
                    {profile._count.conversations}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    MCP Configs
                  </span>
                  <Badge variant="outline" className="border-[#5F96F1]/20 text-[#5F96F1]">
                    {profile._count.mcpConfigs}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {!isProUser && (
              <Card className="border-yellow-500/20 bg-yellow-500/5">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    Upgrade to Pro
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Unlock premium features and capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-foreground">
                    {proFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-yellow-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">Edit Profile</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-input border-border text-foreground focus:border-[#5F96F1] focus:ring-[#5F96F1]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <Input
                    id="email"
                    value={profile.email || ""}
                    disabled
                    className="bg-input/50 border-border text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if you need assistance.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-foreground">Profile Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="bg-input border-border text-foreground focus:border-[#5F96F1] focus:ring-[#5F96F1]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL to your profile image
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !name.trim()}
                    className="flex-1 bg-[#5F96F1] hover:bg-[#5F96F1]/80 text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setName(profile.name || "");
                      setImageUrl(profile.image || "");
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    variant="outline"
                    className="border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {profile.projects.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Recent Projects</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Your latest projects and agents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4"
                      >
                        <div>
                          <p className="font-medium text-foreground">{project.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Created {formatDate(project.createdAt)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/project/${project.id}`)}
                          className="text-[#5F96F1] hover:text-[#5F96F1]/80"
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-lg text-red-400">Danger Zone</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={async () => {
                    await signOut();
                    router.push("/landing");
                  }}
                  variant="outline"
                  className="w-full border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full bg-red-600 hover:bg-red-700"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-red-500/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-400">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data including projects, conversations,
                        and MCP configurations from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}