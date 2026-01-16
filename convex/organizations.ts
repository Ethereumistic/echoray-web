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
 * Create a new organization
 */
export const createOrganization = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

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

        // Get the admin role
        const adminRole = await ctx.db
            .query("roles")
            .withIndex("by_org_systemRole", (q) =>
                q.eq("organizationId", orgId).eq("isSystemRole", true)
            )
            .filter((q) => q.eq(q.field("systemRoleType"), "admin"))
            .first();

        if (adminRole) {
            await ctx.db.insert("memberRoles", {
                memberId,
                roleId: adminRole._id,
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
 * Transfer ownership of an organization to another member
 */
export const transferOwnership = mutation({
    args: {
        organizationId: v.id("organizations"),
        newOwnerId: v.id("users"),
    },
    handler: async (ctx, { organizationId, newOwnerId }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const org = await ctx.db.get(organizationId);
        if (!org) throw new Error("Organization not found");

        // Verify current user is owner
        if (org.ownerId !== userId) {
            throw new Error("Only the organization owner can transfer ownership");
        }

        if (userId === newOwnerId) {
            throw new Error("You are already the owner");
        }

        // Verify new owner is a member
        const newOwnerMembership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_org_user", (q) =>
                q.eq("organizationId", organizationId).eq("userId", newOwnerId)
            )
            .first();

        if (!newOwnerMembership || newOwnerMembership.status !== "active") {
            throw new Error("Target user must be an active member of the organization");
        }

        // Update organization owner
        await ctx.db.patch(organizationId, { ownerId: newOwnerId });

        // Assign Admin role to the NEW owner (clearing their old roles if any)
        const adminRole = await ctx.db
            .query("roles")
            .withIndex("by_org_systemRole", (q) =>
                q.eq("organizationId", organizationId).eq("isSystemRole", true)
            )
            .filter((q) => q.eq(q.field("systemRoleType"), "admin"))
            .first();

        if (adminRole) {
            // Updated New Owner Roles
            const existingNewOwnerRoles = await ctx.db
                .query("memberRoles")
                .withIndex("by_memberId", (q) => q.eq("memberId", newOwnerMembership._id))
                .collect();
            for (const r of existingNewOwnerRoles) await ctx.db.delete(r._id);

            await ctx.db.insert("memberRoles", {
                memberId: newOwnerMembership._id,
                roleId: adminRole._id,
                assignedAt: Date.now(),
                assignedBy: userId,
            });

            // Update Old Owner Roles
            const oldOwnerMembership = await ctx.db
                .query("organizationMembers")
                .withIndex("by_org_user", (q) =>
                    q.eq("organizationId", organizationId).eq("userId", userId)
                )
                .first();

            if (oldOwnerMembership) {
                const existingOldOwnerRoles = await ctx.db
                    .query("memberRoles")
                    .withIndex("by_memberId", (q) => q.eq("memberId", oldOwnerMembership._id))
                    .collect();
                for (const r of existingOldOwnerRoles) await ctx.db.delete(r._id);

                await ctx.db.insert("memberRoles", {
                    memberId: oldOwnerMembership._id,
                    roleId: adminRole._id,
                    assignedAt: Date.now(),
                    assignedBy: userId,
                });

                // Clear computed permissions
                await ctx.db.patch(oldOwnerMembership._id, {
                    permissionsLastComputedAt: undefined,
                    computedPermissions: 0,
                });
            }
        }

        // Also clear computed permissions for the NEW owner
        await ctx.db.patch(newOwnerMembership._id, {
            permissionsLastComputedAt: undefined,
            computedPermissions: 0,
        });

        return { success: true };
    },
});

async function createSystemRoles(ctx: any, orgId: any) {
    // Permission bit positions (from PERMISSION_BITS):
    // 20: o.project.view, 21: o.project.create, 22: o.project.edit, 23: o.project.delete
    // 24: o.member.view, 25: o.member.invite, 26: o.editor.invite, 27: o.admin.invite
    // 28: o.member.remove, 29: o.role.manage, 30: o.settings.edit

    // Helper to build bitmask correctly
    const buildMask = (bits: number[]) => {
        let mask = 0n;
        for (const bit of bits) mask |= (1n << BigInt(bit));
        return Number(mask);
    };

    // Admin role: All org permissions
    const adminPermissions = buildMask([20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
    await ctx.db.insert("roles", {
        organizationId: orgId,
        name: "Admin",
        description: "Full org access (except owner-only settings)",
        color: "#f59e0b", // Amber
        permissions: adminPermissions,
        position: 0,
        isSystemRole: true,
        systemRoleType: "admin",
        isAssignable: true,
        isDefault: false,
    });

    // Editor role: Project management + invite as editor/member
    const editorPermissions = buildMask([20, 21, 22, 24, 25, 26]);
    await ctx.db.insert("roles", {
        organizationId: orgId,
        name: "Editor",
        description: "Can manage projects and invite new members",
        color: "#3b82f6", // Blue
        permissions: editorPermissions,
        position: 1,
        isSystemRole: true,
        systemRoleType: "moderator", // Backend uses 'moderator' for Editor system role
        isAssignable: true,
        isDefault: false,
    });

    // Member role: View-only access
    const memberPermissions = buildMask([20, 24]);
    await ctx.db.insert("roles", {
        organizationId: orgId,
        name: "Member",
        description: "Standard view-only access",
        color: "#94a3b8", // Slate
        permissions: memberPermissions,
        position: 2,
        isSystemRole: true,
        systemRoleType: "member",
        isAssignable: true,
        isDefault: true,
    });
}
