import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
