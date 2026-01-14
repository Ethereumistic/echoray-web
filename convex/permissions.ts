import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

/**
 * Permission management Convex functions
 * Handles permission checks and computation
 */

/**
 * Permission bit positions - must match the seed data and types/permissions.ts
 */
export const PERMISSION_BITS: Record<string, number> = {
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
};

/**
 * Check if a permission bit is set
 */
export function hasPermissionBit(permissions: number, bitPosition: number): boolean {
    return (BigInt(permissions) & (BigInt(1) << BigInt(bitPosition))) !== 0n;
}

/**
 * Set a permission bit
 */
export function setPermissionBit(permissions: number, bitPosition: number): number {
    return Number(BigInt(permissions) | (BigInt(1) << BigInt(bitPosition)));
}

/**
 * Clear a permission bit
 */
export function clearPermissionBit(permissions: number, bitPosition: number): number {
    return Number(BigInt(permissions) & ~(BigInt(1) << BigInt(bitPosition)));
}

/**
 * Check if the current user has a specific permission in an organization
 */
export const checkPermission = query({
    args: {
        organizationId: v.id("organizations"),
        permissionCode: v.string(),
    },
    handler: async (ctx, { organizationId, permissionCode }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return false;

        const bitPosition = PERMISSION_BITS[permissionCode];
        if (bitPosition === undefined) return false;

        // Get computed permissions
        const permissions = await computeMemberPermissionsInternal(ctx, userId, organizationId);

        return hasPermissionBit(permissions, bitPosition);
    },
});

/**
 * Get all permissions for the current user in an organization
 */
export const getUserPermissions = query({
    args: { organizationId: v.optional(v.id("organizations")) },
    handler: async (ctx, { organizationId }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return {};

        let permissions = 0;
        if (organizationId) {
            permissions = await computeMemberPermissionsInternal(ctx, userId, organizationId);
        } else {
            // Global context (no org): Include base permissions from user's tier
            const user = await ctx.db.get(userId);
            if (user && user.subscriptionTierId) {
                const tier = await ctx.db.get(user.subscriptionTierId);
                if (tier) permissions = tier.basePermissions;
            }
        }

        const allPermissions = await ctx.db.query("permissions").collect();

        // Convert to permission code -> boolean map
        const result: Record<string, boolean> = {};
        for (const p of allPermissions) {
            result[p.code] = hasPermissionBit(permissions, p.bitPosition);
        }

        return result;
    },
});

/**
 * Internal function to compute member permissions
 */
async function computeMemberPermissionsInternal(
    ctx: any,
    userId: Id<"users">,
    organizationId: Id<"organizations">
): Promise<number> {
    let permissions = 0;

    // Get membership
    const membership = await ctx.db
        .query("organizationMembers")
        .withIndex("by_org_user", (q: any) =>
            q.eq("organizationId", organizationId).eq("userId", userId)
        )
        .first();

    if (!membership || membership.status !== "active") {
        return 0;
    }

    // 0. Add user's own base permissions if they are a Staff Admin
    const user = await ctx.db.get(userId);
    if (user && user.subscriptionTierId) {
        const userTier = await ctx.db.get(user.subscriptionTierId);
        if (userTier && hasPermissionBit(userTier.basePermissions, 50)) {
            // Godmode: Staff admins get their bits in every context
            permissions = Number(BigInt(permissions) | BigInt(userTier.basePermissions));
        }
    }

    // Check if we have a valid cached value (less than 5 minutes old)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (
        membership.permissionsLastComputedAt &&
        membership.permissionsLastComputedAt > fiveMinutesAgo
    ) {
        // If they are a staff admin, we might have already set the bits above, 
        // but ORing the cache is still safe.
        return Number(BigInt(permissions) | BigInt(membership.computedPermissions));
    }

    // 1. Get base tier permissions from the Organization Owner
    const org = await ctx.db.get(organizationId);
    if (!org) return 0;

    const owner = await ctx.db.get(org.ownerId);
    if (owner && owner.subscriptionTierId) {
        const tier = await ctx.db.get(owner.subscriptionTierId);
        if (tier) {
            permissions = Number(BigInt(permissions) | BigInt(tier.basePermissions));
        }
    }
    permissions = Number(BigInt(permissions) | BigInt(org.customPermissions));

    // 2. Add organization addons
    const addons = await ctx.db
        .query("organizationAddons")
        .withIndex("by_organizationId", (q: any) => q.eq("organizationId", organizationId))
        .filter((q: any) =>
            q.and(
                q.eq(q.field("isActive"), true),
                q.or(
                    q.eq(q.field("expiresAt"), undefined),
                    q.gt(q.field("expiresAt"), Date.now())
                )
            )
        )
        .collect();

    for (const addon of addons) {
        const permission = await ctx.db.get(addon.permissionId);
        if (permission) {
            permissions = setPermissionBit(permissions, permission.bitPosition);
        }
    }

    // 3. Get role permissions
    const memberRoles = await ctx.db
        .query("memberRoles")
        .withIndex("by_memberId", (q: any) => q.eq("memberId", membership._id))
        .collect();

    for (const mr of memberRoles) {
        const role = await ctx.db.get(mr.roleId);
        if (role) {
            permissions = Number(BigInt(permissions) | BigInt(role.permissions));
        }
    }

    // 4. Apply member-specific overrides
    const overrides = await ctx.db
        .query("memberPermissionOverrides")
        .withIndex("by_memberId", (q: any) => q.eq("memberId", membership._id))
        .filter((q: any) =>
            q.or(
                q.eq(q.field("expiresAt"), undefined),
                q.gt(q.field("expiresAt"), Date.now())
            )
        )
        .collect();

    // Sort so denies are processed last
    overrides.sort((a: any, b: any) => (a.allow ? -1 : 1) - (b.allow ? -1 : 1));

    for (const override of overrides) {
        const permission = await ctx.db.get(override.permissionId);
        if (permission) {
            if (override.allow) {
                permissions = setPermissionBit(permissions, permission.bitPosition);
            } else {
                permissions = clearPermissionBit(permissions, permission.bitPosition);
            }
        }
    }

    // Note: We don't cache here in a query (can't mutate in query)
    // Caching would need to be done in a separate mutation

    return permissions;
}

/**
 * Recompute and cache a member's permissions
 */
export const recomputeMemberPermissions = mutation({
    args: { memberId: v.id("organizationMembers") },
    handler: async (ctx, { memberId }) => {
        const member = await ctx.db.get(memberId);
        if (!member) throw new Error("Member not found");

        const permissions = await computeMemberPermissionsInternal(
            ctx,
            member.userId,
            member.organizationId
        );

        await ctx.db.patch(memberId, {
            computedPermissions: permissions,
            permissionsLastComputedAt: Date.now(),
        });

        return permissions;
    },
});
