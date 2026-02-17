import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { isSystemAdmin, PERMISSION_BITS, hasPermissionBit } from "./permissions";

/**
 * Staff-only debug functions for managing permissions and tiers
 */

/**
 * Change a user's subscription tier (staff only)
 */
export const changeTier = mutation({
    args: {
        userId: v.optional(v.id("users")), // If not provided, changes own tier
        tierSlug: v.string(),
    },
    handler: async (ctx, { userId, tierSlug }) => {
        const currentUserId = await auth.getUserId(ctx);
        if (!currentUserId) throw new Error("Not authenticated");

        // Check if staff admin
        const isStaff = await isSystemAdmin(ctx, currentUserId);
        if (!isStaff) throw new Error("Staff only");

        // Find the tier
        const tier = await ctx.db
            .query("subscriptionTiers")
            .withIndex("by_slug", (q) => q.eq("slug", tierSlug))
            .first();

        if (!tier) throw new Error(`Tier not found: ${tierSlug}`);

        // Target user (self or specified)
        const targetUserId = userId || currentUserId;

        await ctx.db.patch(targetUserId, { subscriptionTierId: tier._id });

        return {
            success: true,
            userId: targetUserId,
            tier: { name: tier.name, slug: tier.slug },
        };
    },
});

/**
 * Get all subscription tiers (for tier switcher dropdown)
 */
export const getAllTiers = query({
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        // Check if staff admin
        const isStaff = await isSystemAdmin(ctx, userId);
        if (!isStaff) return [];

        return await ctx.db.query("subscriptionTiers").collect();
    },
});

/**
 * Get detailed permission breakdown for debugging
 */
export const getPermissionBreakdown = query({
    args: { organizationId: v.optional(v.id("organizations")) },
    handler: async (ctx, { organizationId }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (!user) return null;

        const userTier = user.subscriptionTierId
            ? await ctx.db.get(user.subscriptionTierId)
            : null;

        const isStaff = userTier
            ? hasPermissionBit(userTier.basePermissions, PERMISSION_BITS['system.admin'])
            : false;

        // Note: The frontend already restricts visibility to dev mode or staff admins
        // We return the breakdown for all authenticated users here

        let breakdown: {
            userId: typeof userId;
            userEmail: string | undefined;
            userTier: {
                name: string;
                slug: string;
                basePermissions: number;
                orgFeatures: number | undefined;
                maxOrganizations: number;
            } | null;
            organizationContext: {
                orgId: typeof organizationId;
                orgName: string | undefined;
                ownerId: string;
                ownerEmail: string | undefined;
                ownerTier: {
                    name: string;
                    slug: string;
                    orgFeatures: number | undefined;
                } | null;
                isOwner: boolean;
                membership: {
                    status: string;
                    computedPermissions: number;
                } | null;
                roles: { name: string; permissions: number; color?: string }[];
            } | null;
            isStaffAdmin: boolean;
        } = {
            userId,
            userEmail: user.email,
            userTier: userTier
                ? {
                    name: userTier.name,
                    slug: userTier.slug,
                    basePermissions: userTier.basePermissions,
                    orgFeatures: userTier.orgFeatures,
                    maxOrganizations: userTier.maxOrganizations,
                }
                : null,
            organizationContext: null,
            isStaffAdmin: isStaff,
        };

        if (organizationId) {
            const org = await ctx.db.get(organizationId);
            if (org) {
                const owner = await ctx.db.get(org.ownerId);
                const ownerTier = owner?.subscriptionTierId
                    ? await ctx.db.get(owner.subscriptionTierId)
                    : null;

                const membership = await ctx.db
                    .query("organizationMembers")
                    .withIndex("by_org_user", (q) =>
                        q.eq("organizationId", organizationId).eq("userId", userId)
                    )
                    .first();

                let roles: { name: string; permissions: number; color?: string }[] = [];
                if (membership) {
                    const memberRoles = await ctx.db
                        .query("memberRoles")
                        .withIndex("by_memberId", (q) => q.eq("memberId", membership._id))
                        .collect();

                    for (const mr of memberRoles) {
                        const role = await ctx.db.get(mr.roleId);
                        if (role) {
                            roles.push({
                                name: role.name,
                                permissions: role.permissions,
                                color: role.color,
                            });
                        }
                    }
                }

                breakdown.organizationContext = {
                    orgId: organizationId,
                    orgName: org.name,
                    ownerId: String(org.ownerId),
                    ownerEmail: owner?.email,
                    ownerTier: ownerTier
                        ? {
                            name: ownerTier.name,
                            slug: ownerTier.slug,
                            orgFeatures: ownerTier.orgFeatures,
                        }
                        : null,
                    isOwner: org.ownerId === userId,
                    membership: membership
                        ? {
                            status: membership.status,
                            computedPermissions: membership.computedPermissions,
                        }
                        : null,
                    roles,
                };
            }
        }

        return breakdown;
    },
});
