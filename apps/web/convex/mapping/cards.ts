/**
 * Mapper Cards - Card CRUD Backend
 * Complete card (data record) operations with validation and bulk operations
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { auth } from "../auth";
import { computeMemberPermissions, isSystemAdmin, PERMISSION_BITS, hasPermissionBit } from "../permissions";

/**
 * Helper function to check project access permissions
 */
async function checkProjectPermission(
    ctx: any,
    userId: Id<"users">,
    projectId: Id<"mapping_projects">,
    requiredPermission: "view" | "edit" | "delete"
): Promise<boolean> {
    const project = await ctx.db.get(projectId);
    if (!project) return false;

    if (project.type === "personal") {
        const isStaffAdmin = await isSystemAdmin(ctx, userId);
        return project.ownerId === userId || isStaffAdmin;
    } else {
        const orgId = project.ownerId as Id<"organizations">;
        const permissions = await computeMemberPermissions(ctx, userId, orgId);

        const permissionCode =
            requiredPermission === "view" ? "o.project.view" :
                requiredPermission === "edit" ? "o.project.edit" :
                    "o.project.delete";

        return hasPermissionBit(permissions, PERMISSION_BITS[permissionCode]);
    }
}

/**
 * Create card
 */
export const create = mutation({
    args: {
        projectId: v.id("mapping_projects"),
        values: v.any(), // Dynamic field values
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        // Get project
        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Project not found");

        // Permission check
        const hasPermission = await checkProjectPermission(ctx, userId, args.projectId, "edit");
        if (!hasPermission) {
            throw new Error("No permission to create cards in this project");
        }

        // Get template
        const template = await ctx.db
            .query("mapping_templates")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .unique();

        if (!template) throw new Error("Template not found");

        // Validate required fields
        for (const field of template.fields) {
            if (field.required) {
                const value = args.values?.[field.id];
                if (value === undefined || value === null || value === "") {
                    throw new Error(`Field "${field.name}" is required`);
                }
            }
        }

        // Get current card count for order
        const cardCount = await ctx.db
            .query("mapping_cards")
            .withIndex("by_project", (q) =>
                q.eq("projectId", args.projectId).eq("archived", false)
            )
            .collect();

        const cardId = await ctx.db.insert("mapping_cards", {
            projectId: args.projectId,
            templateId: template._id,
            values: args.values || {},
            createdBy: userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            order: cardCount.length,
            archived: false,
        });

        // Increment project card count
        await ctx.db.patch(args.projectId, {
            cardCount: project.cardCount + 1,
            updatedAt: Date.now(),
        });

        return cardId;
    },
});

/**
 * List cards with optional filters and sorting
 */
export const list = query({
    args: {
        projectId: v.id("mapping_projects"),
        includeArchived: v.optional(v.boolean()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        // Permission check
        const hasPermission = await checkProjectPermission(ctx, userId, args.projectId, "view");
        if (!hasPermission) {
            return [];
        }

        let query = ctx.db
            .query("mapping_cards")
            .withIndex("by_project", (q) =>
                q.eq("projectId", args.projectId).eq("archived", args.includeArchived ?? false)
            );

        const cards = await query.collect();

        // Apply limit if specified
        if (args.limit && args.limit > 0) {
            return cards.slice(0, args.limit);
        }

        return cards;
    },
});

/**
 * Get single card
 */
export const get = query({
    args: {
        cardId: v.id("mapping_cards"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;

        const card = await ctx.db.get(args.cardId);
        if (!card) return null;

        // Permission check
        const hasPermission = await checkProjectPermission(ctx, userId, card.projectId, "view");
        if (!hasPermission) {
            return null;
        }

        return card;
    },
});

/**
 * Update card
 */
export const update = mutation({
    args: {
        cardId: v.id("mapping_cards"),
        values: v.any(),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const card = await ctx.db.get(args.cardId);
        if (!card) throw new Error("Card not found");

        // Permission check
        const hasPermission = await checkProjectPermission(ctx, userId, card.projectId, "edit");
        if (!hasPermission) {
            throw new Error("No permission to edit cards in this project");
        }

        // Get template for validation
        const template = await ctx.db.get(card.templateId);
        if (!template) throw new Error("Template not found");

        // Validate required fields
        const mergedValues = { ...card.values, ...args.values };
        for (const field of template.fields) {
            if (field.required) {
                const value = mergedValues[field.id];
                if (value === undefined || value === null || value === "") {
                    throw new Error(`Field "${field.name}" is required`);
                }
            }
        }

        await ctx.db.patch(args.cardId, {
            values: mergedValues,
            updatedAt: Date.now(),
        });

        return args.cardId;
    },
});

/**
 * Archive card (soft delete)
 */
export const archive = mutation({
    args: {
        cardId: v.id("mapping_cards"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const card = await ctx.db.get(args.cardId);
        if (!card) throw new Error("Card not found");

        // Permission check
        const hasPermission = await checkProjectPermission(ctx, userId, card.projectId, "delete");
        if (!hasPermission) {
            throw new Error("No permission to archive cards in this project");
        }

        await ctx.db.patch(args.cardId, {
            archived: true,
            updatedAt: Date.now(),
        });

        // Decrement project card count
        const project = await ctx.db.get(card.projectId);
        if (project) {
            await ctx.db.patch(card.projectId, {
                cardCount: Math.max(0, project.cardCount - 1),
                updatedAt: Date.now(),
            });
        }

        return args.cardId;
    },
});

/**
 * Delete card (hard delete)
 */
export const deleteCard = mutation({
    args: {
        cardId: v.id("mapping_cards"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const card = await ctx.db.get(args.cardId);
        if (!card) throw new Error("Card not found");

        // Permission check
        const hasPermission = await checkProjectPermission(ctx, userId, card.projectId, "delete");
        if (!hasPermission) {
            throw new Error("No permission to delete cards in this project");
        }

        // Get project to decrement count
        const project = await ctx.db.get(card.projectId);
        if (project) {
            await ctx.db.patch(card.projectId, {
                cardCount: Math.max(0, project.cardCount - 1),
                updatedAt: Date.now(),
            });
        }

        await ctx.db.delete(args.cardId);

        return true;
    },
});

/**
 * Duplicate card
 */
export const duplicate = mutation({
    args: {
        cardId: v.id("mapping_cards"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        const card = await ctx.db.get(args.cardId);
        if (!card) throw new Error("Card not found");

        // Permission check
        const hasPermission = await checkProjectPermission(ctx, userId, card.projectId, "edit");
        if (!hasPermission) {
            throw new Error("No permission to duplicate cards in this project");
        }

        // Get current card count for order
        const cardCount = await ctx.db
            .query("mapping_cards")
            .withIndex("by_project", (q) =>
                q.eq("projectId", card.projectId).eq("archived", false)
            )
            .collect();

        const newCardId = await ctx.db.insert("mapping_cards", {
            projectId: card.projectId,
            templateId: card.templateId,
            values: card.values,
            createdBy: userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            order: cardCount.length,
            archived: false,
        });

        // Increment project card count
        const project = await ctx.db.get(card.projectId);
        if (project) {
            await ctx.db.patch(card.projectId, {
                cardCount: project.cardCount + 1,
                updatedAt: Date.now(),
            });
        }

        return newCardId;
    },
});

/**
 * Bulk update cards
 */
export const bulkUpdate = mutation({
    args: {
        cardIds: v.array(v.id("mapping_cards")),
        updates: v.any(),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const updatedCount = { count: 0 };

        for (const cardId of args.cardIds) {
            const card = await ctx.db.get(cardId);
            if (!card) continue;

            // Permission check for each card
            const hasPermission = await checkProjectPermission(ctx, userId, card.projectId, "edit");
            if (!hasPermission) continue;

            await ctx.db.patch(cardId, {
                values: {
                    ...card.values,
                    ...args.updates,
                },
                updatedAt: Date.now(),
            });

            updatedCount.count++;
        }

        return updatedCount.count;
    },
});

/**
 * Bulk delete cards
 */
export const bulkDelete = mutation({
    args: {
        cardIds: v.array(v.id("mapping_cards")),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const deletedCount = { count: 0 };

        for (const cardId of args.cardIds) {
            const card = await ctx.db.get(cardId);
            if (!card) continue;

            // Permission check for each card
            const hasPermission = await checkProjectPermission(ctx, userId, card.projectId, "delete");
            if (!hasPermission) continue;

            await ctx.db.delete(cardId);

            // Decrement project card count
            const project = await ctx.db.get(card.projectId);
            if (project) {
                await ctx.db.patch(card.projectId, {
                    cardCount: Math.max(0, project.cardCount - 1),
                    updatedAt: Date.now(),
                });
            }

            deletedCount.count++;
        }

        return deletedCount.count;
    },
});

/**
 * Reorder cards
 */
export const reorder = mutation({
    args: {
        projectId: v.id("mapping_projects"),
        cardOrder: v.array(v.id("mapping_cards")),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Permission check
        const hasPermission = await checkProjectPermission(ctx, userId, args.projectId, "edit");
        if (!hasPermission) {
            throw new Error("No permission to reorder cards in this project");
        }

        for (let i = 0; i < args.cardOrder.length; i++) {
            await ctx.db.patch(args.cardOrder[i], {
                order: i,
                updatedAt: Date.now(),
            });
        }

        return true;
    },
});

/**
 * Get card count for project
 */
export const getCount = query({
    args: {
        projectId: v.id("mapping_projects"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return 0;

        const hasPermission = await checkProjectPermission(ctx, userId, args.projectId, "view");
        if (!hasPermission) return 0;

        const cards = await ctx.db
            .query("mapping_cards")
            .withIndex("by_project", (q) =>
                q.eq("projectId", args.projectId).eq("archived", false)
            )
            .collect();

        return cards.length;
    },
});
/**
 * Sync cards and fields in bulk
 */
export const sync = mutation({
    args: {
        projectId: v.id("mapping_projects"),
        cards: v.array(v.object({
            id: v.optional(v.string()), // Temporary local ID or Convex ID
            _id: v.optional(v.id("mapping_cards")), // Convex ID
            values: v.any(),
            order: v.number(),
            isDeleted: v.optional(v.boolean()),
        })),
        fields: v.array(v.object({
            id: v.string(),
            name: v.string(),
            type: v.string(),
            required: v.boolean(),
            config: v.any(),
            order: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const project = await ctx.db.get(args.projectId);
        if (!project) throw new Error("Project not found");

        const hasPermission = await checkProjectPermission(ctx, userId, args.projectId, "edit");
        if (!hasPermission) throw new Error("No permission to edit this project");

        // 1. Sync Template Fields
        const template = await ctx.db
            .query("mapping_templates")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .unique();

        if (!template) throw new Error("Template not found");

        await ctx.db.patch(template._id, {
            fields: args.fields,
            updatedAt: Date.now(),
        });

        // 2. Sync Cards
        let newCount = project.cardCount;

        for (const card of args.cards) {
            if (card.isDeleted && card._id) {
                // Delete existing card
                await ctx.db.delete(card._id);
                newCount--;
            } else if (card._id) {
                // Update existing card
                await ctx.db.patch(card._id, {
                    values: card.values,
                    order: card.order,
                    updatedAt: Date.now(),
                });
            } else if (!card.isDeleted) {
                // Create new card
                await ctx.db.insert("mapping_cards", {
                    projectId: args.projectId,
                    templateId: template._id,
                    values: card.values,
                    createdBy: userId,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    order: card.order,
                    archived: false,
                });
                newCount++;
            }
        }

        // Update project card count
        await ctx.db.patch(args.projectId, {
            cardCount: Math.max(0, newCount),
            updatedAt: Date.now(),
        });

        return true;
    },
});
