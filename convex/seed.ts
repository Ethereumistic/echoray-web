import { mutation } from "./_generated/server";

/**
 * Seed initial data for the application
 * Run this once after deploying to set up subscription tiers and permissions
 */
export const seedData = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if already seeded
        const existingTier = await ctx.db
            .query("subscriptionTiers")
            .first();

        if (existingTier) {
            console.log("Database already seeded");
            return { message: "Already seeded" };
        }

        // 1. Seed Subscription Tiers
        const tiers = [
            { name: "User", slug: "user", priceEur: 0, isCustom: false, basePermissions: 0, maxMembers: 1, maxOrganizations: 1 },
            { name: "CRM", slug: "crm", priceEur: 0, isCustom: true, basePermissions: 7, maxOrganizations: 1 }, // Changed from snippet
            { name: "App", slug: "app", priceEur: 299, isCustom: false, basePermissions: 3, maxMembers: 20, maxOrganizations: 1 },
            { name: "Web", slug: "web", priceEur: 99, isCustom: false, basePermissions: 1, maxMembers: 5, maxOrganizations: 1 },
        ];

        for (const tier of tiers) {
            await ctx.db.insert("subscriptionTiers", tier);
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
        ];


        for (const perm of permissions) {
            await ctx.db.insert("permissions", perm);
        }

        console.log("Database seeded successfully");
        return { message: "Seeded successfully", tiers: tiers.length, permissions: permissions.length };
    },
});
