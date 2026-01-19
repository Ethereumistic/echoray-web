# Task 001: Database Schema Setup

**Status:** Not Started  
**Priority:** Critical  
**Estimated Time:** 2 hours  
**Dependencies:** None  

## Objective

Set up the complete Convex database schema for the Mapper micro-app including all tables, indexes, and type definitions.

## Deliverables

- [ ] Create `convex/mapping/schema.ts` with all mapping tables
- [ ] Add proper indexes for query optimization
- [ ] Define TypeScript types for all field types
- [ ] Test schema compilation

## Schema Tables

### 1. mapping_projects

Main project container table.

```typescript
mapping_projects: defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
  type: v.union(v.literal("personal"), v.literal("organization")),
  ownerId: v.union(v.id("users"), v.id("organizations")),
  defaultView: v.string(),
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
  archived: v.boolean(),
  cardCount: v.number(),
})
.index("by_owner", ["ownerId", "archived"])
```

### 2. mapping_templates

Template definitions for card structure.

```typescript
mapping_templates: defineTable({
  projectId: v.id("mapping_projects"),
  name: v.string(),
  fields: v.array(v.object({
    id: v.string(),
    name: v.string(),
    type: v.string(),  // One of 42 field types
    required: v.boolean(),
    config: v.any(),   // Type-specific configuration
    order: v.number(),
  })),
  createdAt: v.number(),
  updatedAt: v.number(),
})
.index("by_project", ["projectId"])
```

### 3. mapping_cards

Individual data records.

```typescript
mapping_cards: defineTable({
  projectId: v.id("mapping_projects"),
  templateId: v.id("mapping_templates"),
  values: v.any(),  // Dynamic field values as JSON
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
  order: v.number(),
  archived: v.boolean(),
})
.index("by_project", ["projectId", "archived"])
.index("by_project_order", ["projectId", "order"])
```

### 4. mapping_views

Saved view configurations.

```typescript
mapping_views: defineTable({
  projectId: v.id("mapping_projects"),
  name: v.string(),
  type: v.union(
    v.literal("table"),
    v.literal("grid"),
    v.literal("kanban"),
    v.literal("calendar"),
    v.literal("gallery")
  ),
  config: v.object({
    filters: v.optional(v.array(v.any())),
    sorts: v.optional(v.array(v.any())),
    visibleFields: v.optional(v.array(v.string())),
    groupBy: v.optional(v.string()),
  }),
  isDefault: v.boolean(),
  createdBy: v.id("users"),
  createdAt: v.number(),
})
.index("by_project", ["projectId"])
```

## Implementation Steps

1. Create the schema file in `convex/mapping/schema.ts`
2. Import the schema in `convex/schema.ts`
3. Run Convex dev to apply migrations
4. Verify all tables are created in Convex dashboard

## Testing

- [ ] Verify schema compiles without errors
- [ ] Check all indexes are created
- [ ] Confirm tables appear in Convex dashboard

## Notes

- Use `v.any()` for dynamic field configurations
- All timestamps use `v.number()` (Date.now())
- Indexes optimize for common query patterns
