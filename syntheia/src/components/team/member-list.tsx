"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Shield, Crown, User } from "lucide-react";

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

interface MemberListProps {
  members: Member[];
  currentUserId: string;
  currentUserRole: string;
  onRoleChange: (memberId: string, newRole: string) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
}

function getRoleIcon(role: string) {
  switch (role) {
    case "owner":
      return <Crown className="h-4 w-4 text-yellow-500" />;
    case "admin":
      return <Shield className="h-4 w-4 text-[#7C3AED]" />;
    default:
      return <User className="h-4 w-4 text-gray-500" />;
  }
}

function getRoleBadgeVariant(role: string): "default" | "secondary" | "outline" {
  switch (role) {
    case "owner":
      return "default";
    case "admin":
      return "secondary";
    default:
      return "outline";
  }
}

export function MemberList({
  members,
  currentUserId,
  currentUserRole,
  onRoleChange,
  onRemove,
}: MemberListProps) {
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const canManageRoles = currentUserRole === "owner";
  const canRemoveMembers = currentUserRole === "owner" || currentUserRole === "admin";

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setChangingRole(memberId);
    try {
      await onRoleChange(memberId, newRole);
    } finally {
      setChangingRole(null);
    }
  };

  const handleRemove = async (memberId: string) => {
    setRemoving(memberId);
    try {
      await onRemove(memberId);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="space-y-4">
      {members.map((member) => {
        const isCurrentUser = member.userId === currentUserId;
        const isOwner = member.role === "owner";
        const canChangeThisRole = canManageRoles && !isOwner && !isCurrentUser;
        const canRemoveThisMember = canRemoveMembers && !isOwner && !isCurrentUser;

        return (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 border rounded-lg bg-white"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.user.image || ""} />
                <AvatarFallback className="bg-[#F3F0FF] text-[#7C3AED]">
                  {getInitials(member.user.name, member.user.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {member.user.name || member.user.email.split("@")[0]}
                  </p>
                  {isCurrentUser && (
                    <Badge variant="outline" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{member.user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getRoleIcon(member.role)}
                {canChangeThisRole ? (
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleRoleChange(member.id, value)}
                    disabled={changingRole === member.id}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={getRoleBadgeVariant(member.role)}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                )}
              </div>

              {canRemoveThisMember && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Remove Team Member</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to remove{" "}
                        <strong>{member.user.name || member.user.email}</strong> from the
                        team? They will lose access to all studies and data.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRemove(member.id)}
                        disabled={removing === member.id}
                      >
                        {removing === member.id ? "Removing..." : "Remove Member"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
