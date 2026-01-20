# Task 004: Template Management Backend

**Status:** Not Started  
**Priority:** Critical  
**Estimated Time:** 3 hours  
**Dependencies:** Task 003  

## Objective

Implement backend functions for managing card templates, including adding, updating, removing, and reordering fields.

## Deliverables

- [ ] Create `convex/mapping/templates.ts`
- [ ] Implement template CRUD operations
- [ ] Implement field management functions
- [ ] Add validation for field configurations

## Backend Functions

### File: `convex/mapping/templates.ts`

```typescript
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// Get template for project
export const getByProject = query({
  args: {
    projectId: v.id("mapping_projects"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db
      .query("mapping_templates")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
    
    if (!template) throw new Error("Template not found");
    
    return template;
  },
});

// Add field to template
export const addField = mutation({
  args: {
    projectId: v.id("mapping_projects"),
    field: v.object({
      name: v.string(),
      type: v.string(),
      required: v.boolean(),
      config: v.any(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Get template
    const template = await ctx.db
      .query("mapping_templates")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
    
    if (!template) throw new Error("Template not found");

    // TODO: Add permission check

    // Generate field ID
    const fieldId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add field
    const newField = {
      id: fieldId,
      name: args.field.name,
      type: args.field.type,
      required: args.field.required,
      config: args.field.config,
      order: template.fields.length,
    };

    await ctx.db.patch(template._id, {
      fields: [...template.fields, newField],
      updatedAt: Date.now(),
    });

    return fieldId;
  },
});

// Update field configuration
export const updateField = mutation({
  args: {
    projectId: v.id("mapping_projects"),
    fieldId: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      type: v.optional(v.string()),
      required: v.optional(v.boolean()),
      config: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Get template
    const template = await ctx.db
      .query("mapping_templates")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
    
    if (!template) throw new Error("Template not found");

    // TODO: Add permission check

    // Update field
    const updatedFields = template.fields.map((field) => {
      if (field.id === args.fieldId) {
        return {
          ...field,
          ...args.updates,
        };
      }
      return field;
    });

    await ctx.db.patch(template._id, {
      fields: updatedFields,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Remove field from template
export const removeField = mutation({
  args: {
    projectId: v.id("mapping_projects"),
    fieldId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Get template
    const template = await ctx.db
      .query("mapping_templates")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
    
    if (!template) throw new Error("Template not found");

    // TODO: Add permission check

    // Remove field
    const updatedFields = template.fields.filter(
      (field) => field.id !== args.fieldId
    );

    // Reorder remaining fields
    const reorderedFields = updatedFields.map((field, index) => ({
      ...field,
      order: index,
    }));

    await ctx.db.patch(template._id, {
      fields: reorderedFields,
      updatedAt: Date.now(),
    });

    // TODO: Remove field values from all cards in this project

    return true;
  },
});

// Reorder fields
export const reorderFields = mutation({
  args: {
    projectId: v.id("mapping_projects"),
    fieldOrder: v.array(v.string()), // Array of field IDs in new order
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Get template
    const template = await ctx.db
      .query("mapping_templates")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
    
    if (!template) throw new Error("Template not found");

    // TODO: Add permission check

    // Create a map of field IDs to fields
    const fieldMap = new Map(
      template.fields.map((field) => [field.id, field])
    );

    // Reorder fields based on provided order
    const reorderedFields = args.fieldOrder.map((fieldId, index) => {
      const field = fieldMap.get(fieldId);
      if (!field) throw new Error(`Field ${fieldId} not found`);
      
      return {
        ...field,
        order: index,
      };
    });

    await ctx.db.patch(template._id, {
      fields: reorderedFields,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Duplicate field
export const duplicateField = mutation({
  args: {
    projectId: v.id("mapping_projects"),
    fieldId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Get template
    const template = await ctx.db
      .query("mapping_templates")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
    
    if (!template) throw new Error("Template not found");

    // Find field to duplicate
    const fieldToDuplicate = template.fields.find(
      (field) => field.id === args.fieldId
    );

    if (!fieldToDuplicate) throw new Error("Field not found");

    // Create duplicate
    const newFieldId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const duplicatedField = {
      ...fieldToDuplicate,
      id: newFieldId,
      name: `${fieldToDuplicate.name} (Copy)`,
      order: template.fields.length,
    };

    await ctx.db.patch(template._id, {
      fields: [...template.fields, duplicatedField],
      updatedAt: Date.now(),
    });

    return newFieldId;
  },
});
```

## Implementation Steps

1. Create `convex/mapping/templates.ts`
2. Implement all template functions
3. Add field validation logic
4. Test all operations

## Testing

- [ ] Test add field
- [ ] Test update field
- [ ] Test remove field
- [ ] Test reorder fields
- [ ] Test duplicate field
- [ ] Test get template by project

## Notes

- Field IDs must be unique within a template
- Removing a field should clean up card values
- Reordering maintains data integrity
