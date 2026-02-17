/**
 * roles and permissions types
 * Strictly follows the bitwise system defined in ai/roles_permissions.mdx
 */
import type { Id } from "../../convex/_generated/dataModel";

export type SubscriptionTier = 'user' | 'web' | 'app' | 'crm';

export type OrganizationStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'paused';

export type MemberStatus = 'invited' | 'active' | 'suspended' | 'left';

export type SystemRoleType = 'owner' | 'admin' | 'moderator' | 'member';

export type PermissionCategory =
    | 'basic'
    | 'analytics'
    | 'export'
    | 'integrations'
    | 'api'
    | 'crm'
    | 'admin'
    | 'billing';

/**
 * Maps permission codes to their bit positions
 * Must match convex/permissions.ts and seed data
 * 
 * Scopes:
 * - Global (bits 0-19): Tier-level permissions
 * - Org (bits 20-39): Organization role permissions  
 * - App (bits 40-49): Mini-app access
 * - System (bits 50+): Staff only
 */
export const PERMISSION_BITS = {
    // === GLOBAL/TIER PERMISSIONS (Bits 0-19) ===
    'profile.view': 0,
    'profile.edit': 1,
    'org.create': 2,
    'p.project.create': 3,

    // === ORGANIZATION ROLE PERMISSIONS (Bits 20-39) ===
    'o.project.view': 20,
    'o.project.create': 21,
    'o.project.edit': 22,
    'o.project.delete': 23,
    'o.member.view': 24,
    'o.member.invite': 25,
    'o.editor.invite': 26,
    'o.admin.invite': 27,
    'o.member.remove': 28,
    'o.admin.remove': 29,
    'o.role.manage': 30,
    'o.settings.edit': 31,

    // === APP PERMISSIONS (Bits 40-49) ===
    'app.invoice': 40,
    'app.qr': 41,
    'app.crosspost': 42,

    // === SYSTEM PERMISSIONS (Bits 50+) ===
    'system.admin': 50,
    'system.support': 51,
} as const;

export type PermissionCode = keyof typeof PERMISSION_BITS;

export interface Organization {
    _id: Id<"organizations">;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    ownerId: Id<"users">;
    subscriptionTierId: Id<"subscriptionTiers">;
    subscriptionStatus: OrganizationStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface OrganizationMember {
    _id: Id<"organizationMembers">;
    organizationId: Id<"organizations">;
    userId: Id<"users">;
    status: MemberStatus;
    invitedBy?: Id<"users">;
    invitedAt: number;
    joinedAt?: number;
    computedPermissions: number;
    createdAt?: string;
    _creationTime?: number;
}

export interface Role {
    _id: Id<"roles">;
    organizationId: Id<"organizations">;
    name: string;
    description?: string;
    color?: string;
    permissions: number;
    position: number;
    isSystemRole: boolean;
    systemRoleType?: SystemRoleType;
    isAssignable: boolean;
    isDefault: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface MemberWithRoles extends OrganizationMember {
    user: {
        id: Id<"users">;
        email?: string;
        fullName?: string;
        username?: string;
        avatarUrl?: string;
    };
    memberRoles: { role: Role | null }[];
    roles: (Role | null)[];
}
