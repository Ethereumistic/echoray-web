/**
 * Mapper Projects - CRUD Backend
 * Complete backend operations for mapping projects with proper permissions
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { auth } from "../auth";
import { computeMemberPermissions, isSystemAdmin, PERMISSION_BITS, hasPermissionBit } from "../permissions";

/**
 * Create new mapping project
 */
export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        type: v.union(v.literal("personal"), v.literal("organization")),
        ownerId: v.union(v.id("users"), v.id("organizations")),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        // Permission check for organization projects
        if (args.type === "organization") {
            const orgId = args.ownerId as Id<"organizations">;

            // Check if user has permission to create projects in this org
            const permissions = await computeMemberPermissions(ctx, userId, orgId);
            const hasPermission = hasPermissionBit(permissions, PERMISSION_BITS["o.project.create"]);

            if (!hasPermission) {
                throw new Error("No permission to create organization projects");
            }
        } else {
            // Personal projects - must be creating for self OR be staff admin
            const isStaffAdmin = await isSystemAdmin(ctx, userId);
            if (args.ownerId !== userId && !isStaffAdmin) {
                throw new Error("Can only create personal projects for yourself");
            }
        }

        // Create project
        const projectId = await ctx.db.insert("mapping_projects", {
            name: args.name,
            description: args.description,
            icon: args.icon,
            type: args.type,
            ownerId: args.ownerId,
            defaultView: "table",
            createdBy: userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            archived: false,
            cardCount: 0,
        });

        // Create default template
        await ctx.db.insert("mapping_templates", {
            projectId,
            name: "Default Template",
            fields: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // Create default table view
        await ctx.db.insert("mapping_views", {
            projectId,
            name: "Table View",
            type: "table",
            config: {
                filters: [],
                sorts: [],
                visibleFields: [],
            },
            isDefault: true,
            createdBy: userId,
            createdAt: Date.now(),
        });

        return projectId;
    },
});

/**
 * List projects by scope
 */
export const list = query({
    args: {
        scope: v.string(), // "p" or "o"
        slug: v.string(),  // userId or orgId
        includeArchived: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        let ownerId: Id<"users"> | Id<"organizations">;

        if (args.scope === "p") {
            ownerId = args.slug as Id<"users">;

            // Can only view own personal projects (unless staff admin)
            const isStaffAdmin = await isSystemAdmin(ctx, userId);
            if (ownerId !== userId && !isStaffAdmin) {
                return [];
            }
        } else {
            ownerId = args.slug as Id<"organizations">;

            // Check if user has permission to view org projects
            const permissions = await computeMemberPermissions(ctx, userId, ownerId);
            const hasPermission = hasPermissionBit(permissions, PERMISSION_BITS["o.project.view"]);

            if (!hasPermission) {
                return [];
            }
        }

        const projects = await ctx.db
            .query("mapping_projects")
            .withIndex("by_owner", (q) =>
                q.eq("ownerId", ownerId).eq("archived", args.includeArchived ?? false)
            )
            .collect();

        return projects;
    },
});

/**
 * Get single project
 */
export const get = query({
    args: {
        projectId: v.id("mapping_projects"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;

        const project = await ctx.db.get(args.projectId);
        if (!project) return null;

        // Permission check
        if (project.type === "personal") {
            const isStaffAdmin = await isSystemAdmin(ctx, userId);
            if (project.ownerId !== userId && !isStaffAdmin) {
                return null;
            }
        } else {
            const orgId = project.ownerId as Id<"organizations">;
            const permissions = await computeMemberPermissions(ctx, userId, orgId);
            const hasPermission = hasPermissionBit(permissions, PERMISSION_BITS["o.project.view"]);

            if (!hasPermission) {
                return null;
            }
        }

        return project;
    },
});

/**
 * Update project
 */
export const update = mutation({
    args: {
        projectId: v.id("mapping_projects"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        defaultView: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Project not found");

        // Permission check
        if (project.type === "personal") {
            const isStaffAdmin = await isSystemAdmin(ctx, userId);
            if (project.ownerId !== userId && !isStaffAdmin) {
                throw new Error("No permission to edit this project");
            }
        } else {
            const orgId = project.ownerId as Id<"organizations">;
            const permissions = await computeMemberPermissions(ctx, userId, orgId);
            const hasPermission = hasPermissionBit(permissions, PERMISSION_BITS["o.project.edit"]);

            if (!hasPermission) {
                throw new Error("No permission to edit organization projects");
            }
        }

        // Prepare update data - only include defined fields
        const updateData: Record<string, unknown> = {
            updatedAt: Date.now(),
        };

        if (args.name !== undefined) updateData.name = args.name;
        if (args.description !== undefined) updateData.description = args.description;
        if (args.icon !== undefined) updateData.icon = args.icon;
        if (args.defaultView !== undefined) updateData.defaultView = args.defaultView;

        await ctx.db.patch(args.projectId, updateData);

        return args.projectId;
    },
});

/**
 * Archive project (soft delete)
 */
export const archive = mutation({
    args: {
        projectId: v.id("mapping_projects"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Project not found");

        // Permission check
        if (project.type === "personal") {
            const isStaffAdmin = await isSystemAdmin(ctx, userId);
            if (project.ownerId !== userId && !isStaffAdmin) {
                throw new Error("No permission to archive this project");
            }
        } else {
            const orgId = project.ownerId as Id<"organizations">;
            const permissions = await computeMemberPermissions(ctx, userId, orgId);
            const hasPermission = hasPermissionBit(permissions, PERMISSION_BITS["o.project.delete"]);

            if (!hasPermission) {
                throw new Error("No permission to archive organization projects");
            }
        }

        await ctx.db.patch(args.projectId, {
            archived: true,
            updatedAt: Date.now(),
        });

        return args.projectId;
    },
});

/**
 * Restore archived project
 */
export const restore = mutation({
    args: {
        projectId: v.id("mapping_projects"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Project not found");

        // Permission check (same as archive)
        if (project.type === "personal") {
            const isStaffAdmin = await isSystemAdmin(ctx, userId);
            if (project.ownerId !== userId && !isStaffAdmin) {
                throw new Error("No permission to restore this project");
            }
        } else {
            const orgId = project.ownerId as Id<"organizations">;
            const permissions = await computeMemberPermissions(ctx, userId, orgId);
            const hasPermission = hasPermissionBit(permissions, PERMISSION_BITS["o.project.delete"]);

            if (!hasPermission) {
                throw new Error("No permission to restore organization projects");
            }
        }

        await ctx.db.patch(args.projectId, {
            archived: false,
            updatedAt: Date.now(),
        });

        return args.projectId;
    },
});

/**
 * Hard delete project (cascading delete all related data)
 */
export const deleteProject = mutation({
    args: {
        projectId: v.id("mapping_projects"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Project not found");

        // Permission check
        if (project.type === "personal") {
            const isStaffAdmin = await isSystemAdmin(ctx, userId);
            if (project.ownerId !== userId && !isStaffAdmin) {
                throw new Error("No permission to delete this project");
            }
        } else {
            const orgId = project.ownerId as Id<"organizations">;
            const permissions = await computeMemberPermissions(ctx, userId, orgId);
            const hasPermission = hasPermissionBit(permissions, PERMISSION_BITS["o.project.delete"]);

            if (!hasPermission) {
                throw new Error("No permission to delete organization projects");
            }
        }

        // Delete all cards
        const cards = await ctx.db
            .query("mapping_cards")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .collect();

        for (const card of cards) {
            await ctx.db.delete(card._id);
        }

        // Delete all views
        const views = await ctx.db
            .query("mapping_views")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .collect();

        for (const view of views) {
            await ctx.db.delete(view._id);
        }

        // Delete template
        const template = await ctx.db
            .query("mapping_templates")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .unique();

        if (template) {
            await ctx.db.delete(template._id);
        }

        // Delete project
        await ctx.db.delete(args.projectId);

        return true;
    },
});

/**
 * Get project count for owner
 */
export const getCount = query({
    args: {
        ownerId: v.union(v.id("users"), v.id("organizations")),
    },
    handler: async (ctx, args) => {
        const projects = await ctx.db
            .query("mapping_projects")
            .withIndex("by_owner", (q) =>
                q.eq("ownerId", args.ownerId).eq("archived", false)
            )
            .collect();

        return projects.length;
    },
});
