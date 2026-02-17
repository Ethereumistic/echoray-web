import { Queue, Worker, RedisConnection } from "bullmq";
import { runLighthouseScan } from "./scanner";
import { saveResultToConvex } from "./utils/convex-client";
import type { ScanRequest } from "./types/scan";

const connectionOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
};

export const scanQueue = new Queue("webscan", {
  connection: connectionOptions,
});

export async function addScanToQueue(request: ScanRequest) {
  return await scanQueue.add("lighthouse-scan", request, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  });
}

export async function initializeQueue() {
  const worker = new Worker(
    "webscan",
    async (job) => {
      console.log(`[WORKER] Processing job ${job.id}`);

      const scanRequest = job.data as ScanRequest;

      const result = await runLighthouseScan(scanRequest);

      await saveResultToConvex(result, scanRequest.userId);

      console.log(`[WORKER] Job ${job.id} completed successfully`);

      return result;
    },
    {
      connection: connectionOptions,
      concurrency: 2,
      limiter: {
        max: 10,
        duration: 60000,
      },
    },
  );

  worker.on("completed", (job) => {
    console.log(`[QUEUE] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[QUEUE] Job ${job?.id} failed:`, err);
  });

  console.log("✅ BullMQ worker initialized");
}
