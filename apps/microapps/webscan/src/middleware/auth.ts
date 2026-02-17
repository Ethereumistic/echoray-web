import { Elysia } from "elysia";

export const authMiddleware = new Elysia().derive(
  ({ bearer, set, request }) => {
    if (request.url.endsWith("/health")) {
      return {};
    }

    const apiKey = bearer || request.headers.get("x-api-key");
    const expectedKey = process.env.API_SECRET_KEY;

    if (!apiKey || apiKey !== expectedKey) {
      set.status = 401;
      throw new Error("Unauthorized: Invalid or missing API key");
    }

    return { authenticated: true };
  },
);
