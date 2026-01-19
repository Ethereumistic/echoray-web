# Task 005: Cards CRUD Backend

**Status:** Not Started  
**Priority:** Critical  
**Estimated Time:** 4 hours  
**Dependencies:** Task 004  

## Objective

Implement complete backend operations for managing cards (data records) with proper validation and bulk operations.

## Deliverables

- [ ] Create `convex/mapping/cards.ts`
- [ ] Implement CRUD operations
- [ ] Implement bulk operations
- [ ] Add field validation

## Backend Functions

### File: `convex/mapping/cards.ts`

```typescript
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// Create card
export const create = mutation({
  args: {
    projectId: v.id("mapping_projects"),
    values: v.any(), // Dynamic field values
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
      .unique();
    
    if (!user) throw new Error("User not found");

    // Get project
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // Get template
    const template = await ctx.db
      .query("mapping_templates")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
    
    if (!template) throw new Error("Template not found");

    // TODO: Add permission check
    // TODO: Validate required fields
    // TODO: Validate field types

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
      values: args.values,
      createdBy: user._id,
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

// List cards with filters and sorting
export const list = query({
  args: {
    projectId: v.id("mapping_projects"),
    filters: v.optional(v.array(v.any())),
    sorts: v.optional(v.array(v.any())),
    includeArchived: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // TODO: Add permission check

    let query = ctx.db
      .query("mapping_cards")
      .withIndex("by_project", (q) => 
        q.eq("projectId", args.projectId).eq("archived", args.includeArchived ?? false)
      );

    const cards = await query.collect();

    // TODO: Apply filters
    // TODO: Apply sorting
    // TODO: Apply pagination

    return cards;
  },
});

// Get single card
export const get = query({
  args: {
    cardId: v.id("mapping_cards"),
  },
  handler: async (ctx, args) => {
    const card = await ctx.db.get(args.cardId);
    if (!card) throw new Error("Card not found");
    
    // TODO: Add permission check
    
    return card;
  },
});

// Update card
export const update = mutation({
  args: {
    cardId: v.id("mapping_cards"),
    values: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const card = await ctx.db.get(args.cardId);
    if (!card) throw new Error("Card not found");

    // TODO: Add permission check
    // TODO: Validate field values

    await ctx.db.patch(args.cardId, {
      values: args.values,
      updatedAt: Date.now(),
    });

    return args.cardId;
  },
});

// Delete card
export const deleteCard = mutation({
  args: {
    cardId: v.id("mapping_cards"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const card = await ctx.db.get(args.cardId);
    if (!card) throw new Error("Card not found");

    // TODO: Add permission check

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

// Duplicate card
export const duplicate = mutation({
  args: {
    cardId: v.id("mapping_cards"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
      .unique();
    
    if (!user) throw new Error("User not found");

    const card = await ctx.db.get(args.cardId);
    if (!card) throw new Error("Card not found");

    // TODO: Add permission check

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
      createdBy: user._id,
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

// Bulk update cards
export const bulkUpdate = mutation({
  args: {
    cardIds: v.array(v.id("mapping_cards")),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // TODO: Add permission check

    for (const cardId of args.cardIds) {
      const card = await ctx.db.get(cardId);
      if (!card) continue;

      await ctx.db.patch(cardId, {
        values: {
          ...card.values,
          ...args.updates,
        },
        updatedAt: Date.now(),
      });
    }

    return true;
  },
});

// Bulk delete cards
export const bulkDelete = mutation({
  args: {
    cardIds: v.array(v.id("mapping_cards")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // TODO: Add permission check

    for (const cardId of args.cardIds) {
      const card = await ctx.db.get(cardId);
      if (!card) continue;

      await ctx.db.delete(cardId);

      // Decrement project card count
      const project = await ctx.db.get(card.projectId);
      if (project) {
        await ctx.db.patch(card.projectId, {
          cardCount: Math.max(0, project.cardCount - 1),
          updatedAt: Date.now(),
        });
      }
    }

    return true;
  },
});

// Reorder cards
export const reorder = mutation({
  args: {
    projectId: v.id("mapping_projects"),
    cardOrder: v.array(v.id("mapping_cards")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // TODO: Add permission check

    for (let i = 0; i < args.cardOrder.length; i++) {
      await ctx.db.patch(args.cardOrder[i], {
        order: i,
        updatedAt: Date.now(),
      });
    }

    return true;
  },
});
```

## Implementation Steps

1. Create `convex/mapping/cards.ts`
2. Implement all CRUD functions
3. Add validation logic
4. Test all operations

## Testing

- [ ] Test create card
- [ ] Test list cards
- [ ] Test get single card
- [ ] Test update card
- [ ] Test delete card
- [ ] Test duplicate card
- [ ] Test bulk update
- [ ] Test bulk delete
- [ ] Test reorder cards

## Notes

- Validate field values against template
- Support bulk operations for efficiency
- Maintain card order for sorting
