import { Elysia } from "elysia";

export const healthRoute = new Elysia().get("/health", () => ({
  status: "healthy",
  service: "webscan",
  timestamp: Date.now(),
  uptime: process.uptime(),
}));
