/**
 * Convex Auth configuration
 * 
 * This configures the auth provider domain for token verification.
 * The domain is automatically set from CONVEX_SITE_URL environment variable.
 */
export default {
    providers: [
        {
            domain: process.env.CONVEX_SITE_URL,
            applicationID: "convex",
        },
    ],
};
