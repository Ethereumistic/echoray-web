/**
 * Custom Resend OTP Email Provider for Convex Auth
 * 
 * Provides email sending for:
 * - Password reset OTP codes
 * - Email verification OTP codes
 * 
 * Uses the official Resend SDK and built-in crypto for OTP generation.
 */
import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";

const recentSends = new Map<string, number>();

/**
 * Generate a secure 6-digit OTP code using native crypto
 */
function generateOTPCode(): string {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    // Generate number between 100000 and 999999 (6 digits)
    const code = (100000 + (array[0] % 900000)).toString();
    return code;
}

/**
 * Resend OTP provider for Password Reset flow
 * Used with Password provider's `reset` option
 */
export const ResendOTPPasswordReset = Resend({
    id: "resend-otp",
    apiKey: process.env.AUTH_RESEND_KEY,
    maxAge: 10 * 60, // 10 minutes

    async generateVerificationToken() {
        return generateOTPCode();
    },

    async sendVerificationRequest({ identifier: email, provider, token }) {
        const resend = new ResendAPI(provider.apiKey);

        const { error } = await resend.emails.send({
            from: "Echoray <core@mail.echoray.io>",
            to: [email],
            subject: "Reset your Echoray password",
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1a1b1e !important; color: #f0f0f0 !important;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #1a1b1e;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px;">
                    <tr>
                        <td align="center" style="padding-bottom: 32px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td>
                                        <img src="https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/logo/192x192.png" width="40" height="40" alt="Echoray" style="display: block; border-radius: 8px;" />
                                    </td>
                                    <td style="padding-left: 12px;">
                                        <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 600; margin: 0; color: #f0f0f0;">Echoray</h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #222327; border-radius: 12px; padding: 32px; border: 1px solid #33353a;">
                            <h2 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 20px; font-weight: 600; margin: 0 0 16px 0; color: #f0f0f0;">Reset your password</h2>
                            <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #f0f0f0; margin: 0 0 24px 0; opacity: 0.8;">
                                You requested to reset your password. Use the code below to complete the process.
                            </p>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center" style="background-color: #1a1b1e; border-radius: 8px; padding: 20px; border: 1px solid #33353a;">
                                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #0066ff; font-family: monospace;">${token}</span>
                                    </td>
                                </tr>
                            </table>
                            <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #f0f0f0; margin: 24px 0 0 0; opacity: 0.5;">
                                This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-top: 32px;">
                            <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #f0f0f0; margin: 0; opacity: 0.3;">
                                © ${new Date().getFullYear()} Echoray. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
            text: `Your Echoray password reset code is: ${token}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
        });

        if (error) {
            console.error("[Resend] Failed to send password reset email:", error);
            throw new Error("Could not send password reset email");
        }
    },
});

/**
 * Resend OTP provider for Email Verification flow
 * Used with Password provider's `verify` option
 * 
 * This email serves as BOTH welcome + verification (anti-bot protection)
 */
export const ResendOTPVerification = Resend({
    id: "resend-otp-verify",
    apiKey: process.env.AUTH_RESEND_KEY,
    maxAge: 24 * 60 * 60, // 24 hours

    async generateVerificationToken() {
        return generateOTPCode();
    },

    async sendVerificationRequest({ identifier: email, provider, token }) {
        const now = Date.now();
        const lastSend = recentSends.get(email) || 0;

        // Don't send a new email if one was sent in the last 60 seconds
        if (now - lastSend < 60000) {
            console.log(`[Resend] Skipping email to ${email} - sent recently.`);
            return;
        }
        recentSends.set(email, now);

        const resend = new ResendAPI(provider.apiKey);

        const { error } = await resend.emails.send({
            from: "Echoray <core@mail.echoray.io>",
            to: [email],
            subject: "Welcome to Echoray.io! Verify your email 🚀",
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1a1b1e !important; color: #f0f0f0 !important;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #1a1b1e;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px;">
                    <tr>
                        <td align="center" style="padding-bottom: 32px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td>
                                        <img src="https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/logo/192x192.png" width="48" height="48" alt="Echoray" style="display: block; border-radius: 10px;" />
                                    </td>
                                    <td style="padding-left: 15px;">
                                        <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 28px; font-weight: 600; margin: 0; color: #f0f0f0;">Echoray</h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #222327; border-radius: 12px; padding: 40px; border: 1px solid #33353a;">
                            <h2 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 600; margin: 0 0 12px 0; color: #f0f0f0;">
                                Welcome aboard! 👋
                            </h2>
                            <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.7; color: #f0f0f0; margin: 0 0 28px 0; opacity: 0.8;">
                                Thanks for signing up for Echoray. To get started, please verify your email address by entering the code below.
                            </p>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center" style="background-color: #1a1b1e; border-radius: 10px; padding: 24px; border: 1px solid #33353a;">
                                        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #f0f0f0; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px; opacity: 0.6;">Your verification code</p>
                                        <span style="font-size: 36px; font-weight: 700; letter-spacing: 6px; color: #0066ff; font-family: 'SF Mono', Monaco, monospace;">${token}</span>
                                    </td>
                                </tr>
                            </table>
                            <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #f0f0f0; margin: 28px 0 20px 0; opacity: 0.7;">
                                Once verified, you'll have access to:
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px 0;">
                                <tr><td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 2; color: #f0f0f0; padding-left: 16px; opacity: 0.7;">• Create and manage projects with custom fields</td></tr>
                                <tr><td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 2; color: #f0f0f0; padding-left: 16px; opacity: 0.7;">• Collaborate with your team in organizations</td></tr>
                                <tr><td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 2; color: #f0f0f0; padding-left: 16px; opacity: 0.7;">• Access powerful web services and microapps</td></tr>
                            </table>
                            <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #f0f0f0; margin: 0; padding-top: 16px; border-top: 1px solid #33353a; opacity: 0.5;">
                                This code expires in 24 hours. If you didn't sign up for Echoray, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-top: 32px;">
                            <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #f0f0f0; margin: 0; opacity: 0.3;">
                                © ${new Date().getFullYear()} Echoray. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
            text: `Welcome to Echoray!\n\nThanks for signing up. To verify your email and complete your registration, use this code:\n\n${token}\n\nThis code expires in 24 hours.\n\nIf you didn't sign up for Echoray, you can safely ignore this email.`,
        });

        if (error) {
            console.error("[Resend] Failed to send verification email:", JSON.stringify(error, null, 2));
            throw new Error(`Could not send verification email: ${error.message || JSON.stringify(error)}`);
        }
    },
});
