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
 * Maps permission codes to their bit positions as defined in 005_initial_seed.sql
 */
export const PERMISSION_BITS = {
    // Basic
    'profile.view': 0,
    'profile.edit': 1,

    // Web tier
    'analytics.view': 2,
    'export.csv': 3,
    'integrations.basic': 4,

    // App tier
    'analytics.advanced': 5,
    'api.access': 6,
    'export.pdf': 7,
    'webhooks.manage': 8,

    // CRM tier
    'crm.contacts': 9,
    'crm.deals': 10,
    'crm.automation': 11,

    // Admin permissions
    'org.settings': 12,
    'members.invite': 13,
    'members.remove': 14,
    'roles.manage': 15,
    'billing.view': 16,
    'billing.manage': 17,

    // Addons
    'integrations.zapier': 18,
    'integrations.slack': 19,
    'storage.extended': 20,
    'support.priority': 21,

    // Project permissions (Web tier and above)
    'project.create': 22,

    // System Admin (Bits 50+)
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
