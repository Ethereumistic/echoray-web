import { Elysia, t } from "elysia";
import { addScanToQueue } from "../queue";
import type { ScanRequest } from "../types/scan";

export const scanRoute = new Elysia().post(
  "/scan",
  async ({ body, set }) => {
    const { url, userId, scanId, options } = body as ScanRequest;

    try {
      new URL(url);
    } catch {
      set.status = 400;
      return { error: "Invalid URL format" };
    }

    const job = await addScanToQueue({
      url,
      userId,
      scanId,
      options: options || {
        categories: ["performance", "seo"],
        device: "mobile",
      },
    });

    return {
      message: "Scan queued successfully",
      jobId: job.id,
      scanId,
      estimatedWait: "30-60 seconds",
    };
  },
  {
    body: t.Object({
      url: t.String(),
      userId: t.String(),
      scanId: t.String(),
      options: t.Optional(
        t.Object({
          categories: t.Optional(t.Array(t.String())),
          device: t.Optional(
            t.Union([t.Literal("mobile"), t.Literal("desktop")]),
          ),
        }),
      ),
    }),
  },
);
