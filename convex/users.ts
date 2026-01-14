import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * User-related Convex functions
 * Handles profile management and user queries
 * Optimized: Unified users and profiles table
 */

/**
 * Get the currently authenticated user with their subscription tier
 */
export const currentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (!user) return null;

        // Ensure user has a subscription tier (Lazy initialization)
        let tierId = user.subscriptionTierId;
        if (!tierId) {
            const defaultTier = await ctx.db
                .query("subscriptionTiers")
                .withIndex("by_slug", (q) => q.eq("slug", "user"))
                .first();

            if (defaultTier) {
                // Note: We can't mutate in a query, so we'll just return it for now
                // or the frontend can call an initialization mutation
                tierId = defaultTier._id;
            }
        }

        const tier = tierId ? await ctx.db.get(tierId) : null;

        return {
            ...user,
            subscriptionTier: tier,
        };
    },
});

/**
 * Get a user's profile by ID
 */
export const getProfile = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        return await ctx.db.get(userId);
    },
});

/**
 * Update the current user's profile
 */
export const updateProfile = mutation({
    args: {
        name: v.optional(v.string()),
        username: v.optional(v.string()),
        image: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        await ctx.db.patch(userId, args);
        return userId;
    },
});

/**
 * Update the current user's display name
 * (Kept for compatibility with existing frontend calls)
 */
export const updateDisplayName = mutation({
    args: { displayName: v.string() },
    handler: async (ctx, { displayName }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        await ctx.db.patch(userId, { name: displayName });
        return { success: true };
    },
});

/**
 * Update the current user's avatar URL
 * (Kept for compatibility with existing frontend calls)
 */
export const updateAvatar = mutation({
    args: { avatarUrl: v.string() },
    handler: async (ctx, { avatarUrl }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        await ctx.db.patch(userId, { image: avatarUrl });
        return { success: true };
    },
});

/**
 * Check if the current user can create organizations
 * Returns canCreate boolean and reason/limit info
 */
export const canCreateOrganization = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return { canCreate: false, reason: "Not authenticated", currentCount: 0, maxAllowed: 0 };

        const user = await ctx.db.get(userId);
        if (!user) return { canCreate: false, reason: "User not found", currentCount: 0, maxAllowed: 0 };

        // Get user's subscription tier
        let tierId = user.subscriptionTierId;
        if (!tierId) {
            const defaultTier = await ctx.db
                .query("subscriptionTiers")
                .withIndex("by_slug", (q) => q.eq("slug", "user"))
                .first();
            if (defaultTier) tierId = defaultTier._id;
        }

        if (!tierId) {
            return { canCreate: false, reason: "No subscription tier", currentCount: 0, maxAllowed: 0 };
        }

        const tier = await ctx.db.get(tierId);
        if (!tier) {
            return { canCreate: false, reason: "Subscription tier not found", currentCount: 0, maxAllowed: 0 };
        }

        // Count owned organizations
        const ownedOrgs = await ctx.db
            .query("organizations")
            .withIndex("by_ownerId", (q) => q.eq("ownerId", userId))
            .collect();

        const currentCount = ownedOrgs.length;
        const maxAllowed = tier.maxOrganizations;

        if (maxAllowed === 0) {
            return {
                canCreate: false,
                reason: `Your ${tier.name} plan does not allow creating organizations. Upgrade to create workspaces.`,
                currentCount,
                maxAllowed,
                tierName: tier.name,
                tierSlug: tier.slug,
            };
        }

        if (currentCount >= maxAllowed) {
            return {
                canCreate: false,
                reason: `You've reached the limit of ${maxAllowed} organization(s) for your ${tier.name} plan.`,
                currentCount,
                maxAllowed,
                tierName: tier.name,
                tierSlug: tier.slug,
            };
        }

        return {
            canCreate: true,
            reason: null,
            currentCount,
            maxAllowed,
            tierName: tier.name,
            tierSlug: tier.slug,
        };
    },
});

