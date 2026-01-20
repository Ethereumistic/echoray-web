# Task 003: Project CRUD Backend

**Status:** Not Started  
**Priority:** Critical  
**Estimated Time:** 3 hours  
**Dependencies:** Task 001, Task 002  

## Objective

Implement complete backend CRUD operations for mapping projects with proper permissions and validation.

## Deliverables

- [ ] Create `convex/mapping/projects.ts`
- [ ] Implement all CRUD operations
- [ ] Add permission checks
- [ ] Add validation logic

## Backend Functions

### File: `convex/mapping/projects.ts`

```typescript
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// Create new mapping project
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    type: v.union(v.literal("personal"), v.literal("organization")),
    ownerId: v.union(v.id("users"), v.id("organizations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
      .unique();
    
    if (!user) throw new Error("User not found");

    // Permission check for organization projects
    if (args.type === "organization") {
      // Check if user has permission to create projects in this org
      const hasPermission = await checkOrgPermission(
        ctx,
        user._id,
        args.ownerId as Id<"organizations">,
        "o.project.create"
      );
      
      if (!hasPermission) {
        throw new Error("No permission to create organization projects");
      }
    } else {
      // Personal projects - must be creating for self
      if (args.ownerId !== user._id) {
        throw new Error("Can only create personal projects for yourself");
      }
    }

    const projectId = await ctx.db.insert("mapping_projects", {
      name: args.name,
      description: args.description,
      icon: args.icon,
      type: args.type,
      ownerId: args.ownerId,
      defaultView: "table",
      createdBy: user._id,
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
      createdBy: user._id,
      createdAt: Date.now(),
    });

    return projectId;
  },
});

// List projects by scope
export const list = query({
  args: {
    scope: v.string(), // "p" or "o"
    slug: v.string(),  // userId or orgSlug
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let ownerId: Id<"users"> | Id<"organizations">;
    
    if (args.scope === "p") {
      ownerId = args.slug as Id<"users">;
    } else {
      const org = await ctx.db
        .query("organizations")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug))
        .unique();
      
      if (!org) return [];
      ownerId = org._id;
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

// Get single project
export const get = query({
  args: {
    projectId: v.id("mapping_projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    
    // TODO: Add permission check
    
    return project;
  },
});

// Update project
export const update = mutation({
  args: {
    projectId: v.id("mapping_projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    defaultView: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // TODO: Add permission check

    await ctx.db.patch(args.projectId, {
      ...args,
      updatedAt: Date.now(),
    });

    return args.projectId;
  },
});

// Archive project
export const archive = mutation({
  args: {
    projectId: v.id("mapping_projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // TODO: Add permission check

    await ctx.db.patch(args.projectId, {
      archived: true,
      updatedAt: Date.now(),
    });

    return args.projectId;
  },
});

// Hard delete project
export const deleteProject = mutation({
  args: {
    projectId: v.id("mapping_projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // TODO: Add permission check

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
```

## Implementation Steps

1. Create `convex/mapping/projects.ts`
2. Implement all CRUD functions
3. Add proper TypeScript types
4. Test all operations in Convex dashboard

## Testing

- [ ] Test create project (personal)
- [ ] Test create project (organization)
- [ ] Test list projects
- [ ] Test get single project
- [ ] Test update project
- [ ] Test archive project
- [ ] Test delete project

## Notes

- Use existing permission system
- Auto-create default template and view on project creation
- Cascading delete for all related data
