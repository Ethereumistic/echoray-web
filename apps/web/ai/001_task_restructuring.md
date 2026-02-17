Role: Senior Next.js Architect Environment: Windows 11 (PowerShell), pnpm Goal: Restructure the src/app directory from the current (dashboard) structure to a scalable (platform) structure using Dynamic Route Groups.

Context: We are moving from a split structure (separate folders for /p/ and /o/) to a unified [scope]/[slug] structure. We need to support two types of routes at the same level:

Pre-built System Projects: e.g., /p/user123/qr-gen

Custom Client Projects: e.g., /p/user123/m97fzcyhdb... (Dynamic ID)

Current Structure (Simplified):
src/app/(dashboard)/
  ├── p/[slug]/[project]/...
  ├── o/[slug]/[project]/...
  ├── dashboard/projects/...

Target Structure (To Implement):
src/app/(platform)/
  ├── layout.tsx  (Main App Shell - Auth checks, Toasts)
  └── [scope]/    (Catches 'p' or 'o')
      └── [slug]/ (Catches userID or orgID)
          ├── layout.tsx      (Sidebar, Context Provider)
          ├── page.tsx        (Dashboard Home)
          ├── projects/       (List of all projects)
          │   └── page.tsx
          ├── settings/       (Settings)
          │   └── page.tsx
          ├── qr-gen/         (Pre-built App 1)
          │   └── page.tsx
          ├── upload/         (Pre-built App 2)
          │   └── page.tsx
          └── [projectId]/    (Custom Client Projects - CATCH ALL)
              └── page.tsx

Step-by-Step Implementation Instructions
Step 1: Create the New "Platform" Root
We are renaming (dashboard) to (platform) to be more semantic.

Create the directory src/app/(platform).

Move the root layout.tsx from (dashboard) to (platform).

Create the unified scope folders: src/app/(platform)/[scope]/[slug].

Step 2: Migrate and Unify Layouts
Currently, /p/ and /o/ likely have duplicate layouts. We will merge them.

Move the logic from src/app/(dashboard)/p/[slug]/layout.tsx (or o/...) to src/app/(platform)/[scope]/[slug]/layout.tsx.

Crucial Logic Update: Inside this new layout, check params.scope.

If scope === 'p', fetch User Context.

If scope === 'o', fetch Organization Context.

Step 3: Implement the "System Apps" vs "Custom Projects" Split
System Apps: Create folders qr-gen, upload, cross-post directly inside [slug].

Custom Projects: Create a folder [projectId] directly inside [slug].

Migration: Move the existing code from src/app/(dashboard)/[project] (or equivalent) into this new [projectId] folder.

Step 4: PowerShell Execution Plan
Please execute the following PowerShell commands to restructure the folders. Do not delete the old folders yet, just move or copy to ensure safety until we verify.

# 1. Create the new parent structure
New-Item -ItemType Directory -Force -Path "src/app/(platform)"
New-Item -ItemType Directory -Force -Path "src/app/(platform)/[scope]/[slug]"

# 2. Move the main layout (renaming dashboard group to platform group effectively)
# Assuming the root dashboard layout is reusable
Copy-Item "src/app/(dashboard)/layout.tsx" -Destination "src/app/(platform)/layout.tsx"

# 3. Create the standard routes inside the dynamic slug
New-Item -ItemType Directory -Force -Path "src/app/(platform)/[scope]/[slug]/projects"
New-Item -ItemType Directory -Force -Path "src/app/(platform)/[scope]/[slug]/settings"

# 4. Create the Catch-All for Custom Projects
New-Item -ItemType Directory -Force -Path "src/app/(platform)/[scope]/[slug]/[projectId]"

# 5. Create the Specific Routes for Pre-built Apps (Placeholders for now, or move if exist)
New-Item -ItemType Directory -Force -Path "src/app/(platform)/[scope]/[slug]/qr-gen"
New-Item -ItemType Directory -Force -Path "src/app/(platform)/[scope]/[slug]/upload"
New-Item -ItemType Directory -Force -Path "src/app/(platform)/[scope]/[slug]/cross-post"

# 6. Move the Page Logic (Example: Moving the dashboard home)
# You will need to manually refactor the code inside these after moving to handle 'scope' param
Copy-Item "src/app/(dashboard)/dashboard/page.tsx" -Destination "src/app/(platform)/[scope]/[slug]/page.tsx"

Step 5: Code Refactoring (Instruction to AI)
After moving the files, you must scan the new [scope]/[slug]/layout.tsx and page.tsx files.

Update all Link components.

Old: /p/${id}/projects

New: /${scope}/${slug}/projects

Update useParams.

The params will now be { scope: string, slug: string, projectId?: string }.

Ensure API calls (Convex) use slug as the identifier (User ID or Org ID) based on the scope.

Specific Note on Route Precedence:
Ensure the user understands that putting qr-gen next to [projectId] is valid. Next.js will match .../qr-gen exactly before trying to match the [projectId] wildcard.

Action: Please analyze the current layout.tsx in (dashboard)/p/[slug] and merge it into the new Unified Layout at (platform)/[scope]/[slug]/layout.tsx. Then execute the PowerShell structure creation.