import { auth } from "./auth";
import { httpRouter } from "convex/server";

/**
 * HTTP routes for Convex Auth
 * 
 * This handles the auth API endpoints needed for:
 * - Sign in / Sign up
 * - Sign out
 * - Session management
 * - OAuth callbacks (when added)
 */

const http = httpRouter();

// Add auth routes under /api/auth/*
auth.addHttpRoutes(http);

export default http;
