"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";
import { Loader2, Users2, Key, Activity, CreditCard, ChevronRight } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  hasPasswordAuth: boolean;
  oauthProviders: string[];
  createdAt: string;
}

const settingsLinks = [
  {
    href: "/dashboard/settings/team",
    icon: Users2,
    title: "Team Settings",
    description: "Manage team members and invitations",
  },
  {
    href: "/dashboard/settings/api",
    icon: Key,
    title: "API Keys",
    description: "Manage your API keys for programmatic access",
  },
  {
    href: "/dashboard/settings/activity",
    icon: Activity,
    title: "Activity Log",
    description: "View organization activity and audit trail",
  },
  {
    href: "/dashboard/billing",
    icon: CreditCard,
    title: "Billing",
    description: "Manage your subscription and payment methods",
  },
];

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/user");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch user");
      }

      setUser(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(updateData: { name?: string; image?: string }) {
    const response = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update profile");
    }

    // Update local state with new data
    setUser((prev) => (prev ? { ...prev, ...data.data } : null));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and preferences
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchUser}
                className="text-[#7C3AED] hover:underline"
              >
                Try again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Form */}
      {user && <ProfileForm user={user} onUpdate={handleUpdateProfile} />}

      {/* Quick Links to Other Settings */}
      <Card>
        <CardHeader>
          <CardTitle>More Settings</CardTitle>
          <CardDescription>
            Access other configuration options
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {settingsLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-[#F3F0FF] flex items-center justify-center">
                  <link.icon className="h-5 w-5 text-[#7C3AED]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{link.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {link.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
