/**
 * roles and permissions types
 * Strictly follows the bitwise system defined in ai/roles_permissions.mdx
 */

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
} as const;

export type PermissionCode = keyof typeof PERMISSION_BITS;

export interface Organization {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo_url?: string;
    owner_id: string;
    subscription_tier_id: string;
    subscription_status: OrganizationStatus;
    created_at: string;
    updated_at: string;
}

export interface OrganizationMember {
    id: string;
    organization_id: string;
    user_id: string;
    status: MemberStatus;
    invited_by?: string;
    invited_at: string;
    joined_at?: string;
    computed_permissions: string; // BIGINT from Postgres comes as string in JS
    created_at: string;
}

export interface Role {
    id: string;
    organization_id: string;
    name: string;
    description?: string;
    color: string;
    permissions: string; // BIGINT
    position: number;
    is_system_role: boolean;
    system_role_type?: SystemRoleType;
    is_assignable: boolean;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface MemberWithRoles extends OrganizationMember {
    user: {
        id: string;
        email: string;
        full_name?: string;
        avatar_url?: string;
    };
    roles: Role[];
}
