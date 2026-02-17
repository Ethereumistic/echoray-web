import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Repos - GitHub repository management for file uploads
 * Handles repo lifecycle for both personal and organizational scopes
 */

/**
 * Ensure a GitHub repo exists for a given entity (user or organization)
 * Creates repo if it doesn't exist, returns existing repo otherwise
 */
export const ensureRepoExists = mutation({
    args: {
        type: v.union(v.literal("personal"), v.literal("organization")),
        entityId: v.union(v.id("users"), v.id("organizations")),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check if repo already exists
        const existing = await ctx.db
            .query("repos")
            .withIndex("by_entity", (q) => q.eq("entityId", args.entityId))
            .first();

        if (existing) {
            return existing;
        }

        // Generate repo name based on type and entity ID
        const prefix = args.type === "personal" ? "p" : "o";
        const repoName = `${prefix}-${args.entityId}`;

        // Create repo record with pending status
        const repoId = await ctx.db.insert("repos", {
            type: args.type,
            entityId: args.entityId,
            githubRepoName: repoName,
            githubRepoUrl: `https://github.com/echoray-io/${repoName}`,
            createdAt: Date.now(),
            status: "pending",
        });

        // Trigger async GitHub repo creation
        await ctx.scheduler.runAfter(0, internal.github.createRepository, {
            repoId,
            repoName,
        });

        return await ctx.db.get(repoId);
    },
});

/**
 * Get repo by entity ID
 */
export const getRepoByEntity = query({
    args: {
        entityId: v.union(v.id("users"), v.id("organizations")),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;

        return await ctx.db
            .query("repos")
            .withIndex("by_entity", (q) => q.eq("entityId", args.entityId))
            .first();
    },
});

/**
 * Internal query to get repo details (for use in actions)
 */
export const getRepo = internalQuery({
    args: { repoId: v.id("repos") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.repoId);
    },
});

/**
 * Internal mutation to update repo status
 */
export const updateRepoStatus = internalMutation({
    args: {
        repoId: v.id("repos"),
        status: v.union(
            v.literal("pending"),
            v.literal("active"),
            v.literal("failed")
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.repoId, { status: args.status });
    },
});

/**
 * Reset repository (Danger Zone)
 * Deletes GitHub repo and Convex record for clean restart
 * WARNING: This will delete all uploaded files!
 */
export const resetRepository = mutation({
    args: {
        repoId: v.id("repos"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const repo = await ctx.db.get(args.repoId);
        if (!repo) throw new Error("Repository not found");

        // Verify user has permission (owns the repo)
        if (repo.type === "personal" && repo.entityId !== userId) {
            throw new Error("Not authorized");
        }
        // TODO: Add org ownership check for organizational repos

        // 1. Delete GitHub repository
        await ctx.scheduler.runAfter(0, internal.github.deleteRepository, {
            repoName: repo.githubRepoName,
        });

        // 2. Delete Convex repo record
        await ctx.db.delete(args.repoId);

        return { success: true };
    },
});

/**
 * Check if a user can upload to a repository (internal query)
 */
export const canUserUpload = internalQuery({
    args: {
        repoId: v.id("repos"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const repo = await ctx.db.get(args.repoId);
        if (!repo) return false;

        if (repo.type === "personal") {
            // Check if user owns this personal repo
            return repo.entityId === args.userId;
        }

        if (repo.type === "organization") {
            // Check if user is member of organization
            const orgId = repo.entityId as Id<"organizations">;
            const membership = await ctx.db
                .query("organizationMembers")
                .withIndex("by_org_user", (q) =>
                    q.eq("organizationId", orgId).eq("userId", args.userId)
                )
                .first();

            return !!membership && membership.status === "active";
        }

        return false;
    },
});
