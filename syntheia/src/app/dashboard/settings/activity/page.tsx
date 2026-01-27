"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  UserPlus,
  UserMinus,
  Shield,
  FileText,
  Play,
  MessageSquare,
  Key,
  Mail,
  MailX,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ActivityLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
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

function getActionIcon(action: string) {
  switch (action) {
    case "invitation_sent":
      return <Mail className="h-4 w-4 text-blue-500" />;
    case "invitation_accepted":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "invitation_revoked":
      return <MailX className="h-4 w-4 text-red-500" />;
    case "member_joined":
      return <UserPlus className="h-4 w-4 text-green-500" />;
    case "member_removed":
      return <UserMinus className="h-4 w-4 text-red-500" />;
    case "role_changed":
      return <Shield className="h-4 w-4 text-blue-500" />;
    case "study_created":
    case "study_updated":
    case "study_deleted":
      return <FileText className="h-4 w-4 text-purple-500" />;
    case "study_started":
    case "study_completed":
      return <Play className="h-4 w-4 text-green-500" />;
    case "comment_added":
    case "comment_deleted":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "api_key_created":
    case "api_key_revoked":
      return <Key className="h-4 w-4 text-yellow-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
  }
}

function getActionDescription(action: string, metadata: Record<string, unknown> | null): string {
  switch (action) {
    case "invitation_sent":
      return `sent an invitation to ${metadata?.email || "a user"} as ${metadata?.role || "member"}`;
    case "invitation_accepted":
      return `accepted the invitation`;
    case "invitation_declined":
      return `declined the invitation`;
    case "invitation_revoked":
      return `revoked the invitation for ${metadata?.email || "a user"}`;
    case "member_joined":
      return `joined the team as ${metadata?.role || "member"}`;
    case "member_removed":
      return `removed ${metadata?.memberName || "a member"} from the team`;
    case "role_changed":
      return `changed ${metadata?.memberName || "a member"}'s role from ${metadata?.oldRole || "unknown"} to ${metadata?.newRole || "unknown"}`;
    case "study_created":
      return `created study "${metadata?.studyName || "Untitled"}"`;
    case "study_updated":
      return `updated study "${metadata?.studyName || "Untitled"}"`;
    case "study_deleted":
      return `deleted study "${metadata?.studyName || "Untitled"}"`;
    case "study_started":
      return `started running study "${metadata?.studyName || "Untitled"}"`;
    case "study_completed":
      return `completed study "${metadata?.studyName || "Untitled"}"`;
    case "study_cancelled":
      return `cancelled study "${metadata?.studyName || "Untitled"}"`;
    case "comment_added":
      return `commented on study "${metadata?.studyName || "Untitled"}"`;
    case "comment_deleted":
      return `deleted a comment from study "${metadata?.studyName || "Untitled"}"`;
    case "api_key_created":
      return `created API key "${metadata?.keyName || "Unknown"}"`;
    case "api_key_revoked":
      return `revoked API key "${metadata?.keyName || "Unknown"}"`;
    case "organization_updated":
      return `updated organization settings`;
    default:
      return action.replace(/_/g, " ");
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchLogs(currentPage * pageSize);
  }, [currentPage]);

  async function fetchLogs(offset: number) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/activity?limit=${pageSize}&offset=${offset}`);
      const data = await res.json();

      if (res.ok) {
        setLogs(data.data || []);
        setPagination(data.pagination);
      } else {
        setError(data.error || "Failed to load activity logs");
      }
    } catch (err) {
      setError("Failed to load activity logs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pageSize) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground mt-2">
          Track all actions taken in your organization
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            {pagination ? `${pagination.total} total activities` : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-muted-foreground">No activity yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Activities will appear here as your team takes actions
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {log.user ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={log.user.image || ""} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                          {getInitials(log.user.name, log.user.email)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {getActionIcon(log.action)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {log.user?.name || log.user?.email?.split("@")[0] || "System"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {getActionDescription(log.action, log.metadata)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(log.createdAt)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {log.resourceType}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {getActionIcon(log.action)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.total > pageSize && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {currentPage * pageSize + 1} to{" "}
                {Math.min((currentPage + 1) * pageSize, pagination.total)} of{" "}
                {pagination.total} activities
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasMore}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
