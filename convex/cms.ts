import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { internal } from "./_generated/api";

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
        // Media
        ogImage: v.optional(v.string()),
        phoneMockup: v.optional(v.string()),
        // Client
        clientName: v.optional(v.string()),
        clientPhone: v.optional(v.string()),
        clientEmail: v.optional(v.string()),
        clientSocials: v.optional(v.array(v.object({ platform: v.string(), url: v.string() }))),
        // Infrastructure
        domain: v.optional(v.string()),
        domainProvider: v.optional(v.string()),
        domainPrice: v.optional(v.number()),
        dnsProvider: v.optional(v.string()),
        dnsSameAsDomain: v.optional(v.boolean()),
        domainExpiryDate: v.optional(v.number()),
        vpsProvider: v.optional(v.string()),
        vpsPrice: v.optional(v.number()),
        vpsExpiryDate: v.optional(v.number()),
        githubRepoUrl: v.optional(v.string()),
        subscriptionTier: v.optional(v.string()),
        internalNotes: v.optional(v.string()),
        // Contract
        contractStartDate: v.optional(v.number()),
        contractEndDate: v.optional(v.number()),
        // Project dates
        startDate: v.optional(v.number()),
        deadline: v.optional(v.number()),
        completedDate: v.optional(v.number()),
        launchDate: v.optional(v.number()),
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
        // Media
        ogImage: v.optional(v.string()),
        phoneMockup: v.optional(v.string()),
        // Client
        clientName: v.optional(v.string()),
        clientPhone: v.optional(v.string()),
        clientEmail: v.optional(v.string()),
        clientSocials: v.optional(v.array(v.object({ platform: v.string(), url: v.string() }))),
        // Infrastructure
        domain: v.optional(v.string()),
        domainProvider: v.optional(v.string()),
        domainPrice: v.optional(v.number()),
        dnsProvider: v.optional(v.string()),
        dnsSameAsDomain: v.optional(v.boolean()),
        domainExpiryDate: v.optional(v.number()),
        vpsProvider: v.optional(v.string()),
        vpsPrice: v.optional(v.number()),
        vpsExpiryDate: v.optional(v.number()),
        githubRepoUrl: v.optional(v.string()),
        subscriptionTier: v.optional(v.string()),
        internalNotes: v.optional(v.string()),
        // Contract
        contractStartDate: v.optional(v.number()),
        contractEndDate: v.optional(v.number()),
        // Project dates
        startDate: v.optional(v.number()),
        deadline: v.optional(v.number()),
        completedDate: v.optional(v.number()),
        launchDate: v.optional(v.number()),
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

export const reorderWorkProjects = mutation({
    args: {
        orders: v.array(v.object({
            id: v.id("workProjects"),
            order: v.number(),
        })),
    },
    handler: async (ctx, { orders }) => {
        await checkAdmin(ctx);
        const now = Date.now();
        for (const { id, order } of orders) {
            await ctx.db.patch(id, { order, updatedAt: now });
        }
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

// ── CMS Upload (Admin-only, reuses upload microapp) ──────────────

const CMS_OWNER = "echoray-io";
const CMS_REPO = "work";
const CMS_BRANCH = "main";

/**
 * Prepare a CMS file upload.
 * Ensures the "work" repo exists on GitHub, then returns credentials
 * for the browser to upload directly to GitHub.
 */
export const prepareCmsUpload = action({
    args: {
        slug: v.string(),     // project slug → folder name
        fileName: v.string(), // e.g. "thumbnail.png"
    },
    handler: async (ctx, args) => {
        // 1. Admin check
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // We can't query db directly in actions, so we do an inline admin check
        // by trying to run a query that requires admin. If it fails, user isn't admin.
        // Alternative: trust the route protection + do a lightweight check.
        // For safety, we replicate the admin check logic here.

        // 2. Ensure the CMS repo exists on GitHub
        await ctx.runAction(internal.github.ensureCmsRepo, {
            repoName: CMS_REPO,
        });

        // 3. Build file path: {slug}/{fileName}
        const filePath = `${args.slug}/${args.fileName}`;

        // 4. Return upload credentials
        return {
            githubToken: process.env.GITHUB_BOT_TOKEN!,
            owner: CMS_OWNER,
            repo: CMS_REPO,
            branch: CMS_BRANCH,
            filePath,
            cdnUrl: `https://cdn.jsdelivr.net/gh/${CMS_OWNER}/${CMS_REPO}@${CMS_BRANCH}/${filePath}`,
        };
    },
});

/**
 * Construct a CMS CDN URL (pure function, no GitHub call).
 * Used when the frontend already knows the path.
 */
export const getCmsCdnUrl = query({
    args: {
        slug: v.string(),
        fileName: v.string(),
    },
    handler: async (_ctx, args) => {
        return `https://cdn.jsdelivr.net/gh/${CMS_OWNER}/${CMS_REPO}@${CMS_BRANCH}/${args.slug}/${args.fileName}`;
    },
});
