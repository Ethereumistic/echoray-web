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
        // basePermissions = tier-level permissions (global + personal)
        // orgFeatures = which o.* features this tier unlocks for orgs they own
        const tiers = [
            // User (Free): Basic profile only
            {
                name: "User",
                slug: "user",
                type: "commercial",
                priceEur: 0,
                isCustom: false,
                basePermissions: 0b11, // bits 0-1: profile.view, profile.edit
                orgFeatures: 0, // Cannot own orgs
                maxMembers: 1,
                maxOrganizations: 0
            },
            // Web (€99): Org creation, personal/org projects, basic features
            {
                name: "Web",
                slug: "web",
                type: "commercial",
                priceEur: 99,
                isCustom: false,
                basePermissions: 0b1111, // bits 0-3: profile.*, org.create, p.project.create
                orgFeatures: 0b111111111111 * (2 ** 20), // bits 20-31: all o.* features
                maxMembers: 5,
                maxOrganizations: 1
            },
            // App (€299): Advanced analytics, API, more orgs
            {
                name: "App",
                slug: "app",
                type: "commercial",
                priceEur: 299,
                isCustom: false,
                basePermissions: 0b1111, // bits 0-3
                orgFeatures: 0b111111111111 * (2 ** 20), // bits 20-31
                maxMembers: 20,
                maxOrganizations: 5
            },
            // CRM: All CRM features + apps
            {
                name: "CRM",
                slug: "crm",
                type: "commercial",
                priceEur: 0,
                isCustom: true,
                basePermissions: 0b1111, // bits 0-3
                orgFeatures: 0b1111111111111111111111 * (2 ** 20), // bits 20-41
                maxOrganizations: 10
            },
            // Staff Admin: Everything
            {
                name: "Staff Admin",
                slug: "staff_admin",
                type: "system",
                priceEur: 0,
                isCustom: true,
                basePermissions: Number.MAX_SAFE_INTEGER,
                orgFeatures: Number.MAX_SAFE_INTEGER,
                maxOrganizations: 100
            },
        ];

        // === MIGRATION: Save user tier assignments before deleting tiers ===
        const users = await ctx.db.query("users").collect();
        const userTierMap: Map<string, string> = new Map(); // userId -> tierSlug

        const existingTiers = await ctx.db.query("subscriptionTiers").collect();
        const tierIdToSlug: Map<string, string> = new Map();
        for (const tier of existingTiers) {
            tierIdToSlug.set(tier._id, tier.slug);
        }

        // Save which tier slug each user was on
        for (const user of users) {
            if (user.subscriptionTierId) {
                const tierSlug = tierIdToSlug.get(user.subscriptionTierId);
                if (tierSlug) {
                    userTierMap.set(user._id, tierSlug);
                }
            }
        }

        // Clear existing tiers and permissions
        for (const t of existingTiers) await ctx.db.delete(t._id);

        const existingPerms = await ctx.db.query("permissions").collect();
        for (const p of existingPerms) await ctx.db.delete(p._id);

        // Clear projects and related data
        const existingViews = await ctx.db.query("projectViews").collect();
        for (const v of existingViews) await ctx.db.delete(v._id);

        const existingRecords = await ctx.db.query("projectRecords").collect();
        for (const r of existingRecords) await ctx.db.delete(r._id);

        const existingFields = await ctx.db.query("projectFields").collect();
        for (const f of existingFields) await ctx.db.delete(f._id);

        const existingProjects = await ctx.db.query("projects").collect();
        for (const p of existingProjects) await ctx.db.delete(p._id);

        // Insert new tiers and build slug -> newId map
        const tierSlugToNewId: Map<string, string> = new Map();
        for (const tier of tiers) {
            const newId = await ctx.db.insert("subscriptionTiers", tier as any);
            tierSlugToNewId.set(tier.slug, newId);
        }

        // === MIGRATION: Reassign all users to their correct tier ===
        const defaultTierId = tierSlugToNewId.get("user")!;
        let usersUpdated = 0;

        for (const user of users) {
            const previousSlug = userTierMap.get(user._id);
            const newTierId = previousSlug
                ? tierSlugToNewId.get(previousSlug) || defaultTierId
                : defaultTierId;

            await ctx.db.patch(user._id, { subscriptionTierId: newTierId as any });
            usersUpdated++;
        }

        console.log(`Migrated ${usersUpdated} users to new tier IDs`);

        // 2. Seed Permissions with Scoped Naming
        const permissions = [
            // === GLOBAL/TIER PERMISSIONS (Bits 0-19) ===
            { code: "profile.view", bitPosition: 0, name: "View Profiles", category: "global", isAddon: false, isDangerous: false },
            { code: "profile.edit", bitPosition: 1, name: "Edit Own Profile", category: "global", isAddon: false, isDangerous: false },
            { code: "org.create", bitPosition: 2, name: "Create Organizations", category: "global", minTier: "web", isAddon: false, isDangerous: false },
            { code: "p.project.create", bitPosition: 3, name: "Create Personal Projects", category: "personal", minTier: "web", isAddon: false, isDangerous: false },

            // === ORGANIZATION ROLE PERMISSIONS (Bits 20-39) ===
            { code: "o.project.view", bitPosition: 20, name: "View Org Projects", category: "org", isAddon: false, isDangerous: false },
            { code: "o.project.create", bitPosition: 21, name: "Create Org Projects", category: "org", isAddon: false, isDangerous: false },
            { code: "o.project.edit", bitPosition: 22, name: "Edit Org Projects", category: "org", isAddon: false, isDangerous: false },
            { code: "o.project.delete", bitPosition: 23, name: "Delete Org Projects", category: "org", isAddon: false, isDangerous: false },
            { code: "o.member.view", bitPosition: 24, name: "View Members", category: "org", isAddon: false, isDangerous: false },
            { code: "o.member.invite", bitPosition: 25, name: "Invite as Member", category: "org", isAddon: false, isDangerous: false },
            { code: "o.editor.invite", bitPosition: 26, name: "Invite as Editor", category: "org", isAddon: false, isDangerous: false },
            { code: "o.admin.invite", bitPosition: 27, name: "Invite as Admin", category: "org", isAddon: false, isDangerous: true },
            { code: "o.member.remove", bitPosition: 28, name: "Remove Members", category: "org", isAddon: false, isDangerous: false },
            { code: "o.admin.remove", bitPosition: 29, name: "Remove Admins", category: "org", isAddon: false, isDangerous: true },
            { code: "o.role.manage", bitPosition: 30, name: "Manage Roles", category: "org", isAddon: false, isDangerous: true },
            { code: "o.settings.edit", bitPosition: 31, name: "Edit Org Settings", category: "org", isAddon: false, isDangerous: true },

            // === APP PERMISSIONS (Bits 40-49) ===
            { code: "app.invoice", bitPosition: 40, name: "Invoice Generator", category: "app", minTier: "web", isAddon: true, isDangerous: false },
            { code: "app.qr", bitPosition: 41, name: "QR Generator", category: "app", minTier: "web", isAddon: true, isDangerous: false },
            { code: "app.crosspost", bitPosition: 42, name: "Cross-poster", category: "app", minTier: "app", isAddon: true, isDangerous: false },

            // === SYSTEM PERMISSIONS (Bits 50+) ===
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

/**
 * Fixup: Repair roles for all organizations after bitwise logic update
 */
export const fixupRoles = mutation({
    args: {},
    handler: async (ctx) => {
        const orgs = await ctx.db.query("organizations").collect();
        let rolesFixed = 0;

        // Helper to build bitmask correctly (copied from organizations.ts)
        const buildMask = (bits: number[]) => {
            let mask = 0n;
            for (const bit of bits) mask |= (1n << BigInt(bit));
            return Number(mask);
        };

        for (const org of orgs) {
            const roles = await ctx.db
                .query("roles")
                .withIndex("by_organizationId", (q) => q.eq("organizationId", org._id))
                .collect();

            for (const role of roles) {
                let newPermissions = role.permissions;

                if (role.isSystemRole) {
                    if (role.systemRoleType === "admin") {
                        // Admins: Projects, Member View/Invite/Remove, Editor Invite. 
                        // NO Role Manage, NO Settings Edit, NO Admin Invite, NO Admin Remove.
                        newPermissions = buildMask([20, 21, 22, 23, 24, 25, 26, 28]);
                    } else if (role.systemRoleType === "moderator") {
                        // Editors: Projects (View/Create/Edit), Member View/Invite
                        newPermissions = buildMask([20, 21, 22, 24, 25]);
                    } else if (role.systemRoleType === "member") {
                        // Members: Project View, Member View
                        newPermissions = buildMask([20, 24]);
                    }
                }

                if (newPermissions !== role.permissions) {
                    await ctx.db.patch(role._id, { permissions: newPermissions });
                    rolesFixed++;
                }
            }
        }

        return { success: true, rolesFixed };
    },
});

/**
 * Cleanup: Remove all 'left' membership records
 * Use this to fix duplicate membership issues from the old status-based approach
 */
export const cleanupLeftMemberships = mutation({
    args: {},
    handler: async (ctx) => {
        // Find all memberships with "left" status
        const leftMemberships = await ctx.db
            .query("organizationMembers")
            .filter((q) => q.eq(q.field("status"), "left"))
            .collect();

        let deletedCount = 0;

        for (const membership of leftMemberships) {
            // Delete member roles
            const memberRoles = await ctx.db
                .query("memberRoles")
                .withIndex("by_memberId", (q) => q.eq("memberId", membership._id))
                .collect();
            for (const mr of memberRoles) {
                await ctx.db.delete(mr._id);
            }

            // Delete permission overrides
            const overrides = await ctx.db
                .query("memberPermissionOverrides")
                .withIndex("by_memberId", (q) => q.eq("memberId", membership._id))
                .collect();
            for (const override of overrides) {
                await ctx.db.delete(override._id);
            }

            // Delete the membership
            await ctx.db.delete(membership._id);
            deletedCount++;
        }

        return {
            success: true,
            deletedCount,
            message: `Cleaned up ${deletedCount} stale membership record(s)`
        };
    },
});

/**
 * Assign a user to a specific subscription tier by email and tier slug
 * Use after seedData to restore user tier assignments
 */
export const assignUserTier = mutation({
    args: {
        email: v.string(),
        tierSlug: v.string(), // 'user', 'web', 'app', 'crm', 'staff_admin'
    },
    handler: async (ctx, { email, tierSlug }) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();

        if (!user) throw new Error(`User not found: ${email}`);

        const tier = await ctx.db
            .query("subscriptionTiers")
            .withIndex("by_slug", (q) => q.eq("slug", tierSlug))
            .unique();

        if (!tier) throw new Error(`Tier not found: ${tierSlug}`);

        await ctx.db.patch(user._id, {
            subscriptionTierId: tier._id,
        });

        return {
            success: true,
            message: `User ${email} is now on tier: ${tier.name}`,
            tier: {
                name: tier.name,
                basePermissions: tier.basePermissions,
                orgFeatures: tier.orgFeatures,
            }
        };
    },
});
