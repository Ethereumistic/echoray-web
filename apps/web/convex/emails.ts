/**
 * Email Module using @convex-dev/resend Component
 * 
 * This provides reliable queued email delivery for:
 * - Welcome emails after signup
 * - Any other transactional emails
 * 
 * Uses the Resend component for:
 * - Automatic batching
 * - Retry on failure
 * - Idempotency (no duplicate sends)
 */
import { components } from "./_generated/api";
import { Resend } from "@convex-dev/resend";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Initialize the Resend component
// Note: testMode defaults to true - set to false for production
export const resend = new Resend(components.resend, {
    testMode: process.env.NODE_ENV !== "production",
});

/**
 * Send a welcome email to a newly registered user
 * Called from afterUserCreatedOrUpdated callback or as a scheduled job
 */
export const sendWelcomeEmail = internalMutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
    },
    handler: async (ctx, { email, name }) => {
        const displayName = name || email.split("@")[0];

        await resend.sendEmail(ctx, {
            from: "Echoray <core@mail.echoray.io>",
            to: email,
            subject: "Welcome to Echoray! 🚀",
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px;">
    <div style="max-width: 560px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 28px; font-weight: 600; margin: 0; color: #ffffff;">Echoray</h1>
        </div>
        
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 40px; border: 1px solid #2a2a4a;">
            <h2 style="font-size: 24px; font-weight: 600; margin: 0 0 20px 0; color: #ffffff;">
                Welcome, ${displayName}! 👋
            </h2>
            
            <p style="font-size: 16px; line-height: 1.7; color: #c0c0c0; margin: 0 0 24px 0;">
                Thank you for joining Echoray! We're excited to have you on board.
            </p>
            
            <p style="font-size: 14px; line-height: 1.6; color: #a0a0a0; margin: 0 0 24px 0;">
                With Echoray, you can:
            </p>
            
            <ul style="font-size: 14px; line-height: 1.8; color: #a0a0a0; margin: 0 0 32px 0; padding-left: 20px;">
                <li>Create and manage projects with custom fields</li>
                <li>Collaborate with your team in organizations</li>
                <li>Access powerful web services and microapps</li>
            </ul>
            
            <div style="text-align: center; margin-bottom: 32px;">
                <a href="https://echoray.io/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                    Go to Dashboard →
                </a>
            </div>
            
            <p style="font-size: 14px; color: #666666; margin: 0; text-align: center;">
                Need help? Just reply to this email—we're here to help!
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 32px;">
            <p style="font-size: 12px; color: #444444; margin: 0 0 8px 0;">
                © ${new Date().getFullYear()} Echoray. All rights reserved.
            </p>
            <p style="font-size: 12px; color: #333333; margin: 0;">
                You received this email because you signed up for Echoray.
            </p>
        </div>
    </div>
</body>
</html>
            `,
        });

        return { success: true };
    },
});
