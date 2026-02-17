import { convexAuthNextjsMiddleware, createRouteMatcher } from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Define which routes are public (marketing) and don't require authentication.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/services",
  "/services/(.*)",
  "/about",
  "/contact",
  "/pricing",
  "/blog",
  "/blog/(.*)",
  "/start-project",
  "/work",
  "/5",
]);

/**
 * Auth-related routes that should be accessible without authentication.
 */
const isAuthRoute = createRouteMatcher([
  "/auth/login",
  "/auth/sign-up",
  "/auth/sign-up-success",
  "/auth/forgot-password",
  "/auth/update-password",
  "/auth/error",
  "/auth/confirm",
]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const { pathname, search, origin } = request.nextUrl;

  // Allow public routes and auth routes without authentication
  if (isPublicRoute(request) || isAuthRoute(request)) {
    return;
  }

  // For protected routes (dashboard, etc.), check authentication
  const isAuthenticated = await convexAuth.isAuthenticated();

  if (!isAuthenticated) {
    // Build redirect URL using URL constructor to avoid encoding issues
    const loginUrl = new URL("/auth/login", origin);
    // Capture full path for redirect after login
    const fullPath = pathname + search;
    loginUrl.searchParams.set("redirectTo", fullPath);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

