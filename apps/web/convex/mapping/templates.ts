/**
 * Mapper Templates - Template Management Backend
 * Functions for managing card templates and field definitions
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { auth } from "../auth";
import { computeMemberPermissions, isSystemAdmin, PERMISSION_BITS, hasPermissionBit } from "../permissions";

/**
 * Get template for project
 */
export const getByProject = query({
    args: {
        projectId: v.id("mapping_projects"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;

        const template = await ctx.db
            .query("mapping_templates")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .unique();

        if (!template) return null;

        // Permission check - verify user can access the project
        const project = await ctx.db.get(args.projectId);
        if (!project) return null;

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

        return template;
    },
});

/**
 * Add field to template
 */
export const addField = mutation({
    args: {
        projectId: v.id("mapping_projects"),
        field: v.object({
            name: v.string(),
            type: v.string(),
            required: v.boolean(),
            config: v.any(),
        }),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Get project for permission check
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

        // Get template
        const template = await ctx.db
            .query("mapping_templates")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .unique();

        if (!template) throw new Error("Template not found");

        // Generate field ID
        const fieldId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Add field
        const newField = {
            id: fieldId,
            name: args.field.name,
            type: args.field.type,
            required: args.field.required,
            config: args.field.config,
            order: template.fields.length,
        };

        await ctx.db.patch(template._id, {
            fields: [...template.fields, newField],
            updatedAt: Date.now(),
        });

        return fieldId;
    },
});

/**
 * Update field configuration
 */
export const updateField = mutation({
    args: {
        projectId: v.id("mapping_projects"),
        fieldId: v.string(),
        updates: v.object({
            name: v.optional(v.string()),
            type: v.optional(v.string()),
            required: v.optional(v.boolean()),
            config: v.optional(v.any()),
        }),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Get project for permission check
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

        // Get template
        const template = await ctx.db
            .query("mapping_templates")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .unique();

        if (!template) throw new Error("Template not found");

        // Update field
        const updatedFields = template.fields.map((field) => {
            if (field.id === args.fieldId) {
                return {
                    ...field,
                    ...args.updates,
                };
            }
            return field;
        });

        // Verify the field exists
        const fieldExists = template.fields.some((f) => f.id === args.fieldId);
        if (!fieldExists) {
            throw new Error("Field not found");
        }

        await ctx.db.patch(template._id, {
            fields: updatedFields,
            updatedAt: Date.now(),
        });

        return true;
    },
});

/**
 * Remove field from template
 */
export const removeField = mutation({
    args: {
        projectId: v.id("mapping_projects"),
        fieldId: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Get project for permission check
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

        // Get template
        const template = await ctx.db
            .query("mapping_templates")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .unique();

        if (!template) throw new Error("Template not found");

        // Remove field
        const updatedFields = template.fields.filter(
            (field) => field.id !== args.fieldId
        );

        // Reorder remaining fields
        const reorderedFields = updatedFields.map((field, index) => ({
            ...field,
            order: index,
        }));

        await ctx.db.patch(template._id, {
            fields: reorderedFields,
            updatedAt: Date.now(),
        });

        // Clean up field values from all cards in this project
        const cards = await ctx.db
            .query("mapping_cards")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .collect();

        for (const card of cards) {
            if (card.values && typeof card.values === "object") {
                const updatedValues = { ...card.values };
                delete updatedValues[args.fieldId];

                await ctx.db.patch(card._id, {
                    values: updatedValues,
                    updatedAt: Date.now(),
                });
            }
        }

        return true;
    },
});

/**
 * Reorder fields
 */
export const reorderFields = mutation({
    args: {
        projectId: v.id("mapping_projects"),
        fieldOrder: v.array(v.string()), // Array of field IDs in new order
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Get project for permission check
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

        // Get template
        const template = await ctx.db
            .query("mapping_templates")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .unique();

        if (!template) throw new Error("Template not found");

        // Create a map of field IDs to fields
        const fieldMap = new Map(
            template.fields.map((field) => [field.id, field])
        );

        // Verify all field IDs exist
        for (const fieldId of args.fieldOrder) {
            if (!fieldMap.has(fieldId)) {
                throw new Error(`Field ${fieldId} not found`);
            }
        }

        // Verify all fields are present in the new order
        if (args.fieldOrder.length !== template.fields.length) {
            throw new Error("Field order must include all fields");
        }

        // Reorder fields based on provided order
        const reorderedFields = args.fieldOrder.map((fieldId, index) => {
            const field = fieldMap.get(fieldId)!;

            return {
                ...field,
                order: index,
            };
        });

        await ctx.db.patch(template._id, {
            fields: reorderedFields,
            updatedAt: Date.now(),
        });

        return true;
    },
});

/**
 * Duplicate field
 */
export const duplicateField = mutation({
    args: {
        projectId: v.id("mapping_projects"),
        fieldId: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Get project for permission check
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

        // Get template
        const template = await ctx.db
            .query("mapping_templates")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .unique();

        if (!template) throw new Error("Template not found");

        // Find field to duplicate
        const fieldToDuplicate = template.fields.find(
            (field) => field.id === args.fieldId
        );

        if (!fieldToDuplicate) throw new Error("Field not found");

        // Create duplicate
        const newFieldId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const duplicatedField = {
            ...fieldToDuplicate,
            id: newFieldId,
            name: `${fieldToDuplicate.name} (Copy)`,
            order: template.fields.length,
        };

        await ctx.db.patch(template._id, {
            fields: [...template.fields, duplicatedField],
            updatedAt: Date.now(),
        });

        return newFieldId;
    },
});

/**
 * Update template name
 */
export const updateTemplate = mutation({
    args: {
        projectId: v.id("mapping_projects"),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Get project for permission check
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

        // Get template
        const template = await ctx.db
            .query("mapping_templates")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .unique();

        if (!template) throw new Error("Template not found");

        await ctx.db.patch(template._id, {
            name: args.name,
            updatedAt: Date.now(),
        });

        return true;
    },
});
