import { describe, it, expect } from "vitest";
import {
  hasPermission,
  canManageRole,
  canRemoveMember,
  getRolePermissions,
  PERMISSIONS,
  PermissionError,
  type Role,
  type Permission,
} from "../permissions";

describe("hasPermission", () => {
  // Owner permissions
  it("owner has org:delete permission", () => {
    expect(hasPermission("owner", "org:delete")).toBe(true);
  });

  it("owner has org:billing permission", () => {
    expect(hasPermission("owner", "org:billing")).toBe(true);
  });

  it("owner has all permissions", () => {
    const allPermissions = Object.keys(PERMISSIONS) as Permission[];
    for (const perm of allPermissions) {
      expect(hasPermission("owner", perm)).toBe(true);
    }
  });

  // Admin permissions
  it("admin can invite members", () => {
    expect(hasPermission("admin", "members:invite")).toBe(true);
  });

  it("admin can update org", () => {
    expect(hasPermission("admin", "org:update")).toBe(true);
  });

  it("admin cannot delete org", () => {
    expect(hasPermission("admin", "org:delete")).toBe(false);
  });

  it("admin cannot access billing", () => {
    expect(hasPermission("admin", "org:billing")).toBe(false);
  });

  it("admin cannot change roles", () => {
    expect(hasPermission("admin", "members:change_role")).toBe(false);
  });

  // Member permissions
  it("member can create studies", () => {
    expect(hasPermission("member", "studies:create")).toBe(true);
  });

  it("member can view studies", () => {
    expect(hasPermission("member", "studies:view")).toBe(true);
  });

  it("member can run studies", () => {
    expect(hasPermission("member", "studies:run")).toBe(true);
  });

  it("member cannot delete studies", () => {
    expect(hasPermission("member", "studies:delete")).toBe(false);
  });

  it("member cannot invite members", () => {
    expect(hasPermission("member", "members:invite")).toBe(false);
  });

  it("member cannot view activity logs", () => {
    expect(hasPermission("member", "activity:view")).toBe(false);
  });

  it("member cannot manage API keys", () => {
    expect(hasPermission("member", "api_keys:manage")).toBe(false);
  });
});

describe("canManageRole", () => {
  it("owner can manage any role", () => {
    expect(canManageRole("owner", "admin")).toBe(true);
    expect(canManageRole("owner", "member")).toBe(true);
    expect(canManageRole("owner", "owner")).toBe(true);
  });

  it("admin can only manage member roles", () => {
    expect(canManageRole("admin", "member")).toBe(true);
    expect(canManageRole("admin", "admin")).toBe(false);
    expect(canManageRole("admin", "owner")).toBe(false);
  });

  it("member cannot manage any role", () => {
    expect(canManageRole("member", "member")).toBe(false);
    expect(canManageRole("member", "admin")).toBe(false);
    expect(canManageRole("member", "owner")).toBe(false);
  });
});

describe("canRemoveMember", () => {
  it("owner can remove admins and members", () => {
    expect(canRemoveMember("owner", "admin")).toBe(true);
    expect(canRemoveMember("owner", "member")).toBe(true);
  });

  it("owner cannot remove another owner", () => {
    expect(canRemoveMember("owner", "owner")).toBe(false);
  });

  it("admin can only remove members", () => {
    expect(canRemoveMember("admin", "member")).toBe(true);
    expect(canRemoveMember("admin", "admin")).toBe(false);
    expect(canRemoveMember("admin", "owner")).toBe(false);
  });

  it("member cannot remove anyone", () => {
    expect(canRemoveMember("member", "member")).toBe(false);
    expect(canRemoveMember("member", "admin")).toBe(false);
    expect(canRemoveMember("member", "owner")).toBe(false);
  });
});

describe("getRolePermissions", () => {
  it("owner gets all permissions", () => {
    const ownerPerms = getRolePermissions("owner");
    const allPerms = Object.keys(PERMISSIONS);
    expect(ownerPerms).toHaveLength(allPerms.length);
  });

  it("admin gets fewer permissions than owner", () => {
    const ownerPerms = getRolePermissions("owner");
    const adminPerms = getRolePermissions("admin");
    expect(adminPerms.length).toBeLessThan(ownerPerms.length);
  });

  it("member gets fewer permissions than admin", () => {
    const adminPerms = getRolePermissions("admin");
    const memberPerms = getRolePermissions("member");
    expect(memberPerms.length).toBeLessThan(adminPerms.length);
  });

  it("member permissions are a subset of admin permissions", () => {
    const adminPerms = getRolePermissions("admin");
    const memberPerms = getRolePermissions("member");
    for (const perm of memberPerms) {
      expect(adminPerms).toContain(perm);
    }
  });
});

describe("PermissionError", () => {
  it("creates error with correct name", () => {
    const error = new PermissionError("test message");
    expect(error.name).toBe("PermissionError");
    expect(error.message).toBe("test message");
  });

  it("is an instance of Error", () => {
    const error = new PermissionError("test");
    expect(error).toBeInstanceOf(Error);
  });
});
