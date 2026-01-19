Building a public file upload system that leverages GitHub + jsDelivr as a free CDN. Users upload files through Next.js UI → Convex temporary storage → GitHub public repos → jsDelivr CDN URLs.

1. Repository Naming Strategy
Recommended Approach: Use Convex IDs
Structure:
Personal repos (scope): p-{userId}
Organization repos (scope): o-{orgId}

Github account username solely used for that purpose:
echoray-io

Examples:
https://github.com/echoray-io/p-m57anw9d97pr8wt114en16gr1h7z76r3
https://github.com/echoray-io/o-kd7a21bs510hq8z49wewp5s24h7z7td9
https://github.com/[Github_Username]/[{scope}-{id}]
Rationale:

✅ Immutable: IDs never change, no broken URLs
✅ No collisions: Guaranteed unique
✅ Privacy: Doesn't expose user emails or names
✅ Simple mapping: Direct 1:1 relationship in database
✅ GitHub compliant: Valid repo names (lowercase, hyphens allowed)

Database Schema:
typescript// Convex schema
repos: defineTable({
  type: v.union(v.literal("personal"), v.literal("organization")),
  entityId: v.id("users") | v.id("organizations"), // The owner
  githubRepoName: v.string(), // "p-m57anw9d97pr8wt114en16gr1h7z76r3"
  githubRepoUrl: v.string(),
  createdAt: v.number(),
  status: v.union(
    v.literal("pending"),
    v.literal("active"),
    v.literal("failed")
  ),
})
```

---

## 2. System Architecture
```
┌─────────────┐
│   User UI   │
│ /p/[name]   │
│ /o/[name]   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Next.js API Route  │
│  /api/upload        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Convex Storage     │ (Temporary)
│  - Validate file    │
│  - Store temp       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  GitHub API Worker  │
│  - Create repo      │
│  - Commit file      │
│  - Return URL       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  jsDelivr CDN       │
│  Public access      │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│  Cleanup Worker     │
│  Delete from Convex │
└─────────────────────┘
```

---

## 3. Folder Structure (GitHub Repos)

**Standard structure for all repos:**
```
p-{userId}/
├── file/       # Generic files (.txt, .json, .csv, etc.)
├── document/   # Documents (.pdf, .docx, .xlsx, etc.)
├── image/      # Images (.jpg, .png, .gif, .webp, .svg)
└── video/      # Videos (.mp4, .mov, .webm, etc.)
Initial repo creation includes:

.gitkeep files in each folder (ensures folders exist)
README.md with usage instructions
All folders created on first repo initialization


4. Database Schema
typescript// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  repos: defineTable({
    type: v.union(v.literal("personal"), v.literal("organization")),
    entityId: v.union(v.id("users"), v.id("organizations")),
    githubRepoName: v.string(),
    githubRepoUrl: v.string(),
    createdAt: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("failed")
    ),
  }).index("by_entity", ["entityId"]),

  uploads: defineTable({
    repoId: v.id("repos"),
    uploadedBy: v.id("users"),
    fileName: v.string(),
    fileType: v.union(
      v.literal("file"),
      v.literal("document"),
      v.literal("image"),
      v.literal("video")
    ),
    filePath: v.string(), // "document/test.pdf"
    convexStorageId: v.optional(v.id("_storage")), // Temporary
    githubCommitSha: v.optional(v.string()),
    cdnUrl: v.optional(v.string()), // jsDelivr URL
    status: v.union(
      v.literal("uploading"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    uploadedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  })
    .index("by_repo", ["repoId"])
    .index("by_user", ["uploadedBy"])
    .index("by_status", ["status"]),
});

5. Implementation Flow
Phase 1: Route Access & Repo Initialization
Route: /p/[name]/upload or /o/[name]/upload
typescript// app/p/[name]/upload/page.tsx

export default async function PersonalUploadPage({
  params,
}: {
  params: { name: string };
}) {
  const user = await getCurrentUser(); // Auth check
  
  // Verify user owns this profile
  const profile = await convex.query(api.users.getByName, { 
    name: params.name 
  });
  
  if (profile._id !== user._id) {
    return <Unauthorized />;
  }

  // Check if repo exists, create if not
  const repo = await convex.mutation(api.repos.ensureRepoExists, {
    type: "personal",
    entityId: user._id,
  });

  return <UploadInterface repo={repo} />;
}
Convex Mutation: Ensure Repo Exists
typescript// convex/repos.ts

export const ensureRepoExists = mutation({
  args: {
    type: v.union(v.literal("personal"), v.literal("organization")),
    entityId: v.union(v.id("users"), v.id("organizations")),
  },
  handler: async (ctx, args) => {
    // Check if repo already exists
    const existing = await ctx.db
      .query("repos")
      .withIndex("by_entity", (q) => q.eq("entityId", args.entityId))
      .first();

    if (existing) {
      return existing;
    }

    // Generate repo name
    const prefix = args.type === "personal" ? "p" : "o";
    const repoName = `${prefix}-${args.entityId}`;

    // Create repo record (pending)
    const repoId = await ctx.db.insert("repos", {
      type: args.type,
      entityId: args.entityId,
      githubRepoName: repoName,
      githubRepoUrl: `https://github.com/echoray-io/${repoName}`,
      createdAt: Date.now(),
      status: "pending",
    });

    // Trigger GitHub repo creation (async action)
    await ctx.scheduler.runAfter(0, internal.github.createRepository, {
      repoId,
      repoName,
    });

    return await ctx.db.get(repoId);
  },
});

Phase 2: GitHub Repository Creation
typescript// convex/github.ts (Internal Action)

import { Octokit } from "@octokit/rest";
import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";

export const createRepository = internalAction({
  args: {
    repoId: v.id("repos"),
    repoName: v.string(),
  },
  handler: async (ctx, args) => {
    const octokit = new Octokit({
      auth: process.env.GITHUB_BOT_TOKEN,
    });

    try {
      // 1. Create repository
      await octokit.repos.createInOrg({
        org: "echoray-io",
        name: args.repoName,
        description: `Asset repository for ${args.repoName}`,
        private: false,
        auto_init: true,
      });

      // 2. Create folder structure with .gitkeep files
      const folders = ["file", "document", "image", "video"];
      
      for (const folder of folders) {
        await octokit.repos.createOrUpdateFileContents({
          owner: "echoray-io",
          repo: args.repoName,
          path: `${folder}/.gitkeep`,
          message: `Initialize ${folder} folder`,
          content: Buffer.from("").toString("base64"),
        });
      }

      // 3. Update repo status to active
      await ctx.runMutation(internal.github.updateRepoStatus, {
        repoId: args.repoId,
        status: "active",
      });

    } catch (error) {
      console.error("GitHub repo creation failed:", error);
      
      await ctx.runMutation(internal.github.updateRepoStatus, {
        repoId: args.repoId,
        status: "failed",
      });
    }
  },
});

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

Phase 3: File Upload Flow
Client Component:
typescript// components/UploadInterface.tsx

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UploadInterface({ repo }: { repo: Repo }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"file" | "document" | "image" | "video">("document");
  const [uploading, setUploading] = useState(false);
  
  const initiateUpload = useMutation(api.uploads.initiateUpload);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      // 1. Get upload URL from Convex
      const { uploadUrl, storageId } = await initiateUpload({
        repoId: repo._id,
        fileName: file.name,
        fileType,
      });

      // 2. Upload to Convex storage
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      // 3. File now processing in background
      // UI will update via Convex reactivity

    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <select value={fileType} onChange={(e) => setFileType(e.target.value)}>
        <option value="file">File</option>
        <option value="document">Document</option>
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>
      
      <input type="file" onChange={(e) => setFile(e.files?.[0] || null)} />
      
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
Convex Upload Mutation:
typescript// convex/uploads.ts

export const initiateUpload = mutation({
  args: {
    repoId: v.id("repos"),
    fileName: v.string(),
    fileType: v.union(
      v.literal("file"),
      v.literal("document"),
      v.literal("image"),
      v.literal("video")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    // Validate file size (20MB limit)
    // Note: This validation should also happen client-side
    
    // Create upload record
    const uploadId = await ctx.db.insert("uploads", {
      repoId: args.repoId,
      uploadedBy: user._id,
      fileName: args.fileName,
      fileType: args.fileType,
      filePath: `${args.fileType}/${args.fileName}`,
      status: "uploading",
      uploadedAt: Date.now(),
    });

    // Generate Convex storage upload URL
    const uploadUrl = await ctx.storage.generateUploadUrl();

    // Schedule processing after upload completes
    await ctx.scheduler.runAfter(5000, internal.uploads.processUpload, {
      uploadId,
    });

    return { uploadUrl, uploadId };
  },
});

Phase 4: GitHub Commit & CDN URL Generation
typescript// convex/uploads.ts

export const processUpload = internalAction({
  args: { uploadId: v.id("uploads") },
  handler: async (ctx, args) => {
    // Get upload record
    const upload = await ctx.runQuery(internal.uploads.getUpload, {
      uploadId: args.uploadId,
    });

    if (!upload || !upload.convexStorageId) {
      return; // Upload not ready yet
    }

    // Get repo details
    const repo = await ctx.runQuery(internal.repos.getRepo, {
      repoId: upload.repoId,
    });

    // Get file from Convex storage
    const fileBlob = await ctx.storage.get(upload.convexStorageId);
    const fileBuffer = await fileBlob.arrayBuffer();

    const octokit = new Octokit({
      auth: process.env.GITHUB_BOT_TOKEN,
    });

    try {
      // Commit file to GitHub
      const commitResponse = await octokit.repos.createOrUpdateFileContents({
        owner: "echoray-io",
        repo: repo.githubRepoName,
        path: upload.filePath,
        message: `Upload ${upload.fileName}`,
        content: Buffer.from(fileBuffer).toString("base64"),
      });

      // Generate jsDelivr CDN URL
      const cdnUrl = `https://cdn.jsdelivr.net/gh/echoray-io/${repo.githubRepoName}@main/${upload.filePath}`;

      // Update upload record
      await ctx.runMutation(internal.uploads.completeUpload, {
        uploadId: args.uploadId,
        githubCommitSha: commitResponse.data.commit.sha,
        cdnUrl,
      });

      // Delete from Convex storage
      await ctx.storage.delete(upload.convexStorageId);

    } catch (error) {
      await ctx.runMutation(internal.uploads.failUpload, {
        uploadId: args.uploadId,
        error: error.message,
      });
    }
  },
});

export const completeUpload = internalMutation({
  args: {
    uploadId: v.id("uploads"),
    githubCommitSha: v.string(),
    cdnUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.uploadId, {
      status: "completed",
      githubCommitSha: args.githubCommitSha,
      cdnUrl: args.cdnUrl,
      completedAt: Date.now(),
      convexStorageId: undefined, // Clear storage ID
    });
  },
});
```

---

## 6. UI/UX Flow
```
1. User navigates to /p/badjarovv/upload
   ↓
2. Check auth & permissions
   ↓
3. ensureRepoExists() - creates repo if needed
   ↓
4. Show upload interface
   - Tab: PUBLIC (active)
   - Tab: PRIVATE (greyed out for MVP)
   ↓
5. User selects file type dropdown (File/Document/Image/Video)
   ↓
6. User selects file (max 20MB validation)
   ↓
7. Click "Upload" button
   ↓
8. Progress indicator shows:
   - Uploading... (to Convex)
   - Processing... (to GitHub)
   - Complete! (show CDN URL)
   ↓
9. Display CDN URL with copy button
   https://cdn.jsdelivr.net/gh/echoray-io/p-m57anw9d97pr8wt114en16gr1h7z76r3/document/test.pdf

7. Environment Variables
bash# .env.local
GITHUB_BOT_TOKEN=ghp_xxxxxxxxxxxxx  # From GitHub settings
CONVEX_DEPLOYMENT=prod:echoray-xxxxx
NEXT_PUBLIC_CONVEX_URL=https://xxxxx.convex.cloud
GitHub Token Permissions Required:

repo (full control)
workflow (if using GitHub Actions later)


8. Error Handling
Key scenarios to handle:

Repo creation fails → Retry logic with exponential backoff
File upload to GitHub fails → Keep in Convex, retry, notify user
File too large → Client-side validation before upload
Invalid file type → MIME type validation
GitHub rate limits → Queue system, max 5000 requests/hour


9. Testing Checklist

 Personal repo creation (/p/[name]/upload)
 Organization repo creation (/o/[name]/upload)
 File upload to each folder type
 jsDelivr CDN URL generation
 Convex storage cleanup after GitHub commit
 Concurrent uploads (multiple users)
 Error states (network failure, GitHub API errors)
 File size validation (20MB limit)
 Permission checks (user can't upload to others' repos)


10. Performance Optimizations
Short-term:

Client-side file compression (images)
Parallel folder creation on repo init
CDN URL caching in database

Long-term:

Background worker queue for uploads
Batch GitHub commits (multiple files)
Webhooks for upload status updates


11. Security Considerations
✅ Authentication: NextAuth or Clerk for user sessions
✅ Authorization: Verify user owns repo before allowing uploads
✅ File validation: MIME type checking, size limits
✅ Rate limiting: Prevent abuse (max uploads per user per hour)
✅ GitHub token: Store securely, never expose client-side
✅ Public repos: Warn users that files are publicly accessible

12. Deployment Checklist
Pre-launch:

 Create echoray-io GitHub organization
 Generate GitHub Personal Access Token
 Set up Convex production deployment
 Configure Cloudflare Workers
 Test end-to-end flow
 Set up monitoring (Sentry for errors)
 Create user documentation

Post-launch monitoring:

GitHub API rate limit usage
Convex storage usage
Upload success/failure rates
Average upload time


13. Future Enhancements (Post-MVP)
Phase 2: Private uploads

GitHub private repos
GitHub API authentication per request
Access control layer

Phase 3: Advanced features

Bulk uploads
Folder organization (custom folders)
File versioning (git history UI)
File deletion
CDN purge on file updates
Analytics (file views, downloads)


Summary
MVP Scope:

✅ Public file uploads only
✅ 4 folder types: file, document, image, video
✅ ID-based repo naming (immutable)
✅ Convex → GitHub → jsDelivr pipeline
✅ Real-time upload status updates
✅ CDN URL generation and display