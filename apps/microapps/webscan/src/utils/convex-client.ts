import { ConvexHttpClient } from "convex/browser";
import type { ScanResult } from "../types/scan";

const convex = new ConvexHttpClient(process.env.CONVEX_URL!);
convex.setAuth(process.env.CONVEX_DEPLOY_KEY!);

export async function saveResultToConvex(result: ScanResult, userId: string) {
  try {
    const { api } = await import("@echoray/database/convex/_generated/api");

    await convex.mutation(api.webscan.saveScanResult, {
      scanId: result.scanId,
      userId,
      url: result.url,
      timestamp: result.timestamp,
      scores: result.scores,
      metrics: result.metrics,
      aiReadiness: result.aiReadiness,
    });

    console.log(`[CONVEX] Saved scan result ${result.scanId}`);
  } catch (error) {
    console.error("[CONVEX] Failed to save result:", error);
    throw error;
  }
}
