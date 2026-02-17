import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import type { ScanRequest, ScanResult } from "./types/scan";

export async function runLighthouseScan(
  request: ScanRequest,
): Promise<ScanResult> {
  const { url, scanId, options } = request;

  console.log(`[SCAN] Starting Lighthouse scan for ${url}`);

  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const runnerResult = await lighthouse(url, {
      port: chrome.port,
      output: "json",
      onlyCategories: options?.categories || [
        "performance",
        "accessibility",
        "best-practices",
        "seo",
      ],
      formFactor: options?.device || "mobile",
      throttling:
        process.env.LIGHTHOUSE_THROTTLING === "true"
          ? {
              rttMs: 150,
              throughputKbps: 1638.4,
              cpuSlowdownMultiplier: 4,
            }
          : undefined,
      screenEmulation: {
        mobile: options?.device === "mobile",
        width: options?.device === "mobile" ? 375 : 1920,
        height: options?.device === "mobile" ? 667 : 1080,
        deviceScaleFactor: options?.device === "mobile" ? 2 : 1,
      },
    });

    if (!runnerResult) {
      throw new Error("Lighthouse returned no results");
    }

    const { lhr } = runnerResult;

    const scores: ScanResult["scores"] = {
      performance: lhr.categories.performance?.score || 0,
      accessibility: lhr.categories.accessibility?.score || 0,
      bestPractices: lhr.categories["best-practices"]?.score || 0,
      seo: lhr.categories.seo?.score || 0,
    };

    const metrics: ScanResult["metrics"] = {
      firstContentfulPaint:
        lhr.audits["first-contentful-paint"]?.numericValue || 0,
      largestContentfulPaint:
        lhr.audits["largest-contentful-paint"]?.numericValue || 0,
      totalBlockingTime: lhr.audits["total-blocking-time"]?.numericValue || 0,
      cumulativeLayoutShift:
        lhr.audits["cumulative-layout-shift"]?.numericValue || 0,
      speedIndex: lhr.audits["speed-index"]?.numericValue || 0,
    };

    const aiReadiness = {
      structuredData: lhr.audits["structured-data"]?.score === 1,
      semanticHtml: lhr.audits["heading-order"]?.score === 1,
      imageAltTags: lhr.audits["image-alt"]?.score || 0,
      headingStructure: lhr.audits["heading-order"]?.score === 1,
    };

    console.log(
      `[SCAN] Completed for ${url}. Performance: ${scores.performance * 100}/100`,
    );

    return {
      scanId,
      url,
      timestamp: Date.now(),
      scores,
      metrics,
      aiReadiness,
    };
  } finally {
    await chrome.kill();
  }
}
