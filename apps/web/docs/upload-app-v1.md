# Upload App V1 - Complete Technical Documentation

**Version:** 1.0  
**Last Updated:** 2026-01-18  
**Status:** MVP Implementation Complete (with known limitations)

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Backend Functions](#backend-functions)
5. [Frontend Components](#frontend-components)
6. [Environment Configuration](#environment-configuration)
7. [File Upload Flow](#file-upload-flow)
8. [GitHub Integration](#github-integration)
9. [Known Limitations](#known-limitations)
10. [Troubleshooting](#troubleshooting)
11. [Future Enhancements](#future-enhancements)

---

## System Overview

### Purpose
The Upload App enables users to upload files through a Next.js interface, temporarily store them in Convex, push them to public GitHub repositories under the `echoray-io` account, and serve them via jsDelivr CDN.

### Key Features
- ✅ Personal and organizational file uploads
- ✅ Four file type categories (file, document, image, video)
- ✅ Real-time upload status tracking
- ✅ Automatic GitHub repository creation
- ✅ CDN URL generation (jsDelivr)
- ✅ Repository reset functionality (danger zone)
- ✅ Client-side file size validation (10MB limit)

### Technology Stack
- **Frontend:** Next.js, React, TypeScript
- **Backend:** Convex (serverless functions)
- **Storage:** Convex temporary storage → GitHub repositories
- **CDN:** jsDelivr
- **GitHub API:** @octokit/rest v22.0.1

---

## Architecture

### High-Level Flow

```
User Browser
    ↓ (1) Select file & type
Next.js UI (upload-interface.tsx)
    ↓ (2) initiateUpload()
Convex Backend (uploads.ts)
    ↓ (3) Generate upload URL
Convex Storage (temporary)
    ↓ (4) markUploadReady()
Convex Action (processUpload)
    ↓ (5) Get file from storage
    ↓ (6) commitFileToGitHub()
GitHub API (echoray-io/{repo-name})
    ↓ (7) File committed to repo
jsDelivr CDN
    ↓ (8) CDN URL returned to user
Convex Cleanup
    ↓ (9) Delete from Convex storage
```

### Repository Structure on GitHub

Each user/organization gets one repository:
- **Personal repos:** `p-{userId}` (e.g., `p-m576hw45x5ehhs0k03avxrb8a17z73zf`)
- **Organization repos:** `o-{orgId}` (e.g., `o-m57anw9d97pr8wt114en16gr1h7z76r3`)

Each repository contains 4 folders:
```
p-{userId}/
├── file/
│   └── .gitkeep
├── document/
│   └── .gitkeep
├── image/
│   └── .gitkeep
└── video/
    └── .gitkeep
```

### GitHub Account
- **Account:** `echoray-io`
- **Type:** Personal account (not organization)
- **Public repositories:** Yes (all repos are public for CDN access)

---

## Database Schema

### Table: `repos`

Tracks GitHub repositories for personal and organizational scopes.

```typescript
repos: defineTable({
    type: v.union(v.literal("personal"), v.literal("organization")),
    entityId: v.union(v.id("users"), v.id("organizations")),
    githubRepoName: v.string(),      // e.g., "p-m576hw45x5ehhs0k03avxrb8a17z73zf"
    githubRepoUrl: v.string(),       // e.g., "https://github.com/echoray-io/p-..."
    createdAt: v.number(),
    status: v.union(
        v.literal("pending"),
        v.literal("active"),
        v.literal("failed")
    ),
})
.index("by_entity", ["entityId"])
.index("by_status", ["status"])
```

**Field Descriptions:**
- `type`: "personal" or "organization"
- `entityId`: User ID or Organization ID
- `githubRepoName`: Name of the GitHub repository (format: `{type}-{entityId}`)
- `githubRepoUrl`: Full GitHub URL to the repository
- `createdAt`: Timestamp when repo record was created
- `status`: 
  - `pending`: Repo creation in progress
  - `active`: Repo ready for uploads
  - `failed`: Repo creation failed

**Indexes:**
- `by_entity`: Find repo by user/org ID (most common query)
- `by_status`: Filter repos by status (for debugging)

---

### Table: `uploads`

Tracks individual file upload lifecycle.

```typescript
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
    filePath: v.string(),                    // e.g., "document/report.pdf"
    convexStorageId: v.optional(v.id("_storage")),
    githubCommitSha: v.optional(v.string()),
    cdnUrl: v.optional(v.string()),
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
.index("by_status", ["status"])
```

**Field Descriptions:**
- `repoId`: Reference to repos table
- `uploadedBy`: User who uploaded the file
- `fileName`: Original filename (e.g., "report.pdf")
- `fileType`: Category (file, document, image, video)
- `filePath`: Path within GitHub repo (e.g., "document/report.pdf")
- `convexStorageId`: Temporary Convex storage ID (cleared after upload)
- `githubCommitSha`: Git commit SHA after successful push
- `cdnUrl`: Final jsDelivr CDN URL
- `status`:
  - `uploading`: File being uploaded to Convex
  - `processing`: Moving from Convex to GitHub
  - `completed`: Successfully uploaded to GitHub + CDN URL generated
  - `failed`: Upload failed (see error field)
- `uploadedAt`: Timestamp when upload started
- `completedAt`: Timestamp when upload finished (success or failure)
- `error`: Error message if status is "failed"

**Indexes:**
- `by_repo`: Get all uploads for a repository
- `by_user`: Get user's upload history
- `by_status`: Filter by status (for monitoring)

---

## Backend Functions

### File: `convex/repos.ts`

#### `ensureRepoExists` (mutation)

Ensures a GitHub repository exists for the given entity.

```typescript
export const ensureRepoExists = mutation({
    args: {
        type: v.union(v.literal("personal"), v.literal("organization")),
        entityId: v.union(v.id("users"), v.id("organizations")),
    },
    handler: async (ctx, args) => { /* ... */ }
});
```

**Behavior:**
1. Checks if repo record exists in database
2. If exists, returns existing record
3. If not exists:
   - Creates repo record with `status: "pending"`
   - Generates repo name: `{type}-{entityId}`
   - Schedules async GitHub repo creation via `internal.github.createRepository`
   - Returns the new repo record

**Repository Naming:**
- Personal: `p-{userId}` (e.g., `p-m576hw45x5ehhs0k03avxrb8a17z73zf`)
- Organization: `o-{orgId}` (e.g., `o-m57anw9d97pr8wt114en16gr1h7z76r3`)

**Why this naming?**
- Immutable IDs prevent naming conflicts
- No PII (personally identifiable information) in repo names
- GitHub-compliant names (lowercase, hyphens allowed)
- Easy to map back to entities

---

#### `getRepoByEntity` (query)

Retrieves repository by entity ID.

```typescript
export const getRepoByEntity = query({
    args: {
        entityId: v.union(v.id("users"), v.id("organizations")),
    },
    handler: async (ctx, args) => { /* ... */ }
});
```

**Returns:** Repo record or `null` if not found

**Usage:** Upload page uses this to check if repo exists before showing upload form

---

#### `updateRepoStatus` (internal mutation)

Updates repository status (called by GitHub action).

```typescript
export const updateRepoStatus = internalMutation({
    args: {
        repoId: v.id("repos"),
        status: v.union(
            v.literal("pending"),
            v.literal("active"),
            v.literal("failed")
        ),
    },
    handler: async (ctx, args) => { /* ... */ }
});
```

**Called by:**
- `github.createRepository` after successful repo creation → `status: "active"`
- `github.createRepository` on error → `status: "failed"`

---

#### `resetRepository` (mutation)

**⚠️ DANGER ZONE** - Deletes GitHub repo and Convex record for clean restart.

```typescript
export const resetRepository = mutation({
    args: {
        repoId: v.id("repos"),
    },
    handler: async (ctx, args) => { /* ... */ }
});
```

**Behavior:**
1. Authenticates user
2. Verifies user owns the repo (personal) or is org member (organization)
3. Schedules `github.deleteRepository` action
4. Deletes Convex repo record
5. Returns `{ success: true }`

**Use case:** When repo gets into failed state or user wants to start fresh

---

### File: `convex/github.ts`

#### `createRepository` (internal action)

Creates GitHub repository with folder structure.

```typescript
export const createRepository = internalAction({
    args: {
        repoId: v.id("repos"),
        repoName: v.string(),
    },
    handler: async (ctx, args) => { /* ... */ }
});
```

**Process:**
1. Gets `GITHUB_BOT_TOKEN` from environment
2. Checks if repo already exists on GitHub (handles 422 errors)
3. If not exists, creates repo via GitHub API:
   ```typescript
   octokit.repos.createForAuthenticatedUser({
       name: args.repoName,
       description: `Asset repository for ${args.repoName}`,
       private: false,      // Must be public for CDN
       auto_init: true,     // Creates initial commit
   })
   ```
4. Waits 2 seconds for GitHub to initialize
5. Creates 4 folders with `.gitkeep` files:
   - `file/.gitkeep`
   - `document/.gitkeep`
   - `image/.gitkeep`
   - `video/.gitkeep`
6. Updates repo status to "active"
7. On any error, updates status to "failed"

**Important Notes:**
- Uses `echokit.repos.createForAuthenticatedUser()` not `createInOrg()` because `echoray-io` is a personal account
- Folders are created using `createOrUpdateFileContents` with empty `.gitkeep` files
- Ignores 422 errors when folders already exist (idempotent)

---

#### `deleteRepository` (internal action)

Deletes GitHub repository.

```typescript
export const deleteRepository = internalAction({
    args: {
        repoName: v.string(),
    },
    handler: async (ctx, args) => { /* ... */ }
});
```

**Behavior:**
1. Calls `octokit.repos.delete()`
2. Handles 404 errors gracefully (repo already deleted)
3. Logs success/failure

**Required Permission:** `delete_repo` scope on GitHub token

---

#### `commitFileToGitHub` (helper function)

Commits uploaded file to GitHub repository.

```typescript
export const commitFileToGitHub = async (
    repoName: string,
    filePath: string,
    fileName: string,
    fileBuffer: ArrayBuffer
): Promise<string>
```

**Process:**
1. Convert `ArrayBuffer` to base64:
   ```typescript
   // Build binary string in 8KB chunks (memory efficient)
   const binaryParts: string[] = [];
   for (let i = 0; i < uint8Array.length; i += chunkSize) {
       const chunk = uint8Array.slice(i, i + chunkSize);
       let binaryString = '';
       for (let j = 0; j < chunk.length; j++) {
           binaryString += String.fromCharCode(chunk[j]);
       }
       binaryParts.push(binaryString);
   }
   // Encode to base64 ONCE (encoding chunks separately breaks padding)
   const base64Content = btoa(binaryParts.join(''));
   ```

2. Create/update file on GitHub:
   ```typescript
   octokit.repos.createOrUpdateFileContents({
       owner: "echoray-io",
       repo: repoName,
       path: filePath,          // e.g., "document/report.pdf"
       message: `Upload ${fileName}`,
       content: base64Content,  // Must be valid base64
   })
   ```

3. Returns commit SHA

**Critical Implementation Details:**
- **Memory constraint:** Convex has 64MB memory limit
- **Chunked processing:** Build binary string in 8KB chunks to reduce memory spikes
- **Base64 encoding:** Must encode AFTER joining parts (encoding chunks separately creates invalid base64 padding)
- **Current limitation:** 7MB+ files still cause out-of-memory errors

---

### File: `convex/uploads.ts`

#### Constants

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit (Convex memory constraint)
```

**Why 10MB?**
- Convex runtime has 64MB memory limit
- Base64 encoding creates ~1.33x size overhead
- String operations create additional memory overhead
- 10MB is safe limit, 7MB+ files cause crashes

---

#### `initiateUpload` (mutation)

Creates upload record and generates Convex storage URL.

```typescript
export const initiateUpload = mutation({
    args: {
        repoId: v.id("repos"),
        fileName: v.string(),
        fileType: v.union(/* file types */),
        fileSize: v.number(),
    },
    handler: async (ctx, args) => { /* ... */ }
});
```

**Validation Steps:**
1. Authenticates user (`auth.getUserId()`)
2. Validates file size ≤ 10MB
3. Verifies repo exists and is active
4. Verifies user has access:
   - Personal: `repo.entityId === userId`
   - Organization: User is active member of org

**Returns:**
```typescript
{
    uploadUrl: string,   // Convex storage upload URL
    uploadId: Id<"uploads">
}
```

**Upload record created:**
```typescript
{
    repoId: args.repoId,
    uploadedBy: userId,
    fileName: args.fileName,
    fileType: args.fileType,
    filePath: `${args.fileType}/${args.fileName}`,  // e.g., "document/report.pdf"
    status: "uploading",
    uploadedAt: Date.now(),
}
```

---

#### `markUploadReady` (mutation)

Marks file as ready for processing after upload to Convex.

```typescript
export const markUploadReady = mutation({
    args: {
        uploadId: v.id("uploads"),
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => { /* ... */ }
});
```

**Process:**
1. Verifies user owns the upload
2. Updates upload record:
   ```typescript
   {
       convexStorageId: args.storageId,
       status: "processing"
   }
   ```
3. Schedules `processUpload` action immediately

---

#### `processUpload` (internal action)

Moves file from Convex storage → GitHub → jsDelivr CDN.

```typescript
export const processUpload = internalAction({
    args: { uploadId: v.id("uploads") },
    handler: async (ctx, args) => { /* ... */ }
});
```

**Process:**
1. Gets upload record via `getUpload` query
2. Gets repo details via `repos.getRepo` query
3. Retrieves file from Convex storage:
   ```typescript
   const fileBlob = await ctx.storage.get(upload.convexStorageId);
   const fileBuffer = await fileBlob.arrayBuffer();
   ```
4. Commits file to GitHub:
   ```typescript
   const commitSha = await commitFileToGitHub(
       repo.githubRepoName,
       upload.filePath,
       upload.fileName,
       fileBuffer
   );
   ```
5. Generates jsDelivr CDN URL:
   ```typescript
   const cdnUrl = `https://cdn.jsdelivr.net/gh/echoray-io/${repo.githubRepoName}@main/${upload.filePath}`;
   ```
6. Updates upload record via `completeUpload`:
   ```typescript
   {
       status: "completed",
       githubCommitSha: commitSha,
       cdnUrl: cdnUrl,
       completedAt: Date.now(),
       convexStorageId: undefined  // Cleared
   }
   ```
7. Deletes file from Convex storage:
   ```typescript
   await ctx.storage.delete(upload.convexStorageId);
   ```

**Error Handling:**
- On any error, calls `failUpload` mutation
- Logs detailed error information
- Upload status set to "failed" with error message

---

#### `getUserUploads` (query)

Gets user's upload history with optional filtering.

```typescript
export const getUserUploads = query({
    args: {
        repoId: v.optional(v.id("repos")),
        status: v.optional(v.union(/* statuses */)),
    },
    handler: async (ctx, args) => { /* ... */ }
});
```

**Returns:** Array of upload records sorted by most recent first

---

## Frontend Components

### File: `src/components/upload/upload-interface.tsx`

Main upload UI component with real-time status tracking.

#### Component Structure

```tsx
export function UploadInterface({ 
    repoId, 
    repoStatus 
}: UploadInterfaceProps)
```

**Props:**
- `repoId`: ID of the repository to upload to
- `repoStatus`: "pending" | "active" | "failed"

---

#### Features

1. **Repository Status Banners**
   - **Pending:** Yellow banner with spinner
   - **Failed:** Red banner with error message + danger zone visible
   - **Active:** Upload form enabled

2. **File Type Selector**
   - Dropdown with 4 options: file, document, image, video
   - Shows description for each type

3. **File Input**
   - Client-side file size validation (10MB)
   - Shows selected file name and size
   - Disabled when repo not ready

4. **Upload Process:**
   ```typescript
   const handleUpload = async () => {
       // 1. Initiate upload
       const { uploadUrl, uploadId } = await initiateUpload({...});
       
       // 2. Upload to Convex storage
       const uploadResponse = await fetch(uploadUrl, {
           method: "POST",
           body: selectedFile,
       });
       
       const { storageId } = await uploadResponse.json();
       
       // 3. Mark as ready for processing
       await markUploadReady({ uploadId, storageId });
   }
   ```

5. **Real-Time Status Display**
   - Polls `getUploadById` query for current upload
   - Shows different UI based on status:
     - **uploading:** Blue spinner + "Uploading to storage..."
     - **processing:** Yellow spinner + "Processing upload..." + "Committing to GitHub and generating CDN URL"
     - **completed:** Green checkmark + CDN URL with copy button
     - **failed:** Red X + error message

6. **Danger Zone**
   - Visible when `repoStatus === "active" || repoStatus === "failed"`
   - Red bordered card
   - `ResetRepositoryButton` component with confirmation dialog

---

#### `ResetRepositoryButton` Component

```tsx
function ResetRepositoryButton({ 
    repoId, 
    repoName 
}: { 
    repoId: Id<"repos">, 
    repoName: string 
})
```

**States:**
- Default: Red "Reset Repository" button
- Confirming: Bordered box with warning + "Yes, delete everything" / "Cancel"
- Resetting: Spinner + "Resetting..."

**Behavior:**
```typescript
const handleReset = async () => {
    await resetRepo({ repoId });
    toast.success("Repository reset! Reloading page...");
    setTimeout(() => window.location.reload(), 1000);
}
```

---

### File: `src/app/(platform)/[scope]/[slug]/upload/page.tsx`

Upload route handler (`/p/[userId]/upload` or `/o/[orgId]/upload`).

#### Route Context

**Personal route:** `/p/m576hw45x5ehhs0k03avxrb8a17z73zf/upload`
- `scope`: "p"
- `slug`: User ID (e.g., "m576hw45x5ehhs0k03avxrb8a17z73zf")

**Organization route:** `/o/m57anw9d97pr8wt114en16gr1h7z76r3/upload`
- `scope`: "o"
- `slug`: Organization ID

---

#### Component Logic

```tsx
export default function UploadPage() {
    const { scope, slug, isPersonal } = useScopeContext();
    const currentUser = useQuery(api.users.currentUser);
    const ensureRepoExists = useMutation(api.repos.ensureRepoExists);
    
    // Determine entity ID
    const entityId = isPersonal 
        ? currentUser?._id as Id<"users">
        : undefined; // TODO: Get org ID from slug
    
    // Get or create repo
    const repo = useQuery(api.repos.getRepoByEntity, 
        entityId ? { entityId } : "skip"
    );
    
    // Auto-create repo on mount
    useEffect(() => {
        if (!entityId || repo !== null) return;
        ensureRepoExists({
            type: isPersonal ? "personal" : "organization",
            entityId: entityId!,
        });
    }, [entityId, repo, isPersonal, ensureRepoExists]);
}
```

---

#### Authorization Checks

1. **Loading State:**
   ```tsx
   if (!currentUser || entityId === undefined) {
       return <Loader />;
   }
   ```

2. **Personal Scope:** User must own the profile
   ```tsx
   if (isPersonal && currentUser._id !== slug) {
       return <UnauthorizedError />;
   }
   ```

3. **Organization Scope:** TODO - Check org membership

---

## Environment Configuration

### GitHub Personal Access Token

**Environment Variable Name:** `GITHUB_BOT_TOKEN`

**Where to set:** Convex environment (NOT `.env.local`)

**Command:**
```bash
npx convex env set GITHUB_BOT_TOKEN ghp_your_token_here
```

**Required Scopes:**
- ✅ `repo` - Full control of repositories (includes create, read, write, delete)
- ✅ `delete_repo` - Delete repositories

**How to create:**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Name: "Echoray Upload Bot"
4. Select scopes: `repo`, `delete_repo`
5. Generate token
6. Copy immediately (you can't see it again!)

**Security:**
- Token has full access to `echoray-io` account
- Only accessible from Convex backend (not exposed to client)
- Never commit to version control
- Stored securely in Convex environment

**Verification:**
```typescript
// In Convex action
const token = process.env.GITHUB_BOT_TOKEN;
if (!token) {
    console.error("GITHUB_BOT_TOKEN is not set!");
}
```

---

## File Upload Flow

### Detailed Step-by-Step Process

**Step 1: User selects file**
- User navigates to `/p/{userId}/upload`
- Page loads, checks if repo exists
- If no repo, creates one automatically
- User sees "Repository Initializing" banner
- After ~3-5 seconds, repo becomes "active"

**Step 2: File selection**
- User selects file type (document, image, etc.)
- User chooses file from device
- Client validates file size ≤ 10MB
- If > 10MB, shows error toast and resets input

**Step 3: Upload to Convex**
- User clicks "Upload File"
- Frontend calls `initiateUpload()` mutation:
  - Backend validates file size, repo status, user permissions
  - Backend creates upload record with `status: "uploading"`
  - Backend returns `{ uploadUrl, uploadId }`
- Frontend uploads file to Convex storage URL:
  ```typescript
  fetch(uploadUrl, { method: "POST", body: selectedFile })
  ```
- Response contains `{ storageId }`

**Step 4: Mark ready for processing**
- Frontend calls `markUploadReady({ uploadId, storageId })`
- Backend updates upload to `status: "processing"`
- Backend schedules `processUpload` action

**Step 5: Background processing**
- `processUpload` action runs asynchronously
- Gets file from Convex storage as `ArrayBuffer`
- Converts to base64 (chunked approach)
- Commits to GitHub via API
- Generates jsDelivr CDN URL
- Updates upload to `status: "completed"`
- Deletes file from Convex storage

**Step 6: User sees result**
- Frontend polls `getUploadById` query
- Status changes from "processing" → "completed"
- CDN URL appears with copy button
- User can click to copy URL to clipboard

**Total time:** ~5-10 seconds for small files

---

## GitHub Integration

### API Endpoints Used

1. **Get Repository**
   ```typescript
   octokit.repos.get({
       owner: "echoray-io",
       repo: "p-m576hw45x5ehhs0k03avxrb8a17z73zf"
   })
   ```
   - Returns: 200 if exists, 404 if not found

2. **Create Repository**
   ```typescript
   octokit.repos.createForAuthenticatedUser({
       name: "p-m576hw45x5ehhs0k03avxrb8a17z73zf",
       description: "Asset repository for p-m576hw45x5ehhs0k03avxrb8a17z73zf",
       private: false,
       auto_init: true
   })
   ```
   - Creates public repo with initial commit
   - Returns: Repo object with `html_url`

3. **Create/Update File**
   ```typescript
   octokit.repos.createOrUpdateFileContents({
       owner: "echoray-io",
       repo: "p-m576hw45x5ehhs0k03avxrb8a17z73zf",
       path: "document/report.pdf",
       message: "Upload report.pdf",
       content: base64Content
   })
   ```
   - Content MUST be valid base64
   - Returns: Commit object with `sha`

4. **Delete Repository**
   ```typescript
   octokit.repos.delete({
       owner: "echoray-io",
       repo: "p-m576hw45x5ehhs0k03avxrb8a17z73zf"
   })
   ```
   - Permanently deletes repo and all files

### jsDelivr CDN URL Format

```
https://cdn.jsdelivr.net/gh/{owner}/{repo}@{branch}/{path}
```

**Example:**
```
https://cdn.jsdelivr.net/gh/echoray-io/p-m576hw45x5ehhs0k03avxrb8a17z73zf@main/document/report.pdf
```

**Components:**
- `echoray-io`: GitHub account name
- `p-m576hw45x5ehhs0k03avxrb8a17z73zf`: Repository name
- `main`: Branch name (always main)
- `document/report.pdf`: File path in repo

**Benefits:**
- Free global CDN
- Automatic caching
- HTTPS by default
- No rate limits
- Fast delivery worldwide

---

## Known Limitations

### 1. File Size Limitation (CRITICAL)

**Problem:** Files larger than ~7MB cause out-of-memory errors in Convex runtime.

**Error:**
```
JavaScript execution ran out of memory (maximum memory usage: 64 MB)
```

**Root Cause:**
- Convex edge runtime has strict 64MB memory limit
- Base64 encoding creates large intermediate strings
- For 7MB file: ArrayBuffer (7MB) + binary string (7MB) + base64 string (9.3MB) = ~23.3MB of memory
- Additional overhead from string operations pushes it over limit

**Current Workarounds:**
- File size limit set to 10MB (enforced client-side)
- Files 7MB+ will fail
- Users should use files ≤ 5MB for reliable uploads

**Potential Solutions:**
1. **Reduce limit to 5MB** (safest)
2. **Client-side upload** (bypass Convex for files, use GitHub API directly from browser)
3. **Streaming upload** (requires Convex to support streaming APIs)

---

### 2. Organization Uploads Not Implemented

**Status:** Personal uploads (p/) work, organization uploads (o/) not implemented

**Missing:**
- Organization ID lookup from slug
- Organization membership verification
- Organization-specific permissions

**Workaround:** Only personal uploads work in MVP

---

### 3. No File Deletion

**Problem:** Once file is uploaded to GitHub, it cannot be deleted from UI.

**Workaround:** Use "Reset Repository" to delete entire repo and start fresh

**Future:** Add individual file deletion functionality

---

### 4. No Bulk/Multi-file Upload

**Problem:** Can only upload one file at a time

**Workaround:** Upload files sequentially

**Future:** Add drag-and-drop multi-file upload

---

### 5. Public Repositories Only

**Problem:** All files are publicly accessible via CDN

**Security Implication:** Don't upload sensitive/private files

**Workaround:** None for MVP

**Future:** Private repository support with signed URLs

---

## Troubleshooting

### Issue: "Repository Setup Failed"

**Symptoms:**
- Red banner: "Failed to create GitHub repository"
- Repo status stuck on "failed"

**Possible Causes:**
1. GitHub token not set
2. Invalid GitHub token
3. Token missing required permissions
4. Repository already exists with failed folders

**Solutions:**

1. **Verify token is set:**
   ```bash
   # Check Convex dashboard → Settings → Environment Variables
   # Should see: GITHUB_BOT_TOKEN = ghp_***
   ```

2. **Re-set token:**
   ```bash
   npx convex env set GITHUB_BOT_TOKEN ghp_your_new_token
   ```

3. **Use Danger Zone reset:**
   - Click red "Reset Repository" button
   - Confirm deletion
   - Page reloads and creates fresh repo

4. **Check Convex logs:**
   ```
   pnpm dlx convex dev
   # Look for errors from github:createRepository
   ```

---

### Issue: "Upload Failed - content is not valid Base64"

**Symptoms:**
- Upload status shows "failed"
- Error: "content is not valid Base64"

**Cause:** Bug in chunked base64 encoding (should be fixed)

**Solution:**
- Update to latest code (base64 encoding fixed)
- If still occurs, reduce file size

---

### Issue: "Upload Failed - out of memory"

**Symptoms:**
- Upload status shows "failed"
- Convex logs: "JavaScript execution ran out of memory"

**Cause:** File too large (>7MB)

**Solution:**
1. Use smaller file (≤5MB recommended)
2. Compress file before uploading
3. Split large files into smaller parts

---

### Issue: "Repository is not ready yet"

**Symptoms:**
- Upload button disabled
- Message: "Repository is not ready yet. Please wait..."

**Cause:** Repo still being created on GitHub

**Solution:**
- Wait 5-10 seconds and refresh page
- If stuck >30 seconds, check repo status in Convex dashboard
- If status is "failed", use Danger Zone reset

---

### Issue: "Not authorized to upload"

**Symptoms:**
- Error: "Not authorized to upload to this repository"
- Redirect to own upload page

**Cause:** Trying to access another user's upload page

**Solution:**
- Use your own upload URL: `/p/{your-user-id}/upload`
- Check URL matches your user ID

---

## Future Enhancements

### Phase 2: Performance & UX
- [ ] Increase file size limit (client-side upload bypass)
- [ ] Drag-and-drop file upload
- [ ] Bulk/multi-file upload
- [ ] Upload progress bar (percentage)
- [ ] File preview before upload
- [ ] Upload history page with search/filter

### Phase 3: Organization Support
- [ ] Organization upload routes
- [ ] Organization membership verification
- [ ] Organization-specific permissions
- [ ] Organization file quotas

### Phase 4: Advanced Features
- [ ] Private repository support
- [ ] File deletion
- [ ] File renaming/moving
- [ ] Folder creation
- [ ] File versioning
- [ ] Custom CDN domains
- [ ] Upload analytics/stats

### Phase 5: Integrations
- [ ] Discord upload notifications
- [ ] Slack upload notifications
- [ ] Webhook support
- [ ] API endpoint for programmatic uploads
- [ ] Zapier integration

---

## Version History

### v1.0 (2026-01-18)
- ✅ Initial MVP implementation
- ✅ Personal file uploads
- ✅ GitHub integration
- ✅ jsDelivr CDN URLs
- ✅ Real-time status tracking
- ✅ Danger zone reset
- ⚠️ Known limitation: 7MB+ files fail
- ⚠️ Organization uploads not implemented

---

## Contact & Support

**Issues:** Report to development team  
**Documentation:** This file (`docs/upload-app-v1.md`)  
**Code Location:** `convex/` and `src/components/upload/`
