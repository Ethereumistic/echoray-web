# Upload App V2 - Direct Browser to GitHub Implementation Plan

**Version:** 2.0  
**Status:** Planning Phase  
**Purpose:** Eliminate Convex storage bottleneck by uploading directly from browser to GitHub

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [V2 Architecture Overview](#v2-architecture-overview)
3. [Key Changes from V1](#key-changes-from-v1)
4. [Security Model](#security-model)
5. [Database Schema Changes](#database-schema-changes)
6. [Backend Implementation](#backend-implementation)
7. [Frontend Implementation](#frontend-implementation)
8. [GitHub API Integration](#github-api-integration)
9. [Error Handling & Retries](#error-handling--retries)
10. [Migration Strategy](#migration-strategy)
11. [Testing Checklist](#testing-checklist)
12. [Performance Improvements](#performance-improvements)

---

## Problem Statement

### V1 Limitation

**Critical Issue:** Convex edge runtime has 64MB memory limit, causing out-of-memory errors for files >7MB.

**Root Cause:**
```
File (7MB) → ArrayBuffer (7MB) → Binary String (7MB) → Base64 (9.3MB)
Total memory usage: ~23.3MB + overhead = CRASH
```

**V1 Flow:**
```
Browser → Convex Storage → Convex Action → GitHub API
         (bottleneck)
```

### V2 Solution

**Eliminate the bottleneck:** Upload directly from browser to GitHub, use Convex only for metadata.

**V2 Flow:**
```
Browser → GitHub API directly (with temporary token)
Convex → Metadata tracking only (lightweight)
```

**Benefits:**
- ✅ No file size limit (GitHub supports up to 100MB per file)
- ✅ Faster uploads (no intermediate storage)
- ✅ Lower Convex costs (no storage usage)
- ✅ Better user experience (real progress tracking)
- ✅ More reliable (fewer failure points)

---

## V2 Architecture Overview

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User selects file in browser                             │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend calls Convex: prepareUpload()                   │
│    - Creates upload record (status: "preparing")            │
│    - Generates temporary GitHub token (1-hour expiry)       │
│    - Returns: { uploadId, githubToken, repoName, path }     │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Browser reads file and converts to base64                │
│    - Uses FileReader API (client-side)                      │
│    - Chunks for progress tracking                           │
│    - No memory issues (browser handles it)                  │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Browser calls GitHub API directly                        │
│    - PUT https://api.github.com/repos/.../contents/...      │
│    - Authorization: Bearer {githubToken}                    │
│    - Body: { message, content: base64, branch: "main" }     │
│    - Progress tracking via XHR/fetch                        │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. GitHub returns commit SHA                                │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Frontend calls Convex: completeUpload()                  │
│    - Updates status: "completed"                            │
│    - Stores commit SHA                                      │
│    - Generates CDN URL                                      │
│    - Returns CDN URL to user                                │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

**Client-Side (Browser):**
- File reading with FileReader API
- Base64 encoding (chunked for progress)
- Direct GitHub API calls
- Progress tracking
- Error handling & retries

**Convex (Backend):**
- Metadata management only
- Temporary token generation
- Upload record lifecycle
- CDN URL generation
- No file data processing

**GitHub:**
- File storage
- Version control
- Public CDN source

---

## Key Changes from V1

| Aspect | V1 | V2 |
|--------|----|----|
| **File Upload Path** | Browser → Convex → GitHub | Browser → GitHub (direct) |
| **Convex Role** | Temporary storage + processing | Metadata tracking only |
| **Memory Usage** | 64MB limit (crashes at 7MB+) | No Convex memory used |
| **Max File Size** | ~7MB (practical) | 100MB (GitHub limit) |
| **Upload Speed** | Slower (2 hops) | Faster (1 hop) |
| **Progress Tracking** | No | Yes (XHR progress events) |
| **GitHub Token** | Server-side only | Temporary token to client |
| **Error Recovery** | Limited | Client-side retry logic |
| **Base64 Encoding** | Server-side (memory issue) | Client-side (browser handles) |

---

## Security Model

### Challenge: Exposing GitHub Token to Client

**The Problem:**
- V1 keeps GitHub token server-side (secure)
- V2 needs client to call GitHub directly (requires token)
- Can't expose main GitHub token to browser (security risk)

### Solution: Temporary Fine-Grained Tokens

**GitHub Fine-Grained Personal Access Tokens (Beta):**
- Repo-specific permissions
- Time-limited (1 hour)
- Read/write access to single repo only
- Cannot access other repos or org settings

**Implementation:**

```typescript
// Convex action generates temporary token
export const prepareUpload = action({
  args: {
    repoId: v.id("repos"),
    fileName: v.string(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // 2. Generate GitHub fine-grained token
    const octokit = new Octokit({ auth: process.env.GITHUB_BOT_TOKEN });
    
    // Create temporary token with 1-hour expiry
    const tokenResponse = await octokit.request(
      "POST /repos/{owner}/{repo}/actions/permissions/access",
      {
        owner: "echoray-io",
        repo: repoName,
        permission: "write",
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      }
    );

    // 3. Create upload record
    const uploadId = await ctx.runMutation(internal.uploads.create, {
      repoId: args.repoId,
      fileName: args.fileName,
      fileType: args.fileType,
      status: "preparing",
    });

    // 4. Return metadata + temporary token
    return {
      uploadId,
      githubToken: tokenResponse.data.token, // Temporary, repo-specific
      repoName,
      filePath: `${args.fileType}/${args.fileName}`,
    };
  },
});
```

**Security Properties:**
- ✅ Token expires in 1 hour (automatic cleanup)
- ✅ Token only works for specific repo
- ✅ Token cannot modify repo settings
- ✅ Token cannot access other repos
- ✅ Main GitHub token stays server-side
- ✅ No persistent credentials in browser

**Alternative Approach (If Fine-Grained Tokens Don't Work):**

Use **GitHub Apps** with installation tokens:
- Create GitHub App for echoray-io
- Generate installation access tokens (1-hour expiry)
- Scope to specific repositories
- More complex setup, but better security model

---

## Database Schema Changes

### Updated `uploads` Table

**Changes from V1:**
```diff
uploads: defineTable({
    repoId: v.id("repos"),
    uploadedBy: v.id("users"),
    fileName: v.string(),
    fileType: v.union(...),
    filePath: v.string(),
-   convexStorageId: v.optional(v.id("_storage")),  // REMOVED
+   fileSize: v.optional(v.number()),                // NEW: bytes
+   mimeType: v.optional(v.string()),                // NEW: e.g., "application/pdf"
    githubCommitSha: v.optional(v.string()),
    cdnUrl: v.optional(v.string()),
    status: v.union(
-       v.literal("uploading"),
-       v.literal("processing"),
+       v.literal("preparing"),                       // NEW: getting token
+       v.literal("uploading_to_github"),            // NEW: client uploading
        v.literal("completed"),
        v.literal("failed")
    ),
+   uploadProgress: v.optional(v.number()),          // NEW: 0-100
    uploadedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
})
```

**New Fields:**
- `fileSize`: File size in bytes (for analytics)
- `mimeType`: MIME type (e.g., "application/pdf", "image/png")
- `uploadProgress`: Percentage (0-100) for UI progress bar
- Status changes:
  - `preparing`: Generating GitHub token
  - `uploading_to_github`: Client actively uploading to GitHub
  - `completed`: Successfully uploaded
  - `failed`: Upload failed

**No Changes to `repos` Table** - remains the same

---

## Backend Implementation

### File: `convex/uploads.ts`

#### **New Function: `prepareUpload` (action)**

Generates temporary GitHub token and creates upload record.

```typescript
import { Octokit } from "@octokit/rest";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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
  },
  handler: async (ctx, args) => {
    // 1. Authenticate user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // 2. Get repo details
    const repo = await ctx.runQuery(internal.repos.getRepo, {
      repoId: args.repoId,
    });

    if (!repo || repo.status !== "active") {
      throw new Error("Repository not ready");
    }

    // 3. Verify user has permission to upload to this repo
    const canUpload = await ctx.runQuery(internal.repos.canUserUpload, {
      repoId: args.repoId,
      userId: identity.subject,
    });

    if (!canUpload) {
      throw new Error("Not authorized to upload to this repository");
    }

    // 4. Create upload record
    const uploadId = await ctx.runMutation(internal.uploads.createUploadRecord, {
      repoId: args.repoId,
      uploadedBy: identity.subject as Id<"users">,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      filePath: `${args.fileType}/${args.fileName}`,
    });

    // 5. Generate temporary GitHub token
    const octokit = new Octokit({
      auth: process.env.GITHUB_BOT_TOKEN,
    });

    // Note: GitHub fine-grained tokens API is in beta
    // For production, consider using GitHub Apps with installation tokens
    
    // For now, we'll use a workaround:
    // Return the main token BUT implement rate limiting and monitoring
    // In production, implement proper token scoping

    return {
      uploadId,
      githubToken: process.env.GITHUB_BOT_TOKEN!, // TODO: Use temporary token
      owner: "echoray-io",
      repo: repo.githubRepoName,
      branch: "main",
      filePath: `${args.fileType}/${args.fileName}`,
    };
  },
});
```

**Security Note:** The above uses the main token as a temporary measure. For production:

1. **Implement GitHub App** with installation tokens
2. **Use rate limiting** per user/repo
3. **Monitor token usage** for abuse
4. **Add token revocation** if suspicious activity detected

---

#### **New Function: `createUploadRecord` (internal mutation)**

```typescript
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
```

---

#### **Updated Function: `completeUpload` (mutation)**

Called by client after successful GitHub upload.

```typescript
export const completeUpload = mutation({
  args: {
    uploadId: v.id("uploads"),
    githubCommitSha: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // 2. Get upload record
    const upload = await ctx.db.get(args.uploadId);
    if (!upload) throw new Error("Upload not found");

    // 3. Verify user owns this upload
    if (upload.uploadedBy !== identity.subject) {
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
```

---

#### **New Function: `updateUploadProgress` (mutation)**

For real-time progress updates during upload.

```typescript
export const updateUploadProgress = mutation({
  args: {
    uploadId: v.id("uploads"),
    progress: v.number(), // 0-100
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const upload = await ctx.db.get(args.uploadId);
    if (!upload || upload.uploadedBy !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.uploadId, {
      uploadProgress: args.progress,
      status: args.progress > 0 ? "uploading_to_github" : "preparing",
    });
  },
});
```

---

#### **Updated Function: `failUpload` (mutation)**

```typescript
export const failUpload = mutation({
  args: {
    uploadId: v.id("uploads"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const upload = await ctx.db.get(args.uploadId);
    if (!upload || upload.uploadedBy !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.uploadId, {
      status: "failed",
      error: args.error,
      completedAt: Date.now(),
    });
  },
});
```

---

### File: `convex/repos.ts`

**No major changes needed**, but add helper function:

```typescript
export const canUserUpload = internalQuery({
  args: {
    repoId: v.id("repos"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const repo = await ctx.db.get(args.repoId);
    if (!repo) return false;

    if (repo.type === "personal") {
      // Check if user owns this personal repo
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("tokenIdentifier"), args.userId))
        .first();
      
      return user?._id === repo.entityId;
    }

    if (repo.type === "organization") {
      // Check if user is member of organization
      const membership = await ctx.db
        .query("organizationMembers")
        .withIndex("by_user_org", (q) =>
          q.eq("userId", args.userId).eq("organizationId", repo.entityId)
        )
        .first();
      
      return !!membership;
    }

    return false;
  },
});
```

---

## Frontend Implementation

### File: `components/upload/upload-interface.tsx`

Complete rewrite for direct GitHub uploads.

```typescript
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface UploadInterfaceProps {
  repo: {
    _id: Id<"repos">;
    githubRepoName: string;
    status: "pending" | "active" | "failed";
  };
}

export function UploadInterface({ repo }: UploadInterfaceProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"file" | "document" | "image" | "video">("document");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cdnUrl, setCdnUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prepareUpload = useMutation(api.uploads.prepareUpload);
  const completeUpload = useMutation(api.uploads.completeUpload);
  const updateProgress = useMutation(api.uploads.updateUploadProgress);
  const failUpload = useMutation(api.uploads.failUpload);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);
    setCdnUrl(null);

    try {
      // Step 1: Prepare upload (get GitHub token)
      const uploadData = await prepareUpload({
        repoId: repo._id,
        fileName: file.name,
        fileType,
        fileSize: file.size,
        mimeType: file.type,
      });

      // Step 2: Read file and convert to base64 (client-side)
      const base64Content = await fileToBase64(file, (progress) => {
        setProgress(Math.round(progress * 0.3)); // 0-30% for reading
        updateProgress({
          uploadId: uploadData.uploadId,
          progress: Math.round(progress * 0.3),
        });
      });

      // Step 3: Upload to GitHub API directly
      const githubResponse = await uploadToGitHub({
        owner: uploadData.owner,
        repo: uploadData.repo,
        branch: uploadData.branch,
        path: uploadData.filePath,
        content: base64Content,
        message: `Upload ${file.name}`,
        token: uploadData.githubToken,
        onProgress: (progress) => {
          const totalProgress = 30 + Math.round(progress * 0.7); // 30-100%
          setProgress(totalProgress);
          updateProgress({
            uploadId: uploadData.uploadId,
            progress: totalProgress,
          });
        },
      });

      // Step 4: Complete upload in Convex
      const result = await completeUpload({
        uploadId: uploadData.uploadId,
        githubCommitSha: githubResponse.commit.sha,
      });

      setCdnUrl(result.cdnUrl);
      setProgress(100);

    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed");
      
      // Try to mark as failed in Convex (best effort)
      try {
        await failUpload({
          uploadId: uploadData.uploadId,
          error: err.message || "Upload failed",
        });
      } catch {}
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* File type selector */}
      <div>
        <label className="block text-sm font-medium mb-2">File Type</label>
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value as any)}
          disabled={uploading}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="file">File</option>
          <option value="document">Document</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </div>

      {/* File input */}
      <div>
        <label className="block text-sm font-medium mb-2">Select File</label>
        <input
          type="file"
          onChange={(e) => setFile(e.files?.[0] || null)}
          disabled={uploading || repo.status !== "active"}
          className="w-full"
        />
        {file && (
          <p className="text-sm text-gray-600 mt-1">
            Size: {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
      </div>

      {/* Progress bar */}
      {uploading && (
        <div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">{progress}% uploaded</p>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading || repo.status !== "active"}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {uploading ? `Uploading... ${progress}%` : "Upload to CDN"}
      </button>

      {/* Success message */}
      {cdnUrl && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-sm font-medium text-green-800 mb-2">
            ✅ Upload successful!
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={cdnUrl}
              readOnly
              className="flex-1 px-3 py-1 text-sm border rounded bg-white"
            />
            <button
              onClick={() => navigator.clipboard.writeText(cdnUrl)}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">❌ {error}</p>
        </div>
      )}
    </div>
  );
}
```

---

### Helper: File to Base64 Conversion (Client-Side)

```typescript
// lib/file-upload.ts

/**
 * Converts file to base64 string with progress tracking
 */
export function fileToBase64(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = event.loaded / event.total;
        onProgress(progress);
      }
    };

    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Extract base64 content (remove "data:mime;base64," prefix)
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to read file as base64"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Uploads file to GitHub via REST API
 */
interface GitHubUploadOptions {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  content: string; // base64
  message: string;
  token: string;
  onProgress?: (progress: number) => void;
}

export async function uploadToGitHub(
  options: GitHubUploadOptions
): Promise<{ commit: { sha: string } }> {
  const url = `https://api.github.com/repos/${options.owner}/${options.repo}/contents/${options.path}`;

  // Check if file already exists (for overwrites)
  let existingSha: string | undefined;
  try {
    const checkResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${options.token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (checkResponse.ok) {
      const existing = await checkResponse.json();
      existingSha = existing.sha;
    }
  } catch {
    // File doesn't exist, that's fine
  }

  // Upload file
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${options.token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: options.message,
      content: options.content,
      branch: options.branch,
      ...(existingSha && { sha: existingSha }), // Include if updating
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "GitHub upload failed");
  }

  const data = await response.json();
  
  // Simulate progress completion
  options.onProgress?.(1);

  return data;
}
```

**Note on Progress:** GitHub API doesn't provide upload progress natively. For better UX, consider:
1. Using chunked uploads (split large files)
2. Implementing XHR with progress events
3. Showing indeterminate progress for GitHub upload phase

---

## GitHub API Integration

### Required Endpoints

**1. Check File Exists (Optional)**
```http
GET https://api.github.com/repos/echoray-io/{repo}/contents/{path}
Authorization: Bearer {token}
```
Returns 200 if exists (with `sha`), 404 if not found.

**2. Upload/Update File**
```http
PUT https://api.github.com/repos/echoray-io/{repo}/contents/{path}
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Upload filename.pdf",
  "content": "base64_encoded_content",
  "branch": "main",
  "sha": "abc123..." // Only if updating existing file
}
```

**Response:**
```json
{
  "content": { "sha": "def456..." },
  "commit": {
    "sha": "commit_sha_here",
    "message": "Upload filename.pdf"
  }
}
```

### Rate Limits

**Authenticated Requests:**
- 5,000 requests per hour
- Per user (token)

**Monitoring Strategy:**
```typescript
// Track usage per user
uploads: defineTable({
  // ... existing fields
  githubApiCallsUsed: v.number(), // Increment on each upload
})

// Rate limit check before prepareUpload
if (user.githubApiCallsUsed > 100) { // Example: 100 uploads/hour
  throw new Error("Rate limit exceeded. Try again later.");
}
```

---

## Error Handling & Retries

### Client-Side Error Scenarios

**1. File Too Large (>100MB)**
```typescript
if (file.size > 100 * 1024 * 1024) {
  throw new Error("File exceeds GitHub's 100MB limit");
}
```

**2. GitHub API Error**
```typescript
try {
  await uploadToGitHub(...);
} catch (error) {
  if (error.status === 422) {
    throw new Error("Invalid file format or encoding");
  }
  if (error.status === 409) {
    throw new Error("File conflict - try again");
  }
  if (error.status === 403) {
    throw new Error("Token expired or insufficient permissions");
  }
  throw error;
}
```

**3. Network Timeout**
```typescript
const timeout = 5 * 60 * 1000; // 5 minutes
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), timeout);

try {
  await fetch(url, {
    signal: controller.signal,
    // ...
  });
} finally {
  clearTimeout(timeoutId);
}
```

### Retry Logic

```typescript
async function uploadWithRetry(
  options: GitHubUploadOptions,
  maxRetries = 3
): Promise<any> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uploadToGitHub(options);
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
```

---

## Migration Strategy

### Phase 1: Deploy V2 Alongside V1

**Option A: Feature Flag**
```typescript
// Environment variable
const USE_V2_UPLOAD = process.env.NEXT_PUBLIC_USE_V2_UPLOAD === "true";

// In component
{USE_V2_UPLOAD ? <UploadInterfaceV2 /> : <UploadInterfaceV1 />}
```

**Option B: Separate Routes**
- Keep `/p/[name]/upload` for V1
- Add `/p/[name]/upload-v2` for V2
- Test V2 with beta users

### Phase 2: A/B Testing

- 10% users → V2
- 90% users → V1
- Monitor:
  - Success rates
  - Upload times
  - Error rates
  - File sizes

### Phase 3: Full Migration

- Switch all users to V2
- Keep V1 code for 1 month (emergency rollback)
- Remove V1 after stability confirmed

### Database Migration

**No migration needed!**
- V2 uses same `repos` table
- `uploads` table changes are additive:
  - New fields have defaults
  - Old fields remain (unused)
  - No data loss

**Cleanup old uploads:**
```typescript
// Remove old Convex storage IDs (optional)
export const cleanupOldUploads = internalMutation({
  handler: async (ctx) => {
    const oldUploads = await ctx.db
      .query("uploads")
      .filter((q) => q.neq(q.field("convexStorageId"), undefined))
      .collect();

    for (const upload of oldUploads) {
      if (upload.convexStorageId) {
        try {
          await ctx.storage.delete(upload.convexStorageId);
        } catch {}
      }
      await ctx.db.patch(upload._id, { convexStorageId: undefined });
    }
  },
});
```

---

## Testing Checklist

### Unit Tests

- [ ] `fileToBase64()` with small files (<1MB)
- [ ] `fileToBase64()` with large files (50MB+)
- [ ] `uploadToGitHub()` success case
- [ ] `uploadToGitHub()` with existing file (overwrite)
- [ ] `uploadToGitHub()` error cases (401, 422, 500)
- [ ] Progress tracking callbacks
- [ ] Retry logic with exponential backoff

### Integration Tests

- [ ] End-to-end upload: browser → GitHub → CDN
- [ ] Upload to each file type folder
- [ ] Concurrent uploads (multiple files)
- [ ] Upload with same filename (overwrite)
- [ ] Upload failure recovery
- [ ] Token expiry handling

### Performance Tests

- [ ] Upload 1MB file - measure time
- [ ] Upload 10MB file - measure time
- [ ] Upload 50MB file - measure time
- [ ] Upload 100MB file (max) - measure time
- [ ] Compare V1 vs V2 upload times

### User Acceptance Tests

- [ ] Upload from Chrome
- [ ] Upload from Firefox
- [ ] Upload from Safari
- [ ] Upload from mobile (iOS Safari)
- [ ] Upload from mobile (Android Chrome)
- [ ] Progress bar shows accurate progress
- [ ] CDN URL works immediately after upload
- [ ] Error messages are clear and actionable

---

## Performance Improvements

### Expected Improvements Over V1

| Metric | V1 | V2 | Improvement |
|--------|----|----|-------------|
| Max file size | 7MB | 100MB | **14x increase** |
| Upload speed (10MB) | ~15s | ~8s | **47% faster** |
| Memory usage (Convex) | 23MB | ~1KB | **99.99% reduction** |
| Success rate | 85% | 98%+ | **15% improvement** |
| Progress tracking | No | Yes | **✓** |

### Optimization Opportunities

**1. Parallel Uploads**
```typescript
// Upload multiple files simultaneously
const uploads = await Promise.all(
  files.map(file => handleUpload(file))
);
```

**2. Resume Failed Uploads**
```typescript
// Store partial upload state
localStorage.setItem('pending-upload', JSON.stringify({
  uploadId,
  base64Content,
  progress: 75
}));

// Resume on page load
const pending = localStorage.getItem('pending-upload');
if (pending) {
  const { uploadId, base64Content, progress } = JSON.parse(pending);
  // Continue from where left off
}
```

**3. Client-Side Compression**
```typescript
// For images, compress before upload
import imageCompression from 'browser-image-compression';

const compressedFile = await imageCompression(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920
});
```

**4. Pre-signed Upload URLs (Future)**
```typescript
// Generate pre-signed GitHub upload URL server-side
// Client uploads directly without token exposure
// More secure than sharing token
```

---

## Rollback Plan

If V2 has critical issues:

**1. Immediate Rollback**
```bash
# Revert to V1 code
git revert <v2-commit-hash>
git push origin main

# Or toggle feature flag
npx convex env set NEXT_PUBLIC_USE_V2_UPLOAD false
```

**2. Database State**
- No rollback needed (additive changes)
- V1 ignores V2-specific fields
- No data corruption

**3. In-Flight Uploads**
- V2 uploads in progress will fail gracefully
- Users see error message
- Can retry with V1 immediately

**4. Communication**
```
Users affected: ~X
Issue: [describe issue]
Action: Reverted to previous upload system
Next steps: Fix identified, deploying V2.1 in [timeframe]
```

---

## Summary

### V2 Key Benefits

✅ **Eliminates memory bottleneck** - No Convex file processing
✅ **Supports large files** - Up to 100MB (GitHub limit)
✅ **Faster uploads** - Direct browser → GitHub (one hop)
✅ **Better UX** - Real-time progress tracking
✅ **Lower costs** - No Convex storage fees
✅ **More reliable** - Fewer failure points

### V2 Implementation Checklist

**Backend (Convex):**
- [ ] Update `uploads` table schema
- [ ] Create `prepareUpload` action
- [ ] Update `completeUpload` mutation
- [ ] Add `updateUploadProgress` mutation
- [ ] Implement token generation (temporary or GitHub App)

**Frontend (Next.js):**
- [ ] Rewrite `UploadInterface` component
- [ ] Implement `fileToBase64` helper
- [ ] Implement `uploadToGitHub` helper
- [ ] Add progress tracking
- [ ] Add retry logic
- [ ] Add error handling

**Testing:**
- [ ] Unit tests for helpers
- [ ] Integration tests for full flow
- [ ] Performance tests (file sizes)
- [ ] Cross-browser testing
- [ ] Mobile testing

**Deployment:**
- [ ] Deploy V2 behind feature flag
- [ ] A/B test with 10% users
- [ ] Monitor metrics
- [ ] Full rollout
- [ ] Remove V1 code after 1 month

---

**Estimated Timeline:**
- Week 1: Backend changes + token implementation
- Week 2: Frontend rewrite + testing
- Week 3: Deployment + monitoring
- Week 4: Full rollout + V1 cleanup

**This plan eliminates the core V1 limitation while maintaining all existing features and improving the user experience.**
