"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MemberList } from "@/components/team/member-list";
import { InviteDialog } from "@/components/team/invite-dialog";
import { Users, Mail, Clock, X, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface Member {
  id: string;
  userId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  invitedBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function TeamSettingsPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserRole = members.find((m) => m.userId === session?.user?.id)?.role || "member";

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);

    try {
      const [membersRes, invitationsRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/invitations"),
      ]);

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.data || []);
      }

      if (invitationsRes.ok) {
        const invitationsData = await invitationsRes.json();
        setInvitations(invitationsData.data || []);
      }
    } catch (err) {
      setError("Failed to load team data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(email: string, role: string): Promise<{ token: string } | null> {
    const res = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to send invitation");
    }

    // Refresh invitations
    fetchData();

    return { token: data.data.token };
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    const res = await fetch(`/api/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update role");
    }

    // Refresh members
    fetchData();
  }

  async function handleRemoveMember(memberId: string) {
    const res = await fetch(`/api/members/${memberId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to remove member");
    }

    // Refresh members
    fetchData();
  }

  async function handleRevokeInvitation(invitationId: string) {
    const res = await fetch(`/api/invitations/${invitationId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to revoke invitation");
    }

    // Refresh invitations
    fetchData();
  }

  const pendingInvitations = invitations.filter((i) => i.status === "pending");
  const canInvite = currentUserRole === "owner" || currentUserRole === "admin";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground mt-2">
            Manage your team members and invitations
          </p>
        </div>
        {canInvite && <InviteDialog onInvite={handleInvite} />}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            {members.length} member{members.length !== 1 ? "s" : ""} in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No team members yet. Invite someone to get started!
            </p>
          ) : (
            <MemberList
              members={members}
              currentUserId={session?.user?.id || ""}
              currentUserRole={currentUserRole}
              onRoleChange={handleRoleChange}
              onRemove={handleRemoveMember}
            />
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {canInvite && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations
            </CardTitle>
            <CardDescription>
              {pendingInvitations.length} pending invitation
              {pendingInvitations.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingInvitations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No pending invitations
              </p>
            ) : (
              <div className="space-y-3">
                {pendingInvitations.map((invitation) => {
                  const expiresAt = new Date(invitation.expiresAt);
                  const isExpired = expiresAt < new Date();
                  const daysUntilExpiry = Math.ceil(
                    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-white"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{invitation.email}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">
                              {invitation.role.charAt(0).toUpperCase() +
                                invitation.role.slice(1)}
                            </Badge>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {isExpired
                                ? "Expired"
                                : `Expires in ${daysUntilExpiry} day${
                                    daysUntilExpiry !== 1 ? "s" : ""
                                  }`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRevokeInvitation(invitation.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Role Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understanding what each role can do
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
              <div className="font-medium min-w-[80px]">Owner</div>
              <div className="text-sm text-muted-foreground">
                Full control including billing, organization settings, and can transfer ownership.
                Only one owner per organization.
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="font-medium min-w-[80px]">Admin</div>
              <div className="text-sm text-muted-foreground">
                Can invite and remove members, manage studies, and access the activity log.
                Cannot change billing or organization settings.
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="font-medium min-w-[80px]">Member</div>
              <div className="text-sm text-muted-foreground">
                Can create, view, and run studies. Can add comments to studies.
                Cannot invite or remove members.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
