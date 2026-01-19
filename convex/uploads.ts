import { action, mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Uploads V2 - Direct Browser to GitHub
 * Browser uploads files directly to GitHub API, Convex tracks metadata only
 */

const MAX_FILE_SIZE = 19.9 * 1024 * 1024; // 19.9MB limit (displayed as 20MB)

/**
 * Prepare upload - generates GitHub token and creates upload record
 * This is called BEFORE the browser uploads to GitHub
 */
export const prepareUpload = action({
    args: {
        repoId: v.id("repos"),
        fileName: v.string(),
        fileType: v.union(
            v.literal("file"),
            v.literal("document"),
            v.literal("image"),
            v.literal("video")
        ),
        fileSize: v.number(),
        mimeType: v.string(),
        customFolder: v.optional(v.string()), // Custom folder path (e.g., "assets/images")
    },
    handler: async (ctx, args): Promise<{
        uploadId: Id<"uploads">
        githubToken: string
        owner: string
        repo: string
        branch: string
        filePath: string
    }> => {
        // 1. Authenticate user and get userId
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // 2. Validate file size (100MB GitHub limit)
        if (args.fileSize > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds maximum of 100MB`);
        }

        // 3. Get repo details
        const repo = await ctx.runQuery(internal.repos.getRepo, {
            repoId: args.repoId,
        });

        if (!repo || repo.status !== "active") {
            throw new Error("Repository not ready for uploads");
        }

        // 4. Verify user has permission to upload
        const canUpload = await ctx.runQuery(internal.repos.canUserUpload, {
            repoId: args.repoId,
            userId,
        });

        if (!canUpload) {
            throw new Error("Not authorized to upload to this repository");
        }

        // 5. Create upload record with custom folder path
        const folderPath = args.customFolder || args.fileType; // Use custom folder or default to file type
        const uploadId = await ctx.runMutation(internal.uploads.createUploadRecord, {
            repoId: args.repoId,
            uploadedBy: userId,
            fileName: args.fileName,
            fileType: args.fileType,
            fileSize: args.fileSize,
            mimeType: args.mimeType,
            filePath: `${folderPath}/${args.fileName}`,
        });

        // 6. Return GitHub upload credentials
        // TODO: For production, use temporary tokens or GitHub App installation tokens
        // For now, using main token since we're pre-launch
        return {
            uploadId,
            githubToken: process.env.GITHUB_BOT_TOKEN!,
            owner: "echoray-io",
            repo: repo.githubRepoName,
            branch: "main",
            filePath: `${folderPath}/${args.fileName}`,
        };
    },
});

/**
 * Create upload record (internal mutation)
 */
export const createUploadRecord = internalMutation({
    args: {
        repoId: v.id("repos"),
        uploadedBy: v.id("users"),
        fileName: v.string(),
        fileType: v.union(
            v.literal("file"),
            v.literal("document"),
            v.literal("image"),
            v.literal("video")
        ),
        fileSize: v.number(),
        mimeType: v.string(),
        filePath: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("uploads", {
            ...args,
            status: "preparing",
            uploadProgress: 0,
            uploadedAt: Date.now(),
        });
    },
});

/**
 * Complete upload (called by client after successful GitHub upload)
 */
export const completeUpload = mutation({
    args: {
        uploadId: v.id("uploads"),
        githubCommitSha: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Authenticate user
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // 2. Get upload record
        const upload = await ctx.db.get(args.uploadId);
        if (!upload) throw new Error("Upload not found");

        // 3. Verify user owns this upload
        if (upload.uploadedBy !== userId) {
            throw new Error("Not authorized");
        }

        // 4. Get repo details
        const repo = await ctx.db.get(upload.repoId);
        if (!repo) throw new Error("Repository not found");

        // 5. Generate CDN URL
        const cdnUrl = `https://cdn.jsdelivr.net/gh/echoray-io/${repo.githubRepoName}@main/${upload.filePath}`;

        // 6. Update upload record
        await ctx.db.patch(args.uploadId, {
            status: "completed",
            githubCommitSha: args.githubCommitSha,
            cdnUrl,
            uploadProgress: 100,
            completedAt: Date.now(),
        });

        return { cdnUrl };
    },
});

/**
 * Update upload progress (for real-time UI updates)
 */
export const updateUploadProgress = mutation({
    args: {
        uploadId: v.id("uploads"),
        progress: v.number(), // 0-100
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const upload = await ctx.db.get(args.uploadId);
        if (!upload || upload.uploadedBy !== userId) {
            throw new Error("Not authorized");
        }

        await ctx.db.patch(args.uploadId, {
            uploadProgress: args.progress,
            status: args.progress > 0 ? "uploading_to_github" : "preparing",
        });
    },
});

/**
 * Mark upload as failed
 */
export const failUpload = mutation({
    args: {
        uploadId: v.id("uploads"),
        error: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const upload = await ctx.db.get(args.uploadId);
        if (!upload || upload.uploadedBy !== userId) {
            throw new Error("Not authorized");
        }

        await ctx.db.patch(args.uploadId, {
            status: "failed",
            error: args.error,
            completedAt: Date.now(),
        });
    },
});

/**
 * Get upload details (internal query)
 */
export const getUpload = internalQuery({
    args: { uploadId: v.id("uploads") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.uploadId);
    },
});

/**
 * Get user's uploads (with optional filtering)
 */
export const getUserUploads = query({
    args: {
        repoId: v.optional(v.id("repos")),
        status: v.optional(v.union(
            v.literal("preparing"),
            v.literal("uploading_to_github"),
            v.literal("completed"),
            v.literal("failed")
        )),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return [];

        let uploadsQuery = ctx.db
            .query("uploads")
            .withIndex("by_user", (q) => q.eq("uploadedBy", userId));

        const uploads = await uploadsQuery.collect();

        // Filter by repo if specified
        let filtered = args.repoId
            ? uploads.filter(u => u.repoId === args.repoId)
            : uploads;

        // Filter by status if specified
        if (args.status) {
            filtered = filtered.filter(u => u.status === args.status);
        }

        // Sort by most recent first
        return filtered.sort((a, b) => b.uploadedAt - a.uploadedAt);
    },
});

/**
 * Get a single upload by ID
 */
export const getUploadById = query({
    args: { uploadId: v.id("uploads") },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;

        const upload = await ctx.db.get(args.uploadId);

        // Only return if user is the uploader
        if (upload && upload.uploadedBy === userId) {
            return upload;
        }

        return null;
    },
});
