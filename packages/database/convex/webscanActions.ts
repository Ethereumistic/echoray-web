import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { auth } from "./auth";

async function checkAdminAction(ctx: any) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export const startWebScan = action({
  args: {
    url: v.string(),
    categories: v.optional(
      v.array(
        v.union(
          v.literal("performance"),
          v.literal("accessibility"),
          v.literal("best-practices"),
          v.literal("seo"),
          v.literal("pwa"),
        ),
      ),
    ),
    device: v.optional(v.union(v.literal("mobile"), v.literal("desktop"))),
  },
  handler: async (ctx, args) => {
    const userId = await checkAdminAction(ctx);

    const scanId = crypto.randomUUID();
    const webscanApiUrl =
      process.env.WEBSCAN_API_URL || "http://localhost:3001";
    const webscanApiKey = process.env.WEBSCAN_API_KEY;

    if (!webscanApiKey) {
      throw new Error("WEBSCAN_API_KEY not configured");
    }

    await ctx.runMutation(api.webscan.createScanRecord, {
      scanId,
      userId,
      url: args.url,
      status: "pending",
    });

    try {
      const response = await fetch(`${webscanApiUrl}/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${webscanApiKey}`,
        },
        body: JSON.stringify({
          url: args.url,
          userId,
          scanId,
          options: {
            categories: args.categories || ["performance", "seo"],
            device: args.device || "mobile",
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`WebScan API error ${response.status}: ${errorText}`);
      }

      const result = (await response.json()) as {
        jobId: string;
        estimatedWait?: string;
      };
      console.log(`[WebScan] Scan ${scanId} queued for ${args.url}`);

      return {
        scanId,
        jobId: result.jobId,
        estimatedWait: result.estimatedWait || "30-60 seconds",
      };
    } catch (error: any) {
      console.error(`[WebScan] Failed to queue scan ${scanId}:`, error.message);

      await ctx.runMutation(api.webscan.markScanFailed, {
        scanId,
        error: error.message || "Failed to connect to WebScan service",
      });

      throw error;
    }
  },
});
