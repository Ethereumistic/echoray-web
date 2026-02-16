import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * LeadAI CRUD functions
 * All guarded by system.admin permission (Bit 50)
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

// ── Searches ─────────────────────────────────────────────────────

export const listSearches = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);
        return await ctx.db
            .query("leadai_searches")
            .order("desc")
            .take(50);
    },
});

export const getSearch = query({
    args: { id: v.id("leadai_searches") },
    handler: async (ctx, { id }) => {
        await checkAdmin(ctx);
        const search = await ctx.db.get(id);
        if (!search) return null;

        const leads = await ctx.db
            .query("leadai_leads")
            .withIndex("by_search", (q) => q.eq("searchId", id))
            .collect();

        return { ...search, leads };
    },
});

export const createSearch = mutation({
    args: {
        industry: v.string(),
        niche: v.optional(v.string()),
        websiteType: v.string(),
        country: v.string(),
        city: v.optional(v.string()),
        requestedLeadCount: v.number(),
        aiModel: v.string(),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);
        return await ctx.db.insert("leadai_searches", {
            ...args,
            status: "in_progress",
            startedAt: Date.now(),
            totalLeadsFound: 0,
        });
    },
});

export const updateSearch = mutation({
    args: {
        id: v.id("leadai_searches"),
        status: v.optional(v.union(
            v.literal("in_progress"),
            v.literal("completed"),
            v.literal("failed")
        )),
        completedAt: v.optional(v.number()),
        totalLeadsFound: v.optional(v.number()),
        totalTokensUsed: v.optional(v.number()),
        totalCost: v.optional(v.number()),
        errorLog: v.optional(v.array(v.string())),
        requestedLeadCount: v.optional(v.number()),
    },
    handler: async (ctx, { id, ...args }) => {
        await checkAdmin(ctx);
        const updates: Record<string, any> = {};
        for (const [key, value] of Object.entries(args)) {
            if (value !== undefined) updates[key] = value;
        }
        await ctx.db.patch(id, updates);
        return id;
    },
});

export const deleteSearch = mutation({
    args: { id: v.id("leadai_searches") },
    handler: async (ctx, { id }) => {
        await checkAdmin(ctx);

        // Delete associated leads
        const leads = await ctx.db
            .query("leadai_leads")
            .withIndex("by_search", (q) => q.eq("searchId", id))
            .collect();
        for (const lead of leads) {
            await ctx.db.delete(lead._id);
        }

        // Delete associated API usage records
        const usage = await ctx.db
            .query("leadai_apiUsage")
            .withIndex("by_search", (q) => q.eq("searchId", id))
            .collect();
        for (const record of usage) {
            await ctx.db.delete(record._id);
        }

        // Delete the search itself
        await ctx.db.delete(id);
    },
});

// ── Leads ────────────────────────────────────────────────────────

export const listLeadsBySearch = query({
    args: { searchId: v.id("leadai_searches") },
    handler: async (ctx, { searchId }) => {
        await checkAdmin(ctx);
        return await ctx.db
            .query("leadai_leads")
            .withIndex("by_search", (q) => q.eq("searchId", searchId))
            .collect();
    },
});

export const getAllLeads = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { limit }) => {
        await checkAdmin(ctx);
        const q = ctx.db
            .query("leadai_leads")
            .order("desc");

        return limit ? await q.take(limit) : await q.take(100);
    },
});

export const getLead = query({
    args: { id: v.id("leadai_leads") },
    handler: async (ctx, { id }) => {
        await checkAdmin(ctx);
        return await ctx.db.get(id);
    },
});

export const createLead = mutation({
    args: {
        searchId: v.id("leadai_searches"),
        companyName: v.string(),
        companyNameLocal: v.optional(v.string()),
        industry: v.string(),
        businessDescription: v.string(),
        emails: v.array(v.object({
            email: v.string(),
            type: v.string(),
            verified: v.boolean(),
        })),
        phones: v.array(v.object({
            number: v.string(),
            type: v.string(),
            verified: v.boolean(),
        })),
        addresses: v.array(v.object({
            street: v.string(),
            city: v.string(),
            postalCode: v.optional(v.string()),
            country: v.string(),
            type: v.string(),
        })),
        contactPersons: v.array(v.object({
            name: v.string(),
            position: v.optional(v.string()),
            email: v.optional(v.string()),
            phone: v.optional(v.string()),
        })),
        website: v.optional(v.string()),
        websiteStatus: v.optional(v.object({
            hasHttps: v.boolean(),
            isMobileResponsive: v.boolean(),
            estimatedAge: v.optional(v.number()),
            techStack: v.optional(v.array(v.string())),
        })),
        socialMedia: v.array(v.object({
            platform: v.string(),
            url: v.string(),
            followers: v.optional(v.number()),
        })),
        googleBusinessUrl: v.optional(v.string()),
        registrationNumber: v.optional(v.string()),
        registryData: v.optional(v.object({
            source: v.string(),
            employeeCount: v.optional(v.number()),
            estimatedRevenue: v.optional(v.number()),
            registrationDate: v.optional(v.string()),
            legalStatus: v.optional(v.string()),
            directors: v.optional(v.array(v.string())),
            lastUpdated: v.string(),
        })),
        viabilityScore: v.number(),
        priorityTier: v.union(
            v.literal("hot"),
            v.literal("warm"),
            v.literal("cold"),
            v.literal("low")
        ),
        scoreBreakdown: v.object({
            contactInfoScore: v.number(),
            businessScaleScore: v.number(),
            digitalPresenceScore: v.number(),
            verificationScore: v.number(),
        }),
        dataSource: v.array(v.string()),
        aiConfidence: v.number(),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);
        const now = Date.now();
        return await ctx.db.insert("leadai_leads", {
            ...args,
            status: "new",
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const updateLeadStatus = mutation({
    args: {
        id: v.id("leadai_leads"),
        status: v.union(
            v.literal("new"),
            v.literal("rating_queued"),
            v.literal("rated"),
            v.literal("offer_created"),
            v.literal("contacted"),
            v.literal("converted"),
            v.literal("rejected")
        ),
    },
    handler: async (ctx, { id, status }) => {
        await checkAdmin(ctx);
        await ctx.db.patch(id, { status, updatedAt: Date.now() });
        return id;
    },
});

export const updateLeadNotes = mutation({
    args: {
        id: v.id("leadai_leads"),
        notes: v.string(),
    },
    handler: async (ctx, { id, notes }) => {
        await checkAdmin(ctx);
        await ctx.db.patch(id, { notes, updatedAt: Date.now() });
        return id;
    },
});

// ── Dashboard Stats ──────────────────────────────────────────────

export const getSearchStats = query({
    args: {},
    handler: async (ctx) => {
        await checkAdmin(ctx);

        const allSearches = await ctx.db.query("leadai_searches").collect();
        const allLeads = await ctx.db.query("leadai_leads").collect();

        const totalSearches = allSearches.length;
        const totalLeads = allLeads.length;
        const hotLeads = allLeads.filter((l) => l.priorityTier === "hot").length;
        const avgScore = totalLeads > 0
            ? Math.round(allLeads.reduce((sum, l) => sum + l.viabilityScore, 0) / totalLeads)
            : 0;
        const activeSearches = allSearches.filter((s) => s.status === "in_progress").length;

        return {
            totalSearches,
            totalLeads,
            hotLeads,
            avgScore,
            activeSearches,
        };
    },
});

// ── API Usage Tracking ───────────────────────────────────────────

export const trackApiUsage = mutation({
    args: {
        searchId: v.id("leadai_searches"),
        provider: v.string(),
        model: v.optional(v.string()),
        tokensUsed: v.optional(v.number()),
        requestCount: v.number(),
        cost: v.number(),
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx);
        return await ctx.db.insert("leadai_apiUsage", {
            ...args,
            timestamp: Date.now(),
        });
    },
});
