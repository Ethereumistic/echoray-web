import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed initial data for the application
 * Run this once after deploying to set up subscription tiers and permissions
 */
export const seedData = mutation({
    args: {},
    handler: async (ctx) => {
        // 1. Seed Subscription Tiers
        const tiers = [
            // Commercial Tiers
            // User tier: maxOrganizations: 0 means free users cannot create organizations
            { name: "User", slug: "user", type: "commercial", priceEur: 0, isCustom: false, basePermissions: 3, maxMembers: 1, maxOrganizations: 0 },
            // Web tier and above: can create projects (bit 22 = 4194304)
            { name: "Web", slug: "web", type: "commercial", priceEur: 99, isCustom: false, basePermissions: 4194335, maxMembers: 5, maxOrganizations: 1 },
            { name: "App", slug: "app", type: "commercial", priceEur: 299, isCustom: false, basePermissions: 4194815, maxMembers: 20, maxOrganizations: 5 },
            { name: "CRM", slug: "crm", type: "commercial", priceEur: 0, isCustom: true, basePermissions: 4198399, maxOrganizations: 10 },

            // System Tiers (Internal)
            {
                name: "Staff Admin",
                slug: "staff_admin",
                type: "system",
                priceEur: 0,
                isCustom: true,
                basePermissions: Number.MAX_SAFE_INTEGER, // Everything!
                maxOrganizations: 100
            },
        ];

        // Clear existing tiers and permissions
        const existingTiers = await ctx.db.query("subscriptionTiers").collect();
        for (const t of existingTiers) await ctx.db.delete(t._id);

        const existingPerms = await ctx.db.query("permissions").collect();
        for (const p of existingPerms) await ctx.db.delete(p._id);

        for (const tier of tiers) {
            await ctx.db.insert("subscriptionTiers", tier as any);
        }

        // 2. Seed System Permissions
        const permissions = [
            { code: "profile.view", bitPosition: 0, name: "View Profile", category: "basic", isAddon: false, isDangerous: false },
            { code: "profile.edit", bitPosition: 1, name: "Edit Own Profile", category: "basic", isAddon: false, isDangerous: false },
            { code: "analytics.view", bitPosition: 2, name: "View Analytics", category: "analytics", minTier: "web", isAddon: false, isDangerous: false },
            { code: "export.csv", bitPosition: 3, name: "Export CSV", category: "export", minTier: "web", isAddon: false, isDangerous: false },
            { code: "integrations.basic", bitPosition: 4, name: "Basic Integrations", category: "integrations", minTier: "web", isAddon: false, isDangerous: false },
            { code: "analytics.advanced", bitPosition: 5, name: "Advanced Analytics", category: "analytics", minTier: "app", isAddon: false, isDangerous: false },
            { code: "api.access", bitPosition: 6, name: "API Access", category: "api", minTier: "app", isAddon: false, isDangerous: false },
            { code: "export.pdf", bitPosition: 7, name: "Export PDF", category: "export", minTier: "app", isAddon: false, isDangerous: false },
            { code: "webhooks.manage", bitPosition: 8, name: "Manage Webhooks", category: "api", minTier: "app", isAddon: false, isDangerous: false },
            { code: "crm.contacts", bitPosition: 9, name: "CRM Contacts", category: "crm", minTier: "crm", isAddon: false, isDangerous: false },
            { code: "crm.deals", bitPosition: 10, name: "CRM Deals", category: "crm", minTier: "crm", isAddon: false, isDangerous: false },
            { code: "crm.automation", bitPosition: 11, name: "CRM Automation", category: "crm", minTier: "crm", isAddon: false, isDangerous: false },
            { code: "org.settings", bitPosition: 12, name: "Manage Organization Settings", category: "admin", isAddon: false, isDangerous: false },
            { code: "members.invite", bitPosition: 13, name: "Invite Members", category: "admin", isAddon: false, isDangerous: false },
            { code: "members.remove", bitPosition: 14, name: "Remove Members", category: "admin", isAddon: false, isDangerous: false },
            { code: "roles.manage", bitPosition: 15, name: "Manage Roles", category: "admin", isAddon: false, isDangerous: false },
            { code: "billing.view", bitPosition: 16, name: "View Billing", category: "billing", isAddon: false, isDangerous: false },
            { code: "billing.manage", bitPosition: 17, name: "Manage Billing", category: "billing", isAddon: false, isDangerous: false },
            { code: "integrations.zapier", bitPosition: 18, name: "Zapier Integration", category: "integrations", minTier: "web", isAddon: true, isDangerous: false },
            { code: "integrations.slack", bitPosition: 19, name: "Slack Integration", category: "integrations", minTier: "web", isAddon: true, isDangerous: false },
            { code: "storage.extended", bitPosition: 20, name: "Extended Storage (100GB)", category: "storage", minTier: "web", isAddon: true, isDangerous: false },
            { code: "support.priority", bitPosition: 21, name: "Priority Support", category: "support", minTier: "web", isAddon: true, isDangerous: false },

            // Project permissions (Web tier and above)
            { code: "project.create", bitPosition: 22, name: "Create Projects", category: "projects", minTier: "web", isAddon: false, isDangerous: false },

            // System Admin Bits (Internal Staff Only)
            { code: "system.admin", bitPosition: 50, name: "Full System Access", category: "system", isAddon: false, isDangerous: true },
            { code: "system.support", bitPosition: 51, name: "Assume User Identity", category: "system", isAddon: false, isDangerous: true },
        ];


        for (const perm of permissions) {
            await ctx.db.insert("permissions", perm);
        }

        console.log("Database seeded successfully");
        return { message: "Seeded successfully", tiers: tiers.length, permissions: permissions.length };
    },
});

/**
 * Fixup: Migrate subscriptions from organizations to users and assign defaults
 * Run this after schema migration (v2)
 */
export const fixupUserSubscriptions = mutation({
    args: {},
    handler: async (ctx) => {
        const defaultTier = await ctx.db
            .query("subscriptionTiers")
            .withIndex("by_slug", (q) => q.eq("slug", "user"))
            .unique();

        if (!defaultTier) throw new Error("Seed tiers first");

        // 1. Move subscriptions from organizations to their owners
        const orgsWithSubs = await ctx.db.query("organizations").collect();
        let migratedCount = 0;

        for (const org of orgsWithSubs) {
            const anyOrg = org as any;

            // If any legacy fields exist, we need to process/cleanup
            if (anyOrg.subscriptionTierId || anyOrg.subscriptionStartedAt || anyOrg.subscriptionStatus) {

                // Only migrate if the owner doesn't have a sub yet and we have a tier to give them
                if (anyOrg.subscriptionTierId) {
                    const owner = await ctx.db.get(org.ownerId);
                    if (owner && !owner.subscriptionTierId) {
                        await ctx.db.patch(owner._id, {
                            subscriptionTierId: anyOrg.subscriptionTierId,
                            subscriptionStatus: anyOrg.subscriptionStatus || "active",
                            subscriptionStartedAt: anyOrg.subscriptionStartedAt || Date.now(),
                            subscriptionEndsAt: anyOrg.subscriptionEndsAt,
                        });
                        migratedCount++;
                    }
                }

                // UNCONDITIONALLY clear the legacy fields from the org document
                await ctx.db.patch(org._id, {
                    subscriptionTierId: undefined,
                    subscriptionStatus: undefined,
                    subscriptionStartedAt: undefined,
                    subscriptionEndsAt: undefined,
                } as any);
            }
        }

        // 2. Assign default "user" tier to all remaining users and CLEANUP free users
        const users = await ctx.db.query("users").collect();
        let updatedCount = 0;

        for (const user of users) {
            const tier = user.subscriptionTierId ? await ctx.db.get(user.subscriptionTierId) : null;

            // If they have no tier OR their tier ID points to a deleted tier, give them the default
            if (!user.subscriptionTierId || !tier) {
                await ctx.db.patch(user._id, {
                    subscriptionTierId: defaultTier._id,
                });
                updatedCount++;
            }
            // If they are on the 'user' tier, ensure they don't have status/dates
            else if (tier?.slug === "user") {
                if (user.subscriptionStatus || user.subscriptionStartedAt) {
                    await ctx.db.patch(user._id, {
                        subscriptionStatus: undefined,
                        subscriptionStartedAt: undefined,
                        subscriptionEndsAt: undefined,
                    });
                    updatedCount++;
                }
            }
        }

        return { migratedFromOrgs: migratedCount, usersCleanedUp: updatedCount };
    },
});

/**
 * Assign Staff Admin tier to a user by email
 * Run this to restore admin access after re-seeding
 */
export const assignStaffAdmin = mutation({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        // Find user by email
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (!user) throw new Error(`User not found with email: ${email}`);

        // Find Staff Admin tier
        const staffAdminTier = await ctx.db
            .query("subscriptionTiers")
            .withIndex("by_slug", (q) => q.eq("slug", "staff_admin"))
            .first();

        if (!staffAdminTier) throw new Error("Staff Admin tier not found. Run seedData first.");

        // Update user's tier
        await ctx.db.patch(user._id, {
            subscriptionTierId: staffAdminTier._id,
        });

        return {
            success: true,
            userId: user._id,
            tierName: staffAdminTier.name,
            message: `User ${email} is now a Staff Admin`
        };
    },
});

