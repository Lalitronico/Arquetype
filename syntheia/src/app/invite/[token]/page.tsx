"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, Shield, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface InvitationData {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  organization: {
    name: string;
  };
  invitedBy: {
    name: string;
  };
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchInvitation();
  }, [token]);

  async function fetchInvitation() {
    try {
      const res = await fetch(`/api/invitations/accept?token=${token}`);
      const data = await res.json();

      if (res.ok) {
        setInvitation(data.data);
      } else {
        setError(data.error || "Invalid invitation");
      }
    } catch (err) {
      setError("Failed to load invitation");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    setAccepting(true);
    setError(null);

    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setError(data.error || "Failed to accept invitation");
      }
    } catch (err) {
      setError("Failed to accept invitation");
      console.error(err);
    } finally {
      setAccepting(false);
    }
  }

  const isExpired = invitation && new Date(invitation.expiresAt) < new Date();
  const isAlreadyProcessed = invitation && invitation.status !== "pending";
  const emailMismatch = Boolean(session?.user?.email && invitation && session.user.email !== invitation.email);

  if (loading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold">Syntheia</span>
      </Link>

      <Card className="w-full max-w-md">
        {success ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Welcome to the team!</CardTitle>
              <CardDescription>
                You&apos;ve successfully joined {invitation?.organization.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Redirecting you to the dashboard...
              </p>
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-blue-600" />
            </CardContent>
          </>
        ) : error && !invitation ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Invalid Invitation</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/login">Go to Login</Link>
              </Button>
            </CardContent>
          </>
        ) : isExpired ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle>Invitation Expired</CardTitle>
              <CardDescription>
                This invitation has expired. Please ask the team admin to send a new one.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild variant="outline">
                <Link href="/login">Go to Login</Link>
              </Button>
            </CardContent>
          </>
        ) : isAlreadyProcessed ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-gray-600" />
              </div>
              <CardTitle>Invitation Already {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}</CardTitle>
              <CardDescription>
                This invitation has already been {invitation.status}.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>You&apos;re Invited!</CardTitle>
              <CardDescription>
                {invitation?.invitedBy.name || "Someone"} has invited you to join
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Organization info */}
              <div className="text-center">
                <h3 className="text-xl font-semibold">{invitation?.organization.name}</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">as</span>
                  <Badge variant="secondary">
                    {invitation?.role.charAt(0).toUpperCase() + (invitation?.role.slice(1) || "")}
                  </Badge>
                </div>
              </div>

              {/* Email mismatch warning */}
              {emailMismatch && session?.user && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    This invitation was sent to <strong>{invitation?.email}</strong>, but you&apos;re
                    signed in as <strong>{session.user.email}</strong>.
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please sign in with the correct email to accept.
                  </p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Actions */}
              {session ? (
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={handleAccept}
                    disabled={accepting || emailMismatch}
                  >
                    {accepting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      "Accept Invitation"
                    )}
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard">Decline</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-center text-muted-foreground">
                    Sign in or create an account to accept this invitation
                  </p>
                  <Button className="w-full" asChild>
                    <Link href={`/login?redirect=/invite/${token}`}>
                      Sign In to Accept
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/register?redirect=/invite/${token}&email=${encodeURIComponent(invitation?.email || "")}`}>
                      Create Account
                    </Link>
                  </Button>
                </div>
              )}

              {/* Expiry notice */}
              {invitation && (
                <p className="text-xs text-center text-muted-foreground">
                  This invitation expires on{" "}
                  {new Date(invitation.expiresAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
