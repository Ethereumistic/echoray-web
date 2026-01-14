import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { hasPermissionBit, PERMISSION_BITS } from "./permissions";

/**
 * Project-related Convex functions
 * Handles CRUD operations for projects
 * Projects can be personal (ownerId) or organizational (organizationId)
 */

/**
 * List all projects the current user has access to
 */
export const listMyProjects = query({
    args: {
        organizationId: v.optional(v.id("organizations")),
    },
    handler: async (ctx, { organizationId }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        if (organizationId) {
            // Get org projects
            return await ctx.db
                .query("projects")
                .withIndex("by_organizationId", (q) => q.eq("organizationId", organizationId))
                .collect();
        } else {
            // Get personal projects
            return await ctx.db
                .query("projects")
                .withIndex("by_ownerId", (q) => q.eq("ownerId", userId))
                .collect();
        }
    },
});

/**
 * Get a single project by ID
 */
export const getProject = query({
    args: { id: v.id("projects") },
    handler: async (ctx, { id }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const project = await ctx.db.get(id);
        if (!project) return null;

        // Check access: either owner or org member
        if (project.ownerId) {
            if (project.ownerId !== userId) {
                throw new Error("Not authorized to view this project");
            }
        } else if (project.organizationId) {
            const membership = await ctx.db
                .query("organizationMembers")
                .withIndex("by_org_user", (q) =>
                    q.eq("organizationId", project.organizationId!).eq("userId", userId)
                )
                .first();

            if (!membership || membership.status !== "active") {
                throw new Error("Not a member of this organization");
            }
        }

        return project;
    },
});

/**
 * Create a new project
 * Requires project.create permission (Web tier and above)
 */
export const createProject = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        organizationId: v.optional(v.id("organizations")),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Get user's subscription tier
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        // Check project.create permission
        let hasPermission = false;

        if (user.subscriptionTierId) {
            const tier = await ctx.db.get(user.subscriptionTierId);
            if (tier) {
                hasPermission = hasPermissionBit(tier.basePermissions, PERMISSION_BITS['project.create']);
            }
        }

        if (!hasPermission) {
            throw new Error("Your plan does not include project creation. Please upgrade to Web tier or above.");
        }

        // If creating under an organization, verify membership
        if (args.organizationId) {
            const membership = await ctx.db
                .query("organizationMembers")
                .withIndex("by_org_user", (q) =>
                    q.eq("organizationId", args.organizationId!).eq("userId", userId)
                )
                .first();

            if (!membership || membership.status !== "active") {
                throw new Error("Not a member of this organization");
            }

            // Create org project
            return await ctx.db.insert("projects", {
                name: args.name,
                description: args.description,
                organizationId: args.organizationId,
            });
        } else {
            // Create personal project
            return await ctx.db.insert("projects", {
                name: args.name,
                description: args.description,
                ownerId: userId,
            });
        }
    },
});

/**
 * Update a project
 */
export const updateProject = mutation({
    args: {
        id: v.id("projects"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        settings: v.optional(v.object({
            isPublic: v.optional(v.boolean()),
            allowedFeatures: v.optional(v.array(v.string())),
        })),
    },
    handler: async (ctx, { id, ...updates }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const project = await ctx.db.get(id);
        if (!project) throw new Error("Project not found");

        // Check ownership
        if (project.ownerId && project.ownerId !== userId) {
            throw new Error("Not authorized");
        }

        if (project.organizationId) {
            // TODO: Check org permissions for editing
            const membership = await ctx.db
                .query("organizationMembers")
                .withIndex("by_org_user", (q) =>
                    q.eq("organizationId", project.organizationId!).eq("userId", userId)
                )
                .first();

            if (!membership || membership.status !== "active") {
                throw new Error("Not a member of this organization");
            }
        }

        await ctx.db.patch(id, updates);
        return { success: true };
    },
});

/**
 * Delete a project
 */
export const deleteProject = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, { id }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const project = await ctx.db.get(id);
        if (!project) throw new Error("Project not found");

        // Check ownership
        if (project.ownerId && project.ownerId !== userId) {
            throw new Error("Not authorized");
        }

        if (project.organizationId) {
            // Only org owner can delete projects for now
            const org = await ctx.db.get(project.organizationId);
            if (!org || org.ownerId !== userId) {
                throw new Error("Only the organization owner can delete projects");
            }
        }

        await ctx.db.delete(id);
        return { success: true };
    },
});

/**
 * Check if the current user can create projects
 */
export const canCreateProject = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return { canCreate: false, reason: "Not authenticated" };

        const user = await ctx.db.get(userId);
        if (!user) return { canCreate: false, reason: "User not found" };

        if (!user.subscriptionTierId) {
            return { canCreate: false, reason: "No subscription tier" };
        }

        const tier = await ctx.db.get(user.subscriptionTierId);
        if (!tier) {
            return { canCreate: false, reason: "Subscription tier not found" };
        }

        const hasPermission = hasPermissionBit(tier.basePermissions, PERMISSION_BITS['project.create']);

        if (!hasPermission) {
            return {
                canCreate: false,
                reason: `Your ${tier.name} plan does not include project creation. Upgrade to Web tier or above.`
            };
        }

        return { canCreate: true, reason: null };
    },
});
