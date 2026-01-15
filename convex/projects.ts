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
 * List projects by a specific owner ID (staff admin only)
 * Allows system.admin users to view any user's personal projects
 */
export const listProjectsByOwner = query({
    args: {
        ownerId: v.id("users"),
    },
    handler: async (ctx, { ownerId }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        // Check if user is staff admin
        const user = await ctx.db.get(userId);
        if (!user?.subscriptionTierId) return [];

        const tier = await ctx.db.get(user.subscriptionTierId);
        const isStaffAdmin = tier ? hasPermissionBit(tier.basePermissions, PERMISSION_BITS['system.admin']) : false;

        if (!isStaffAdmin) {
            // Non-staff can only view their own projects
            if (ownerId !== userId) return [];
        }

        // Get personal projects for the specified user
        return await ctx.db
            .query("projects")
            .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
            .collect();
    },
});

/**
 * Get a single project by ID
 * Returns { project, error } to allow graceful error handling in UI
 * Staff admins with system.admin permission can view ANY project
 */
export const getProject = query({
    args: { id: v.id("projects") },
    handler: async (ctx, { id }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            return { project: null, error: "not_authenticated" as const };
        }

        const project = await ctx.db.get(id);
        if (!project) {
            return { project: null, error: "not_found" as const };
        }

        // Check if user is staff admin (has system.admin permission)
        const user = await ctx.db.get(userId);
        const isStaffAdmin = user?.subscriptionTierId
            ? await (async () => {
                const tier = await ctx.db.get(user.subscriptionTierId!);
                return tier ? hasPermissionBit(tier.basePermissions, PERMISSION_BITS['system.admin']) : false;
            })()
            : false;

        // Staff admins can view any project
        if (isStaffAdmin) {
            return { project, error: null, isStaffView: true };
        }

        // Check access: either owner or org member
        if (project.ownerId) {
            if (project.ownerId !== userId) {
                return { project: null, error: "not_authorized" as const };
            }
        } else if (project.organizationId) {
            const membership = await ctx.db
                .query("organizationMembers")
                .withIndex("by_org_user", (q) =>
                    q.eq("organizationId", project.organizationId!).eq("userId", userId)
                )
                .first();

            if (!membership || membership.status !== "active") {
                return { project: null, error: "not_member" as const };
            }
        }

        return { project, error: null };
    },
});

/**
 * Create a new project
 * Requires project.create permission (Web tier and above)
 * Staff admins can specify targetOwnerId to create on behalf of another user
 */
export const createProject = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        organizationId: v.optional(v.id("organizations")),
        targetOwnerId: v.optional(v.id("users")), // Staff admin only: create for another user
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Get user's subscription tier
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        // Check if user is staff admin
        const isStaffAdmin = user?.subscriptionTierId
            ? await (async () => {
                const tier = await ctx.db.get(user.subscriptionTierId!);
                return tier ? hasPermissionBit(tier.basePermissions, PERMISSION_BITS['system.admin']) : false;
            })()
            : false;

        // Check project.create permission (staff admins bypass this)
        let hasPermission = isStaffAdmin;

        if (!hasPermission && user.subscriptionTierId) {
            const tier = await ctx.db.get(user.subscriptionTierId);
            if (tier) {
                hasPermission = hasPermissionBit(tier.basePermissions, PERMISSION_BITS['project.create']);
            }
        }

        if (!hasPermission) {
            throw new Error("Your plan does not include project creation. Please upgrade to Web tier or above.");
        }

        // Determine the actual owner ID (staff can override)
        const actualOwnerId = args.targetOwnerId && isStaffAdmin ? args.targetOwnerId : userId;

        // If creating under an organization, verify membership (staff bypass)
        if (args.organizationId) {
            if (!isStaffAdmin) {
                const membership = await ctx.db
                    .query("organizationMembers")
                    .withIndex("by_org_user", (q) =>
                        q.eq("organizationId", args.organizationId!).eq("userId", userId)
                    )
                    .first();

                if (!membership || membership.status !== "active") {
                    throw new Error("Not a member of this organization");
                }
            }

            // Create org project
            return await ctx.db.insert("projects", {
                name: args.name,
                description: args.description,
                organizationId: args.organizationId,
            });
        } else {
            // Create personal project with the determined owner
            return await ctx.db.insert("projects", {
                name: args.name,
                description: args.description,
                ownerId: actualOwnerId,
            });
        }
    },
});

/**
 * Update a project
 * Staff admins with system.admin can update any project
 */
export const updateProject = mutation({
    args: {
        id: v.id("projects"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        defaultView: v.optional(v.union(
            v.literal("table"),
            v.literal("kanban"),
            v.literal("cards"),
            v.literal("gallery")
        )),
        isSetupComplete: v.optional(v.boolean()),
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

        // Check if user is staff admin (bypass all authorization)
        const user = await ctx.db.get(userId);
        const isStaffAdmin = user?.subscriptionTierId
            ? await (async () => {
                const tier = await ctx.db.get(user.subscriptionTierId!);
                return tier ? hasPermissionBit(tier.basePermissions, PERMISSION_BITS['system.admin']) : false;
            })()
            : false;

        // Staff admins bypass authorization
        if (!isStaffAdmin) {
            // Check ownership
            if (project.ownerId && project.ownerId !== userId) {
                throw new Error("Not authorized");
            }

            if (project.organizationId) {
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
        }

        await ctx.db.patch(id, updates);
        return { success: true };
    },
});

/**
 * Delete a project
 * Staff admins with system.admin can delete any project
 */
export const deleteProject = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, { id }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const project = await ctx.db.get(id);
        if (!project) throw new Error("Project not found");

        // Check if user is staff admin (bypass all authorization)
        const user = await ctx.db.get(userId);
        const isStaffAdmin = user?.subscriptionTierId
            ? await (async () => {
                const tier = await ctx.db.get(user.subscriptionTierId!);
                return tier ? hasPermissionBit(tier.basePermissions, PERMISSION_BITS['system.admin']) : false;
            })()
            : false;

        // Staff admins bypass authorization
        if (!isStaffAdmin) {
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
        }

        // Delete all associated data
        const fields = await ctx.db
            .query("projectFields")
            .withIndex("by_project", (q) => q.eq("projectId", id))
            .collect();
        for (const field of fields) {
            await ctx.db.delete(field._id);
        }

        const records = await ctx.db
            .query("projectRecords")
            .withIndex("by_project", (q) => q.eq("projectId", id))
            .collect();
        for (const record of records) {
            await ctx.db.delete(record._id);
        }

        const views = await ctx.db
            .query("projectViews")
            .withIndex("by_project", (q) => q.eq("projectId", id))
            .collect();
        for (const view of views) {
            await ctx.db.delete(view._id);
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

// ============================================================================
// PROJECT FIELDS (Schema-on-Read)
// ============================================================================

/**
 * Get project schema (field definitions)
 */
export const getProjectSchema = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, { projectId }) => {
        const fields = await ctx.db
            .query("projectFields")
            .withIndex("by_project", (q) => q.eq("projectId", projectId))
            .collect();

        return fields.sort((a, b) => a.order - b.order);
    },
});

/**
 * Create a new field definition
 */
export const createField = mutation({
    args: {
        projectId: v.id("projects"),
        fieldKey: v.string(),
        fieldName: v.string(),
        fieldType: v.string(), // Accept any string, we'll validate in schema
        subTypes: v.optional(v.array(v.string())),
        simpleOptions: v.optional(v.array(v.string())),
        isRequired: v.optional(v.boolean()),
        currencySymbol: v.optional(v.string()),
        placeholder: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Get next order number
        const existingFields = await ctx.db
            .query("projectFields")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .collect();

        const nextOrder = existingFields.length;

        return await ctx.db.insert("projectFields", {
            projectId: args.projectId,
            fieldKey: args.fieldKey,
            fieldName: args.fieldName,
            fieldType: args.fieldType as any,
            subTypes: args.subTypes,
            simpleOptions: args.simpleOptions,
            isRequired: args.isRequired ?? false,
            order: nextOrder,
            currencySymbol: args.currencySymbol,
            placeholder: args.placeholder,
        });
    },
});

/**
 * Update a field definition
 */
export const updateField = mutation({
    args: {
        id: v.id("projectFields"),
        fieldName: v.optional(v.string()),
        simpleOptions: v.optional(v.array(v.string())),
        subTypes: v.optional(v.array(v.string())),
        isRequired: v.optional(v.boolean()),
        order: v.optional(v.number()),
        currencySymbol: v.optional(v.string()),
        placeholder: v.optional(v.string()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        await ctx.db.patch(id, updates);
        return { success: true };
    },
});

/**
 * Delete a field definition
 */
export const deleteField = mutation({
    args: { id: v.id("projectFields") },
    handler: async (ctx, { id }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        await ctx.db.delete(id);
        return { success: true };
    },
});

/**
 * Bulk create/update fields (for setup flow)
 */
export const saveFieldSchema = mutation({
    args: {
        projectId: v.id("projects"),
        fields: v.array(v.object({
            fieldKey: v.string(),
            fieldName: v.string(),
            fieldType: v.string(),
            subTypes: v.optional(v.array(v.string())),
            simpleOptions: v.optional(v.array(v.string())),
            isRequired: v.optional(v.boolean()),
            currencySymbol: v.optional(v.string()),
            placeholder: v.optional(v.string()),
        })),
    },
    handler: async (ctx, { projectId, fields }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Delete existing fields
        const existingFields = await ctx.db
            .query("projectFields")
            .withIndex("by_project", (q) => q.eq("projectId", projectId))
            .collect();

        for (const field of existingFields) {
            await ctx.db.delete(field._id);
        }

        // Create new fields
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            await ctx.db.insert("projectFields", {
                projectId,
                fieldKey: field.fieldKey,
                fieldName: field.fieldName,
                fieldType: field.fieldType as any,
                subTypes: field.subTypes,
                simpleOptions: field.simpleOptions,
                isRequired: field.isRequired ?? false,
                order: i,
                currencySymbol: field.currencySymbol,
                placeholder: field.placeholder,
            });
        }

        return { success: true, count: fields.length };
    },
});

// ============================================================================
// PROJECT RECORDS (Card/Row Data)
// ============================================================================

/**
 * Get all records for a project with schema applied
 */
export const getProjectRecords = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, { projectId }) => {
        // Fetch schema
        const fields = await ctx.db
            .query("projectFields")
            .withIndex("by_project", (q) => q.eq("projectId", projectId))
            .collect();

        // Fetch raw records
        const records = await ctx.db
            .query("projectRecords")
            .withIndex("by_project", (q) => q.eq("projectId", projectId))
            .collect();

        // Return records with field metadata
        return {
            schema: fields.sort((a, b) => a.order - b.order),
            records: records,
        };
    },
});

/**
 * Create a new record
 */
export const createRecord = mutation({
    args: {
        projectId: v.id("projects"),
        data: v.any(),
    },
    handler: async (ctx, { projectId, data }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Optional: validate against schema
        const fields = await ctx.db
            .query("projectFields")
            .withIndex("by_project", (q) => q.eq("projectId", projectId))
            .collect();

        // Check required fields
        for (const field of fields) {
            if (field.isRequired && !data[field.fieldKey]) {
                throw new Error(`Field "${field.fieldName}" is required`);
            }
        }

        return await ctx.db.insert("projectRecords", {
            projectId,
            data,
            createdBy: userId,
        });
    },
});

/**
 * Update a record
 */
export const updateRecord = mutation({
    args: {
        id: v.id("projectRecords"),
        data: v.any(),
    },
    handler: async (ctx, { id, data }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        await ctx.db.patch(id, { data });
        return { success: true };
    },
});

/**
 * Delete a record
 */
export const deleteRecord = mutation({
    args: { id: v.id("projectRecords") },
    handler: async (ctx, { id }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        await ctx.db.delete(id);
        return { success: true };
    },
});

// ============================================================================
// PROJECT VIEWS (Table, Kanban, Cards, Gallery)
// ============================================================================

/**
 * Get all views for a project
 */
export const getProjectViews = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, { projectId }) => {
        return await ctx.db
            .query("projectViews")
            .withIndex("by_project", (q) => q.eq("projectId", projectId))
            .collect();
    },
});

/**
 * Create a new view
 */
export const createView = mutation({
    args: {
        projectId: v.id("projects"),
        name: v.string(),
        viewType: v.union(
            v.literal("table"),
            v.literal("kanban"),
            v.literal("cards"),
            v.literal("gallery")
        ),
        isDefault: v.optional(v.boolean()),
        config: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // If this is the default view, unset other defaults
        if (args.isDefault) {
            const existingViews = await ctx.db
                .query("projectViews")
                .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
                .collect();

            for (const view of existingViews) {
                if (view.isDefault) {
                    await ctx.db.patch(view._id, { isDefault: false });
                }
            }
        }

        return await ctx.db.insert("projectViews", {
            projectId: args.projectId,
            name: args.name,
            viewType: args.viewType,
            isDefault: args.isDefault ?? false,
            config: args.config,
        });
    },
});

/**
 * Update a view
 */
export const updateView = mutation({
    args: {
        id: v.id("projectViews"),
        name: v.optional(v.string()),
        viewType: v.optional(v.union(
            v.literal("table"),
            v.literal("kanban"),
            v.literal("cards"),
            v.literal("gallery")
        )),
        isDefault: v.optional(v.boolean()),
        config: v.optional(v.any()),
    },
    handler: async (ctx, { id, ...updates }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const view = await ctx.db.get(id);
        if (!view) throw new Error("View not found");

        // If setting as default, unset other defaults
        if (updates.isDefault) {
            const existingViews = await ctx.db
                .query("projectViews")
                .withIndex("by_project", (q) => q.eq("projectId", view.projectId))
                .collect();

            for (const v of existingViews) {
                if (v._id !== id && v.isDefault) {
                    await ctx.db.patch(v._id, { isDefault: false });
                }
            }
        }

        await ctx.db.patch(id, updates);
        return { success: true };
    },
});

/**
 * Delete a view
 */
export const deleteView = mutation({
    args: { id: v.id("projectViews") },
    handler: async (ctx, { id }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        await ctx.db.delete(id);
        return { success: true };
    },
});

/**
 * Complete project setup (set default view and mark as setup complete)
 */
export const completeProjectSetup = mutation({
    args: {
        projectId: v.id("projects"),
        defaultView: v.union(
            v.literal("table"),
            v.literal("kanban"),
            v.literal("cards"),
            v.literal("gallery")
        ),
    },
    handler: async (ctx, { projectId, defaultView }) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Update project
        await ctx.db.patch(projectId, {
            defaultView,
            isSetupComplete: true,
        });

        // Create default view if it doesn't exist
        const existingViews = await ctx.db
            .query("projectViews")
            .withIndex("by_project", (q) => q.eq("projectId", projectId))
            .collect();

        if (existingViews.length === 0) {
            await ctx.db.insert("projectViews", {
                projectId,
                name: "Default View",
                viewType: defaultView,
                isDefault: true,
            });
        }

        return { success: true };
    },
});

