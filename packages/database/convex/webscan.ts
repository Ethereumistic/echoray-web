import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

async function checkAdmin(ctx: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");

  const user = await ctx.db.get(userId);
  if (!user || !user.subscriptionTierId)
    throw new Error("Unauthorized: No subscription tier");

  const tier = await ctx.db.get(user.subscriptionTierId);
  if (!tier) throw new Error("Unauthorized: Tier not found");

  const hasAdmin = (BigInt(tier.basePermissions) & (BigInt(1) << 50n)) !== 0n;
  if (!hasAdmin)
    throw new Error("Unauthorized: Staff admin permission required");

  return userId;
}

export const createScanRecord = mutation({
  args: {
    scanId: v.string(),
    userId: v.string(),
    url: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("webscan_results", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const saveScanResult = mutation({
  args: {
    scanId: v.string(),
    userId: v.string(),
    url: v.string(),
    timestamp: v.number(),
    scores: v.object({
      performance: v.number(),
      accessibility: v.number(),
      bestPractices: v.number(),
      seo: v.number(),
      pwa: v.optional(v.number()),
    }),
    metrics: v.object({
      firstContentfulPaint: v.number(),
      largestContentfulPaint: v.number(),
      totalBlockingTime: v.number(),
      cumulativeLayoutShift: v.number(),
      speedIndex: v.number(),
    }),
    aiReadiness: v.optional(
      v.object({
        structuredData: v.boolean(),
        semanticHtml: v.boolean(),
        imageAltTags: v.number(),
        headingStructure: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existingDoc = await ctx.db
      .query("webscan_results")
      .withIndex("by_scanId", (q) => q.eq("scanId", args.scanId))
      .first();

    if (existingDoc) {
      await ctx.db.patch(existingDoc._id, {
        status: "completed",
        scores: args.scores,
        metrics: args.metrics,
        aiReadiness: args.aiReadiness,
        completedAt: Date.now(),
      });
      return existingDoc._id;
    } else {
      return await ctx.db.insert("webscan_results", {
        scanId: args.scanId,
        userId: args.userId,
        url: args.url,
        status: "completed",
        scores: args.scores,
        metrics: args.metrics,
        aiReadiness: args.aiReadiness,
        createdAt: args.timestamp,
        completedAt: Date.now(),
      });
    }
  },
});

export const getScanByScanId = query({
  args: { scanId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("webscan_results")
      .withIndex("by_scanId", (q) => q.eq("scanId", args.scanId))
      .first();
  },
});

export const getScansByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("webscan_results")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

export const markScanFailed = mutation({
  args: {
    scanId: v.string(),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const existingDoc = await ctx.db
      .query("webscan_results")
      .withIndex("by_scanId", (q) => q.eq("scanId", args.scanId))
      .first();

    if (existingDoc) {
      await ctx.db.patch(existingDoc._id, {
        status: "failed",
        error: args.error,
        completedAt: Date.now(),
      });
    }
  },
});

export const getRecentScans = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    const limit = args.limit ?? 50;
    return await ctx.db.query("webscan_results").order("desc").take(limit);
  },
});

export const getScanStats = query({
  args: {},
  handler: async (ctx) => {
    await checkAdmin(ctx);

    const allScans = await ctx.db.query("webscan_results").collect();

    const completedScans = allScans.filter((s) => s.status === "completed");
    const failedScans = allScans.filter((s) => s.status === "failed");
    const pendingScans = allScans.filter((s) => s.status === "pending");

    const avgPerformance =
      completedScans.length > 0
        ? Math.round(
            completedScans.reduce(
              (sum, s) => sum + (s.scores?.performance ?? 0) * 100,
              0,
            ) / completedScans.length,
          )
        : 0;

    const avgAccessibility =
      completedScans.length > 0
        ? Math.round(
            completedScans.reduce(
              (sum, s) => sum + (s.scores?.accessibility ?? 0) * 100,
              0,
            ) / completedScans.length,
          )
        : 0;

    const avgSeo =
      completedScans.length > 0
        ? Math.round(
            completedScans.reduce(
              (sum, s) => sum + (s.scores?.seo ?? 0) * 100,
              0,
            ) / completedScans.length,
          )
        : 0;

    return {
      totalScans: allScans.length,
      completedScans: completedScans.length,
      failedScans: failedScans.length,
      pendingScans: pendingScans.length,
      avgPerformance,
      avgAccessibility,
      avgSeo,
    };
  },
});

export const deleteScan = mutation({
  args: { scanId: v.string() },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);

    const existingDoc = await ctx.db
      .query("webscan_results")
      .withIndex("by_scanId", (q) => q.eq("scanId", args.scanId))
      .first();

    if (existingDoc) {
      await ctx.db.delete(existingDoc._id);
      return true;
    }
    return false;
  },
});
