import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";

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
  const pathname = request.nextUrl.pathname;

  // Allow public routes and auth routes without authentication
  if (isPublicRoute(request) || isAuthRoute(request)) {
    return;
  }

  // For protected routes (dashboard, etc.), check authentication
  const isAuthenticated = await convexAuth.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login with the intended destination
    const searchParams = new URLSearchParams();
    searchParams.set("redirectTo", pathname);
    return nextjsMiddlewareRedirect(request, `/auth/login?${searchParams.toString()}`);
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
