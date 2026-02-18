import type { ScanResult } from "../types/scan";

const CONVEX_URL = process.env.CONVEX_URL!;
const CONVEX_DEPLOY_KEY = process.env.CONVEX_DEPLOY_KEY!;

async function convexMutation(name: string, args: Record<string, unknown>) {
  const response = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Convex ${CONVEX_DEPLOY_KEY}`,
    },
    body: JSON.stringify({
      path: name,
      args,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Convex mutation failed: ${error}`);
  }

  return response.json();
}

export async function saveResultToConvex(result: ScanResult, userId: string) {
  try {
    await convexMutation("webscan:saveScanResult", {
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

export async function markScanFailed(scanId: string, errorMsg: string) {
  try {
    await convexMutation("webscan:markScanFailed", {
      scanId,
      error: errorMsg,
    });

    console.log(`[CONVEX] Marked scan ${scanId} as failed`);
  } catch (error) {
    console.error("[CONVEX] Failed to mark scan failed:", error);
    throw error;
  }
}
