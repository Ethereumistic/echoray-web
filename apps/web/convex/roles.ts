import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

/**
 * Role management Convex functions
 * Handles CRUD operations for organization roles
 */

/**
 * Get all roles for an organization
 */
export const listRoles = query({
    args: { organizationId: v.id("organizations") },
    handler: async (ctx, { organizationId }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Verify user is a member
        const membership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_org_user", (q) =>
                q.eq("organizationId", organizationId).eq("userId", userId)
            )
            .first();

        if (!membership || membership.status !== "active") {
            throw new Error("Not a member of this organization");
        }

        // Get all roles ordered by position
        const roles = await ctx.db
            .query("roles")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
            .collect();

        // Sort by position
        return roles.sort((a, b) => a.position - b.position);
    },
});

/**
 * Get a single role by ID
 */
export const getRole = query({
    args: { roleId: v.id("roles") },
    handler: async (ctx, { roleId }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const role = await ctx.db.get(roleId);
        if (!role) throw new Error("Role not found");

        // Verify user is a member of the org
        const membership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_org_user", (q) =>
                q.eq("organizationId", role.organizationId).eq("userId", userId)
            )
            .first();

        if (!membership) {
            throw new Error("Not authorized");
        }

        return role;
    },
});

/**
 * Create a new custom role
 */
export const createRole = mutation({
    args: {
        organizationId: v.id("organizations"),
        name: v.string(),
        description: v.optional(v.string()),
        color: v.optional(v.string()),
        permissions: v.number(),
    },
    handler: async (ctx, { organizationId, ...roleData }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // TODO: Check if user has roles.manage permission

        // Check if role name already exists
        const existingRole = await ctx.db
            .query("roles")
            .withIndex("by_org_name", (q) =>
                q.eq("organizationId", organizationId).eq("name", roleData.name)
            )
            .first();

        if (existingRole) {
            throw new Error("Role name already exists");
        }

        // Get the highest position
        const roles = await ctx.db
            .query("roles")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
            .collect();

        const maxPosition = roles.reduce((max, r) => Math.max(max, r.position), 0);

        // Create the role
        const roleId = await ctx.db.insert("roles", {
            organizationId,
            name: roleData.name,
            description: roleData.description,
            color: roleData.color,
            permissions: roleData.permissions,
            position: maxPosition + 1,
            isSystemRole: false,
            isAssignable: true,
            isDefault: false,
        });

        return roleId;
    },
});

/**
 * Update an existing role
 */
export const updateRole = mutation({
    args: {
        roleId: v.id("roles"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        color: v.optional(v.string()),
        permissions: v.optional(v.number()),
    },
    handler: async (ctx, { roleId, ...updates }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const role = await ctx.db.get(roleId);
        if (!role) throw new Error("Role not found");

        // Can't edit system roles (except color/description)
        if (role.isSystemRole && updates.permissions !== undefined) {
            throw new Error("Cannot modify system role permissions");
        }

        // TODO: Check if user has roles.manage permission

        // If changing name, check it doesn't already exist
        if (updates.name && updates.name !== role.name) {
            const existingRole = await ctx.db
                .query("roles")
                .withIndex("by_org_name", (q) =>
                    q.eq("organizationId", role.organizationId).eq("name", updates.name!)
                )
                .first();

            if (existingRole) {
                throw new Error("Role name already exists");
            }
        }

        await ctx.db.patch(roleId, updates);

        // Invalidate permissions for all members with this role
        if (updates.permissions !== undefined) {
            const memberRoles = await ctx.db
                .query("memberRoles")
                .withIndex("by_roleId", (q) => q.eq("roleId", roleId))
                .collect();

            for (const mr of memberRoles) {
                await ctx.db.patch(mr.memberId, {
                    permissionsLastComputedAt: undefined
                });
            }
        }

        return { success: true };
    },
});

/**
 * Delete a custom role
 */
export const deleteRole = mutation({
    args: { roleId: v.id("roles") },
    handler: async (ctx, { roleId }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const role = await ctx.db.get(roleId);
        if (!role) throw new Error("Role not found");

        // Can't delete system roles
        if (role.isSystemRole) {
            throw new Error("Cannot delete system roles");
        }

        // TODO: Check if user has roles.manage permission

        // Delete all member role assignments
        const memberRoles = await ctx.db
            .query("memberRoles")
            .withIndex("by_roleId", (q) => q.eq("roleId", roleId))
            .collect();

        for (const mr of memberRoles) {
            await ctx.db.delete(mr._id);
            // Invalidate member permissions
            await ctx.db.patch(mr.memberId, {
                permissionsLastComputedAt: undefined
            });
        }

        // Delete the role
        await ctx.db.delete(roleId);

        return { success: true };
    },
});

/**
 * Set a role as the default for an organization
 */
export const setDefaultRole = mutation({
    args: {
        organizationId: v.id("organizations"),
        roleId: v.id("roles")
    },
    handler: async (ctx, { organizationId, roleId }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Verify the role belongs to the organization
        const role = await ctx.db.get(roleId);
        if (!role || role.organizationId !== organizationId) {
            throw new Error("Role not found in this organization");
        }

        // TODO: Check if user has roles.manage permission

        // Get all current roles for this org
        const allRoles = await ctx.db
            .query("roles")
            .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
            .collect();

        // Update all roles: set isDefault to false for others, true for the target
        for (const r of allRoles) {
            await ctx.db.patch(r._id, {
                isDefault: r._id === roleId
            });
        }

        return { success: true };
    },
});

