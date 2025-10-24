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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Card className="border-red-900/50 bg-slate-900/90">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
            <CardDescription className="text-slate-400">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="text-slate-400 hover:text-slate-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Badge className="border-blue-500/50 bg-blue-500/10 text-blue-400 px-3 py-1">
            <User className="mr-1 h-3 w-3" />
            Profile Settings
          </Badge>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <p className="text-emerald-400">{successMessage}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-blue-900/50 bg-gradient-to-br from-slate-900/90 via-blue-950/30 to-slate-900/90 backdrop-blur-xl shadow-2xl">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24 border-4 border-blue-500/50">
                    <AvatarImage src={profile.image || undefined} alt={profile.name || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl text-white">{profile.name || "Anonymous User"}</CardTitle>
                <CardDescription className="text-slate-400 flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </CardDescription>
                {isProUser && (
                  <Badge className="mt-3 border-yellow-500/50 bg-yellow-500/10 text-yellow-400 px-3 py-1">
                    <Crown className="mr-1 h-3 w-3" />
                    Pro Member
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator className="bg-slate-800" />
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Joined
                    </span>
                    <span className="text-slate-200">{formatDate(profile.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Provider
                    </span>
                    <span className="text-slate-200 capitalize">
                      {profile.accounts[0]?.provider || "Email"}
                    </span>
                  </div>
                  {profile.emailVerified && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Email Verified</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800/60 bg-slate-900/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  Activity Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Projects
                  </span>
                  <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                    {profile._count.projects}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Conversations
                  </span>
                  <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                    {profile._count.conversations}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    MCP Configs
                  </span>
                  <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                    {profile._count.mcpConfigs}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {!isProUser && (
              <Card className="border-yellow-900/50 bg-gradient-to-br from-yellow-950/30 via-yellow-900/20 to-slate-900/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    Upgrade to Pro
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Unlock premium features and capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-slate-300">
                    {proFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-yellow-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-blue-900/50 bg-gradient-to-br from-slate-900/90 via-blue-950/30 to-slate-900/90 backdrop-blur-xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Edit Profile</CardTitle>
                <CardDescription className="text-slate-400">
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-200">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                  <Input
                    id="email"
                    value={profile.email || ""}
                    disabled
                    className="bg-slate-950/50 border-slate-700 text-slate-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500">
                    Email cannot be changed. Contact support if you need assistance.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-slate-200">Profile Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                  <p className="text-xs text-slate-500">
                    Enter a URL to your profile image
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !name.trim()}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
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
                    className="border-slate-700 bg-slate-950 text-white hover:bg-slate-800"
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {profile.projects.length > 0 && (
              <Card className="border-slate-800/60 bg-slate-900/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Recent Projects</CardTitle>
                  <CardDescription className="text-slate-400">
                    Your latest projects and agents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/50 p-4"
                      >
                        <div>
                          <p className="font-medium text-slate-200">{project.name}</p>
                          <p className="text-xs text-slate-500">
                            Created {formatDate(project.createdAt)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/?projectId=${project.id}`)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-red-900/50 bg-gradient-to-br from-red-950/30 via-red-900/20 to-slate-900/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg text-red-400">Danger Zone</CardTitle>
                <CardDescription className="text-slate-400">
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                  <AlertDialogContent className="bg-slate-900 border-red-900/50">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-400">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data including projects, conversations,
                        and MCP configurations from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-slate-800 text-white hover:bg-slate-700">
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