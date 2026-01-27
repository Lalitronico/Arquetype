import { db } from "@/db";
import { activityLogs } from "@/db/schema";

// Define all possible activity actions
export type ActivityAction =
  // Invitation actions
  | "invitation_sent"
  | "invitation_accepted"
  | "invitation_declined"
  | "invitation_revoked"
  // Member actions
  | "member_joined"
  | "member_removed"
  | "role_changed"
  // Study actions
  | "study_created"
  | "study_updated"
  | "study_deleted"
  | "study_started"
  | "study_completed"
  | "study_cancelled"
  // Comment actions
  | "comment_added"
  | "comment_deleted"
  // Organization actions
  | "organization_updated"
  // API key actions
  | "api_key_created"
  | "api_key_revoked";

// Resource types that can be logged
export type ResourceType =
  | "organization"
  | "member"
  | "study"
  | "invitation"
  | "comment"
  | "api_key";

// Metadata can be any JSON-serializable object
export type ActivityMetadata = Record<string, unknown>;

interface LogActivityParams {
  organizationId: string;
  userId?: string | null;
  action: ActivityAction;
  resourceType: ResourceType;
  resourceId?: string | null;
  metadata?: ActivityMetadata;
}

/**
 * Log an activity event to the audit trail
 */
export async function logActivity({
  organizationId,
  userId,
  action,
  resourceType,
  resourceId,
  metadata,
}: LogActivityParams): Promise<void> {
  try {
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      organizationId,
      userId: userId || null,
      action,
      resourceType,
      resourceId: resourceId || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    // Log error but don't throw - activity logging should not break operations
    console.error("Failed to log activity:", error);
  }
}

// Convenience functions for common activity types

export async function logInvitationSent(
  organizationId: string,
  userId: string,
  invitationId: string,
  email: string,
  role: string
): Promise<void> {
  await logActivity({
    organizationId,
    userId,
    action: "invitation_sent",
    resourceType: "invitation",
    resourceId: invitationId,
    metadata: { email, role },
  });
}

export async function logInvitationAccepted(
  organizationId: string,
  userId: string,
  invitationId: string,
  email: string
): Promise<void> {
  await logActivity({
    organizationId,
    userId,
    action: "invitation_accepted",
    resourceType: "invitation",
    resourceId: invitationId,
    metadata: { email },
  });
}

export async function logMemberJoined(
  organizationId: string,
  userId: string,
  memberName: string,
  role: string
): Promise<void> {
  await logActivity({
    organizationId,
    userId,
    action: "member_joined",
    resourceType: "member",
    resourceId: userId,
    metadata: { memberName, role },
  });
}

export async function logMemberRemoved(
  organizationId: string,
  removedById: string,
  removedUserId: string,
  memberName: string
): Promise<void> {
  await logActivity({
    organizationId,
    userId: removedById,
    action: "member_removed",
    resourceType: "member",
    resourceId: removedUserId,
    metadata: { memberName },
  });
}

export async function logRoleChanged(
  organizationId: string,
  changedById: string,
  targetUserId: string,
  memberName: string,
  oldRole: string,
  newRole: string
): Promise<void> {
  await logActivity({
    organizationId,
    userId: changedById,
    action: "role_changed",
    resourceType: "member",
    resourceId: targetUserId,
    metadata: { memberName, oldRole, newRole },
  });
}

export async function logStudyCreated(
  organizationId: string,
  userId: string,
  studyId: string,
  studyName: string
): Promise<void> {
  await logActivity({
    organizationId,
    userId,
    action: "study_created",
    resourceType: "study",
    resourceId: studyId,
    metadata: { studyName },
  });
}

export async function logStudyStarted(
  organizationId: string,
  userId: string,
  studyId: string,
  studyName: string
): Promise<void> {
  await logActivity({
    organizationId,
    userId,
    action: "study_started",
    resourceType: "study",
    resourceId: studyId,
    metadata: { studyName },
  });
}

export async function logCommentAdded(
  organizationId: string,
  userId: string,
  commentId: string,
  studyId: string,
  studyName: string
): Promise<void> {
  await logActivity({
    organizationId,
    userId,
    action: "comment_added",
    resourceType: "comment",
    resourceId: commentId,
    metadata: { studyId, studyName },
  });
}
