import { query, mutation, internalMutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

/**
 * Permission management Convex functions
 * Handles permission checks and computation
 */

/**
 * Permission bit positions - must match the seed data
 * 
 * Scopes:
 * - Global (bits 0-19): Tier-level permissions
 * - Org (bits 20-39): Organization role permissions  
 * - App (bits 40-49): Mini-app access
 * - System (bits 50+): Staff only
 */
export const PERMISSION_BITS: Record<string, number> = {
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
};

/**
 * Mask for all public/commercial bits (0-49)
 * Used to ensure system bits aren't accidentally inherited or assigned
 */
export const PUBLIC_BITS_MASK = (1n << 50n) - 1n;

/**
 * Mask for organization role permissions (bits 20-39)
 */
export const ORG_BITS_MASK = ((1n << 40n) - 1n) ^ ((1n << 20n) - 1n);

/**
 * All org permissions for org owners (bits 20-32)
 * Owners get all org permissions within their tier's feature cap
 */
export const ORG_OWNER_BITS = (1n << 33n) - (1n << 20n);

/**
 * Basic management bits that owners always keep (bits 24-29)
 * view, invite, remove, admin.remove
 */
export const BASIC_MGMT_MASK = (1n << 30n) - (1n << 24n);

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
 * Check if a user is a system administrator (Staff Admin)
 */
export async function isSystemAdmin(ctx: QueryCtx, userId: Id<"users">): Promise<boolean> {
    const user = await ctx.db.get(userId);
    if (!user || !user.subscriptionTierId) return false;

    const tier = await ctx.db.get(user.subscriptionTierId);
    if (!tier) return false;

    return hasPermissionBit(tier.basePermissions, PERMISSION_BITS['system.admin']);
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
        const permissions = await computeMemberPermissions(ctx, userId, organizationId);

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
            permissions = await computeMemberPermissions(ctx, userId, organizationId);
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
 * 
 * Scoped Permission Architecture:
 * 1. User's tier permissions (global + personal features)
 * 2. Role permissions CAPPED by org owner's tier orgFeatures
 * 3. System bits only for Staff Admins
 */
export async function computeMemberPermissions(
    ctx: QueryCtx,
    userId: Id<"users">,
    organizationId: Id<"organizations">
): Promise<number> {
    // Get user and their tier
    const user = await ctx.db.get(userId);
    const userTier = user?.subscriptionTierId ? await ctx.db.get(user.subscriptionTierId) : null;

    // Staff Admin Godmode - bypass everything
    if (userTier && hasPermissionBit(userTier.basePermissions, PERMISSION_BITS['system.admin'])) {
        return Number.MAX_SAFE_INTEGER;
    }

    // Start with user's tier permissions (global + personal)
    let permissions = BigInt(userTier?.basePermissions || 0);

    // Get membership
    const membership = await ctx.db
        .query("organizationMembers")
        .withIndex("by_org_user", (q) =>
            q.eq("organizationId", organizationId).eq("userId", userId)
        )
        .first();

    if (!membership || membership.status !== "active") {
        // Not a member - only has tier permissions, no org permissions
        return Number(permissions & PUBLIC_BITS_MASK);
    }

    const org = await ctx.db.get(organizationId);
    if (!org) return Number(permissions & PUBLIC_BITS_MASK);

    // Get org owner's tier to determine org's available features
    const owner = await ctx.db.get(org.ownerId);
    const ownerTier = owner?.subscriptionTierId ? await ctx.db.get(owner.subscriptionTierId) : null;

    // Org feature cap: which o.* permissions this org has access to
    const orgFeatureCap = BigInt(ownerTier?.orgFeatures || 0);

    // Determine role permissions
    let rolePermissions = 0n;

    if (org.ownerId === userId) {
        // Org owner gets all o.* permissions within their tier's cap
        rolePermissions = ORG_OWNER_BITS;
    } else {
        // Get member's role permissions
        const memberRoles = await ctx.db
            .query("memberRoles")
            .withIndex("by_memberId", (q) => q.eq("memberId", membership._id))
            .collect();

        for (const mr of memberRoles) {
            const role = await ctx.db.get(mr.roleId);
            if (role) {
                rolePermissions |= BigInt(role.permissions);
            }
        }
    }

    // === TIER-CAPPING: Org permissions are intersection of role grants AND org features ===
    // Member can only use o.* features that:
    // 1. Their role grants AND
    // 2. The org owner's tier provides
    let cappedOrgPermissions = rolePermissions & orgFeatureCap;

    // RULE: Owners always have basic management bits (24-29: view, invite, remove, admin.remove) 
    // regardless of tier, to avoid locking themselves out of their own org.
    if (org.ownerId === userId) {
        cappedOrgPermissions |= (ORG_OWNER_BITS & BASIC_MGMT_MASK);
    }

    // Add capped org permissions to user's tier permissions
    permissions |= cappedOrgPermissions;

    // Apply member-specific overrides (but still capped by org features)
    const overrides = await ctx.db
        .query("memberPermissionOverrides")
        .withIndex("by_memberId", (q) => q.eq("memberId", membership._id))
        .filter((q) =>
            q.or(
                q.eq(q.field("expiresAt"), undefined),
                q.gt(q.field("expiresAt"), Date.now())
            )
        )
        .collect();

    for (const override of overrides) {
        const permission = await ctx.db.get(override.permissionId);
        if (permission) {
            const bit = 1n << BigInt(permission.bitPosition);

            // For org permissions, check if org has the feature
            const isOrgPermission = permission.bitPosition >= 20 && permission.bitPosition < 40;
            const orgHasFeature = !isOrgPermission || (orgFeatureCap & bit) !== 0n;

            if (override.allow && orgHasFeature) {
                permissions |= bit;
            } else if (!override.allow) {
                permissions &= ~bit;
            }
        }
    }

    // Final safety: Non-staff never get system bits
    permissions &= PUBLIC_BITS_MASK;

    return Number(permissions);
}

/**
 * Recompute and cache a member's permissions
 */
export const recomputeMemberPermissions = mutation({
    args: { memberId: v.id("organizationMembers") },
    handler: async (ctx, { memberId }) => {
        const member = await ctx.db.get(memberId);
        if (!member) throw new Error("Member not found");

        const permissions = await computeMemberPermissions(
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
