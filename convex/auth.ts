import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

/**
 * Convex Auth configuration for Echoray
 * 
 * Currently configured with:
 * - Email/Password authentication
 * 
 * Future additions can include:
 * - OAuth providers (Google, GitHub, etc.)
 * - Magic links / OTP
 */

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [Password],
    callbacks: {
        async afterUserCreatedOrUpdated(ctx, args) {
            // Check if this is a newly created user (no existingUser) 
            // or if they somehow missed a subscription tier
            const user = await ctx.db.get(args.userId);

            if (user && !user.subscriptionTierId) {
                const defaultTier = await ctx.db
                    .query("subscriptionTiers")
                    .filter((q) => q.eq(q.field("slug"), "user"))
                    .first();

                if (defaultTier) {
                    await ctx.db.patch(args.userId, {
                        subscriptionTierId: defaultTier._id,
                        // Not setting status or start date for the free tier
                    });
                }
            }
        },
    },
});
