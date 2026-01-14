import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * Administrative functions for Echoray Staff
 * Guarded by system.admin permission (Bit 50)
 */

async function checkAdmin(ctx: any) {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || !user.subscriptionTierId) throw new Error("Unauthorized: No subscription tier");

    const tier = await ctx.db.get(user.subscriptionTierId);
    if (!tier) throw new Error("Unauthorized: Tier not found");

    // bitPosition 50 is system.admin
    const hasAdmin = (BigInt(tier.basePermissions) & (BigInt(1) << 50n)) !== 0n;
    if (!hasAdmin) throw new Error("Unauthorized: Staff admin permission required");

    return userId;
}

// --- Subscription Tiers ---

export const listTiers = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);
        return await ctx.db.query("subscriptionTiers").collect();
    },
});

export const updateTier = mutation({
    args: {
        id: v.id("subscriptionTiers"),
        name: v.optional(v.string()),
        priceEur: v.optional(v.number()),
        basePermissions: v.optional(v.number()),
        maxMembers: v.optional(v.number()),
        maxOrganizations: v.optional(v.number()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, { id, ...args }) => {
        await checkAdmin(ctx);
        await ctx.db.patch(id, args);
        return id;
    },
});

export const createTier = mutation({
    args: {
        name: v.string(),
        slug: v.string(),
        type: v.union(v.literal("commercial"), v.literal("system")),
        priceEur: v.number(),
        isCustom: v.boolean(),
        basePermissions: v.number(),
        maxOrganizations: v.number(),
        maxMembers: v.optional(v.number()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);
        return await ctx.db.insert("subscriptionTiers", args);
    },
});

// --- Permissions ---

export const listPermissions = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);
        return await ctx.db.query("permissions").collect();
    },
});

export const updatePermission = mutation({
    args: {
        id: v.id("permissions"),
        name: v.optional(v.string()),
        code: v.optional(v.string()),
        bitPosition: v.optional(v.number()),
        category: v.optional(v.string()),
        description: v.optional(v.string()),
        isDangerous: v.optional(v.boolean()),
    },
    handler: async (ctx, { id, ...args }) => {
        await checkAdmin(ctx);
        await ctx.db.patch(id, args);
        return id;
    },
});

export const createPermission = mutation({
    args: {
        code: v.string(),
        bitPosition: v.number(),
        name: v.string(),
        category: v.string(),
        isAddon: v.boolean(),
        isDangerous: v.boolean(),
        description: v.optional(v.string()),
        minTier: v.optional(v.string()),
        addonPriceEur: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);
        return await ctx.db.insert("permissions", args);
    },
});
export const listAuditLogs = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);
        return await ctx.db.query("permissionAuditLog").order("desc").take(50);
    },
});
