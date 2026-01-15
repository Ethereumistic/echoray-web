import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * Organization-related Convex functions
 * Handles CRUD operations for organizations
 */

/**
 * Get all organizations the current user is a member of
 */
export const listMyOrganizations = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        // Get all memberships for this user
        const memberships = await ctx.db
            .query("organizationMembers")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();

        // Get the organizations with enriched tier info from owner
        const organizations = await Promise.all(
            memberships.map(async (membership) => {
                const org = await ctx.db.get(membership.organizationId);
                if (!org) return null;

                const owner = await ctx.db.get(org.ownerId);
                const tier = owner?.subscriptionTierId ? await ctx.db.get(owner.subscriptionTierId) : null;

                return {
                    ...org,
                    subscriptionTier: tier,
                };
            })
        );

        return organizations.filter(Boolean);
    },
});

/**
 * Get a single organization by ID
 */
export const getOrganization = query({
    args: { id: v.id("organizations") },
    handler: async (ctx, { id }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check if user is a member
        const membership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_org_user", (q) =>
                q.eq("organizationId", id).eq("userId", userId)
            )
            .first();

        if (!membership || membership.status !== "active") {
            throw new Error("Not a member of this organization");
        }

        const org = await ctx.db.get(id);
        if (!org) return null;

        const owner = await ctx.db.get(org.ownerId);
        const tier = owner?.subscriptionTierId ? await ctx.db.get(owner.subscriptionTierId) : null;

        return {
            ...org,
            subscriptionTier: tier,
        };
    },
});

/**
 * Get an organization by slug
 */
export const getOrganizationBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, { slug }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;

        const org = await ctx.db
            .query("organizations")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .first();

        if (!org) return null;

        // Check if user is a member
        const membership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_org_user", (q) =>
                q.eq("organizationId", org._id).eq("userId", userId)
            )
            .first();

        if (!membership || membership.status !== "active") {
            return null;
        }

        const owner = await ctx.db.get(org.ownerId);
        const tier = owner?.subscriptionTierId ? await ctx.db.get(owner.subscriptionTierId) : null;

        return {
            ...org,
            subscriptionTier: tier,
        };
    },
});

/**
 * Create a new organization
 */
export const createOrganization = mutation({
    args: {
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check if slug is already taken
        const existingOrg = await ctx.db
            .query("organizations")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (existingOrg) {
            throw new Error("Organization slug already exists");
        }

        // 1. Get user's subscription tier
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        let tierId = user.subscriptionTierId;
        if (!tierId) {
            const defaultTier = await ctx.db
                .query("subscriptionTiers")
                .withIndex("by_slug", (q) => q.eq("slug", "user"))
                .unique();
            if (!defaultTier) throw new Error("Default tier not found. Run seed first.");
            tierId = defaultTier._id;
        }

        const tier = await ctx.db.get(tierId);
        if (!tier) throw new Error("Subscription tier not found");

        // 2. Check organization limits
        const ownedOrgs = await ctx.db
            .query("organizations")
            .withIndex("by_ownerId", (q) => q.eq("ownerId", userId))
            .collect();

        if (ownedOrgs.length >= tier.maxOrganizations) {
            throw new Error(`Your ${tier.name} plan only allows ${tier.maxOrganizations} organization(s). Please upgrade to create more.`);
        }

        // 3. Create the organization (now without its own tier ID)
        const orgId = await ctx.db.insert("organizations", {
            name: args.name,
            slug: args.slug,
            description: args.description,
            ownerId: userId,
            customPermissions: 0,
        });

        // Create system roles for the organization
        await createSystemRoles(ctx, orgId);

        // Add the creator as an owner member
        const memberId = await ctx.db.insert("organizationMembers", {
            organizationId: orgId,
            userId,
            status: "active",
            invitedAt: Date.now(),
            joinedAt: Date.now(),
            computedPermissions: 0,
        });

        // Get the owner role
        const ownerRole = await ctx.db
            .query("roles")
            .withIndex("by_org_systemRole", (q) =>
                q.eq("organizationId", orgId).eq("isSystemRole", true)
            )
            .filter((q) => q.eq(q.field("systemRoleType"), "owner"))
            .first();

        if (ownerRole) {
            await ctx.db.insert("memberRoles", {
                memberId,
                roleId: ownerRole._id,
                assignedAt: Date.now(),
            });
        }

        return orgId;
    },
});

/**
 * Update an organization's settings
 */
export const updateOrganization = mutation({
    args: {
        id: v.id("organizations"),
        name: v.optional(v.string()),
        slug: v.optional(v.string()),
        description: v.optional(v.string()),
        logoUrl: v.optional(v.string()),
        website: v.optional(v.string()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const org = await ctx.db.get(id);
        if (!org) throw new Error("Organization not found");

        // Check if user is owner or has org.settings permission
        if (org.ownerId !== userId) {
            // TODO: Check permissions
            throw new Error("Only the owner can update organization settings");
        }

        // If slug is being changed, check it's not taken
        if (updates.slug && updates.slug !== org.slug) {
            const existingOrg = await ctx.db
                .query("organizations")
                .withIndex("by_slug", (q) => q.eq("slug", updates.slug!))
                .first();

            if (existingOrg) {
                throw new Error("Organization slug already exists");
            }
        }

        await ctx.db.patch(id, updates);
        return { success: true };
    },
});

/**
 * Delete an organization and all its associated data (Cascade Delete)
 */
export const deleteOrganization = mutation({
    args: { id: v.id("organizations") },
    handler: async (ctx, { id }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const org = await ctx.db.get(id);
        if (!org) throw new Error("Organization not found");

        // Check if user is owner or system admin/support (bits 50, 51)
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        let hasAccess = org.ownerId === userId;

        // Check system permissions if not owner
        if (!hasAccess && user.subscriptionTierId) {
            const tier = await ctx.db.get(user.subscriptionTierId);
            if (tier) {
                const systemAdmin = (BigInt(tier.basePermissions) & (1n << 50n)) !== 0n;
                const systemSupport = (BigInt(tier.basePermissions) & (1n << 51n)) !== 0n;
                hasAccess = systemAdmin || systemSupport;
            }
        }

        if (!hasAccess) {
            throw new Error("Only the owner or a system administrator can delete this organization");
        }

        // --- CASCADE DELETION ---

        // 1. Organization Members
        const members = await ctx.db
            .query("organizationMembers")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", id))
            .collect();

        for (const member of members) {
            // Member roles
            const memberRoles = await ctx.db
                .query("memberRoles")
                .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
                .collect();
            for (const mr of memberRoles) await ctx.db.delete(mr._id);

            // Member overrides
            const overrides = await ctx.db
                .query("memberPermissionOverrides")
                .withIndex("by_memberId", (q) => q.eq("memberId", member._id))
                .collect();
            for (const override of overrides) await ctx.db.delete(override._id);

            // Delete membership
            await ctx.db.delete(member._id);
        }

        // 2. Roles
        const roles = await ctx.db
            .query("roles")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", id))
            .collect();
        for (const role of roles) await ctx.db.delete(role._id);

        // 3. Projects and their data
        const projects = await ctx.db
            .query("projects")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", id))
            .collect();

        for (const project of projects) {
            // Fields
            const fields = await ctx.db
                .query("projectFields")
                .withIndex("by_project", (q) => q.eq("projectId", project._id))
                .collect();
            for (const f of fields) await ctx.db.delete(f._id);

            // Records
            const records = await ctx.db
                .query("projectRecords")
                .withIndex("by_project", (q) => q.eq("projectId", project._id))
                .collect();
            for (const r of records) await ctx.db.delete(r._id);

            // Views
            const views = await ctx.db
                .query("projectViews")
                .withIndex("by_project", (q) => q.eq("projectId", project._id))
                .collect();
            for (const vw of views) await ctx.db.delete(vw._id);

            // Delete project
            await ctx.db.delete(project._id);
        }

        // 4. Addons
        const addons = await ctx.db
            .query("organizationAddons")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", id))
            .collect();
        for (const addon of addons) await ctx.db.delete(addon._id);

        // 5. Audit Logs
        const auditLogs = await ctx.db
            .query("permissionAuditLog")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", id))
            .collect();
        for (const log of auditLogs) await ctx.db.delete(log._id);

        // 6. Delete the organization record itself
        await ctx.db.delete(id);

        return { success: true };
    },
});

/**
 * Helper: Create system roles for a new organization
 */
async function createSystemRoles(ctx: any, orgId: any) {
    // Owner role (all permissions)
    await ctx.db.insert("roles", {
        organizationId: orgId,
        name: "Owner",
        description: "Organization owner with full control",
        color: "#e74c3c",
        permissions: Number.MAX_SAFE_INTEGER, // All bits set
        position: 0,
        isSystemRole: true,
        systemRoleType: "owner",
        isAssignable: false,
        isDefault: false,
    });

    // Admin role
    await ctx.db.insert("roles", {
        organizationId: orgId,
        name: "Admin",
        description: "Administrator with most privileges",
        color: "#3498db",
        permissions: 524287, // Bits 0-18
        position: 1,
        isSystemRole: true,
        systemRoleType: "admin",
        isAssignable: true,
        isDefault: false,
    });

    // Moderator role
    await ctx.db.insert("roles", {
        organizationId: orgId,
        name: "Moderator",
        description: "Can manage members and content",
        color: "#2ecc71",
        permissions: 8191, // Bits 0-12
        position: 2,
        isSystemRole: true,
        systemRoleType: "moderator",
        isAssignable: true,
        isDefault: false,
    });

    // Member role (default)
    await ctx.db.insert("roles", {
        organizationId: orgId,
        name: "Member",
        description: "Default member role",
        color: "#95a5a6",
        permissions: 7, // Bits 0-2 (basic permissions)
        position: 3,
        isSystemRole: true,
        systemRoleType: "member",
        isAssignable: true,
        isDefault: true,
    });
}
