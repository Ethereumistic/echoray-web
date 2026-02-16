import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * CMS Admin functions for managing public website content.
 * All mutations guarded by system.admin permission (Bit 50).
 */

async function checkAdmin(ctx: any) {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || !user.subscriptionTierId) throw new Error("Unauthorized: No subscription tier");

    const tier = await ctx.db.get(user.subscriptionTierId);
    if (!tier) throw new Error("Unauthorized: Tier not found");

    const hasAdmin = (BigInt(tier.basePermissions) & (BigInt(1) << 50n)) !== 0n;
    if (!hasAdmin) throw new Error("Unauthorized: Staff admin permission required");

    return userId;
}

// ── Work Projects ────────────────────────────────────────────────

export const listWorkProjects = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);
        return await ctx.db.query("workProjects").withIndex("by_order").collect();
    },
});

export const getWorkProject = query({
    args: { id: v.id("workProjects") },
    handler: async (ctx, { id }) => {
        await checkAdmin(ctx);
        return await ctx.db.get(id);
    },
});

export const createWorkProject = mutation({
    args: {
        title: v.string(),
        slug: v.string(),
        link: v.string(),
        thumbnail: v.string(),
        tagline: v.optional(v.string()),
        description: v.optional(v.string()),
        projectType: v.optional(v.string()),
        techStack: v.optional(v.array(v.string())),
        status: v.union(v.literal("completed"), v.literal("ongoing")),
        isPublished: v.boolean(),
        order: v.number(),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);
        const now = Date.now();
        return await ctx.db.insert("workProjects", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const updateWorkProject = mutation({
    args: {
        id: v.id("workProjects"),
        title: v.optional(v.string()),
        slug: v.optional(v.string()),
        link: v.optional(v.string()),
        thumbnail: v.optional(v.string()),
        tagline: v.optional(v.string()),
        description: v.optional(v.string()),
        projectType: v.optional(v.string()),
        techStack: v.optional(v.array(v.string())),
        status: v.optional(v.union(v.literal("completed"), v.literal("ongoing"))),
        isPublished: v.optional(v.boolean()),
        order: v.optional(v.number()),
    },
    handler: async (ctx, { id, ...args }) => {
        await checkAdmin(ctx);
        await ctx.db.patch(id, {
            ...args,
            updatedAt: Date.now(),
        });
        return id;
    },
});

export const deleteWorkProject = mutation({
    args: { id: v.id("workProjects") },
    handler: async (ctx, { id }) => {
        await checkAdmin(ctx);
        await ctx.db.delete(id);
    },
});

export const countWorkProjects = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);
        const projects = await ctx.db.query("workProjects").collect();
        return projects.length;
    },
});

// ── Seed Data ────────────────────────────────────────────────────

export const seedWorkProjects = mutation({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);

        // Check if data already exists
        const existing = await ctx.db.query("workProjects").first();
        if (existing) {
            throw new Error("Work projects already seeded. Delete existing data first.");
        }

        const projects = [
            { title: "M-Texx Textile Recycling", link: "https://m-texx.com", thumbnail: "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/sq/en/m-texx.png" },
            { title: "Ultrabuild", link: "https://ultrabuild.bg", thumbnail: "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/sq/en/ultrabuild.png" },
            { title: "stars.guide", link: "https://stars.guide", thumbnail: "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/sq/en/stars.guide.png" },
            { title: "Bio-DDD", link: "https://bio-ddd.com", thumbnail: "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/sq/en/bio-ddd.png" },
            { title: "Unseen", link: "https://unseen.bg", thumbnail: "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/sq/en/echoray-default-book.png" },
            { title: "Unseen 2", link: "https://unseen.bg", thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/renderwork.png" },
            { title: "yea.cool", link: "https://yea.cool", thumbnail: "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/sq/en/yea.cool.png" },
            { title: "DB Productions", link: "https://dbproductions.net", thumbnail: "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/sq/en/dbproductions.png" },
            { title: "Dani Rusev", link: "https://danirusev.com", thumbnail: "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/sq/en/danirusev.png" },
            { title: "Unseen 3", link: "https://unseen.bg", thumbnail: "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/sq/en/echoray-accent-book.png" },
            { title: "Renderwork Studio", link: "https://renderwork.studio", thumbnail: "https://www.aceternity.com/images/products/thumbnails/new/renderwork.png" },
            { title: "Purity or Death", link: "https://chistota-smurt.vercel.app/", thumbnail: "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/sq/en/chist.png" },
            { title: "Global Travel", link: "https://global-travel.bg", thumbnail: "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/sq/en/global-travel.png" },
            { title: "Rossa Travel", link: "https://rossa-travel.bg", thumbnail: "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/sq/en/global-travel.png" },
            { title: "Unseen 4", link: "https://unseen.bg", thumbnail: "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/sq/en/echoray-default.png" },
        ];

        const now = Date.now();
        const slugify = (text: string) =>
            text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

        for (let i = 0; i < projects.length; i++) {
            const p = projects[i];
            await ctx.db.insert("workProjects", {
                title: p.title,
                slug: slugify(p.title) + (i > 0 ? `-${i}` : ""),
                link: p.link,
                thumbnail: p.thumbnail,
                status: "completed" as const,
                isPublished: true,
                order: i,
                createdAt: now,
                updatedAt: now,
            });
        }

        return { seeded: projects.length };
    },
});
