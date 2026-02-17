import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { bearer } from "@elysiajs/bearer";
import { scanRoute } from "./routes/scan";
import { healthRoute } from "./routes/health";
import { authMiddleware } from "./middleware/auth";
import { initializeQueue } from "./queue";

const PORT = process.env.PORT || 3001;

await initializeQueue();

const app = new Elysia()
  .use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
      credentials: true,
    }),
  )
  .use(bearer())
  .use(authMiddleware)
  .use(healthRoute)
  .use(scanRoute)
  .onError(({ code, error, set }) => {
    console.error(`[ERROR] ${code}:`, error);

    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "Validation failed", details: error.message };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Route not found" };
    }

    set.status = 500;
    return { error: "Internal server error" };
  })
  .listen(PORT);

console.log(`🚀 WebScan microservice running at http://localhost:${PORT}`);
