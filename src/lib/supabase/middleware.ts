import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Define which routes are public (marketing) and don't require authentication.
 * All other routes will require authentication.
 */
const PUBLIC_ROUTES = [
    '/',
    '/services',
    '/about',
    '/contact',
    '/pricing',
    '/blog',
]

/**
 * Auth-related routes that should be accessible without authentication.
 */
const AUTH_ROUTES = [
    '/auth/login',
    '/auth/sign-up',
    '/auth/sign-up-success',
    '/auth/forgot-password',
    '/auth/update-password',
    '/auth/error',
    '/auth/confirm',
]

/**
 * Check if the given pathname is a public route.
 */
function isPublicRoute(pathname: string): boolean {
    // Check exact matches for public routes
    if (PUBLIC_ROUTES.includes(pathname)) {
        return true
    }

    // Check if it's an auth route
    if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
        return true
    }

    // Check for public route prefixes (e.g., /blog/[slug])
    const publicPrefixes = ['/blog/', '/services/']
    if (publicPrefixes.some(prefix => pathname.startsWith(prefix))) {
        return true
    }

    return false
}

/**
 * Updates the session for authenticated requests.
 * This function should be called in middleware.ts to refresh the user's session
 * and handle authentication redirects.
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Do not run code between createServerClient and
    // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getClaims() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const { data } = await supabase.auth.getClaims()
    const user = data?.claims

    const pathname = request.nextUrl.pathname

    // If it's a public route, allow access regardless of auth status
    if (isPublicRoute(pathname)) {
        return supabaseResponse
    }

    // For protected routes (dashboard), redirect to login if not authenticated
    if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // If you're creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse
}
