import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ResendOTPPasswordReset, ResendOTPVerification } from "./ResendOTP";

/**
 * Convex Auth configuration for Echoray
 * 
 * Currently configured with:
 * - Email/Password authentication with password reset via Resend
 * - Email verification required on signup (serves as welcome + anti-bot protection)
 * 
 * Future additions can include:
 * - OAuth providers (Google, GitHub, etc.)
 * - Magic links
 */

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [
        Password({
            reset: ResendOTPPasswordReset,
            verify: ResendOTPVerification,
        }),
    ],
    callbacks: {
        async afterUserCreatedOrUpdated(ctx, args) {
            const user = await ctx.db.get(args.userId);
            if (!user) return;

            // Assign default subscription tier if missing
            if (!user.subscriptionTierId) {
                const defaultTier = await ctx.db
                    .query("subscriptionTiers")
                    .filter((q) => q.eq(q.field("slug"), "user"))
                    .first();

                if (defaultTier) {
                    await ctx.db.patch(args.userId, {
                        subscriptionTierId: defaultTier._id,
                    });
                }
            }

            // Note: Welcome email is now handled by the verification email
            // which sends on signup and serves both purposes
        },
    },
});
