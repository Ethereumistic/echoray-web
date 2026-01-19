# 006 - Mapping App: Universal Data Management System

**Version:** 1.0 MVP  
**Status:** Planning Phase  
**Priority:** High  
**Tech Stack:** Next.js + TypeScript + Convex + Cloudflare Workers  
**Target Users:** Small businesses to enterprise organizations  

---

## Executive Summary

The Mapping App is EchoRay's most ambitious micro-app - a **flexible, no-code database builder** that allows users to create custom data structures for any use case. With **42 field types** covering every conceivable data format, users can build anything from simple checklists to complex CRM systems.

**Core Value Proposition:**
- Replace multiple tools (Airtable, Notion databases, Excel, custom tools) with one unified system
- Zero technical knowledge required - visual interface for everything  
- Enterprise-grade features at every tier
- Seamless integration with other EchoRay micro-apps

---

## Table of Contents

1. [Product Vision](#product-vision)
2. [Field Type System (42 Types)](#field-type-system)
3. [Database Architecture](#database-architecture)
4. [UX/UI Design Principles](#uxui-design-principles)
5. [Implementation Plan](#implementation-plan)
6. [Integration Strategy](#integration-strategy)
7. [Testing & QA](#testing--qa)
8. [Deployment Strategy](#deployment-strategy)
9. [Future Roadmap](#future-roadmap)

---

## Product Vision

### What Problem Does This Solve?

**For individuals:** Tracking personal projects, collections, goals without learning database concepts

**For small businesses:** Managing operations (inventory, clients, projects) without expensive software

**For enterprises:** Building custom internal tools without developers

### Key Use Cases

**Business Operations:**
- Website management (domains, SSL, hosting, renewals)
- Client database (contacts, projects, billing)
- Inventory tracking (products, stock, suppliers)
- Task/project management (deadlines, assignments, budgets)

**Personal:**
- Movie/book libraries
- Recipe collections
- Travel planning
- Fitness tracking

**Technical:**
- API documentation
- Bug tracking
- Server monitoring
- Asset registries

---

## Field Type System

### Complete List (42 Types)

### IMPORTANT: ALL CATEGORY fields can use multiple types, for example:
- LOCATION CATEGORY: The field can include multiple types in the field like: [**Location Name** + **Map Link** + **Coordinates**]
- NUMBERS CATEGORY: The field can include multiple types in the field like: [**Number** + **Currency**]
- DATE & TIME CATEGORY: The field can include multiple types in the field like: [**Date** + **Time** + **Timestamp**]

#### TEXT CATEGORY (6 types)
1. **Text** - Single line (max 255 chars)
2. **Long Text** - Multi-line textarea  
3. **Rich Text** - Formatted with TipTap editor
4. **URL** - Web links with validation
5. **Email** - Email addresses with mailto
6. **Phone** - International phone numbers

#### NUMBERS CATEGORY (4 types)  
7. **Number** - Integers or decimals
8. **Currency** - 20+ currencies with symbols
9. **Percentage** - 0-100% with progress bars
10. **Rating** - Stars, numbers, or emojis

#### DATE & TIME CATEGORY (5 types)
11. **Date** - Calendar dates
12. **Date & Time** - Specific moments
13. **Time** - Time of day only
14. **Duration** - Time spans (2h 30m)
15. **Timestamp** - Auto-generated timestamps

#### SELECTION CATEGORY (4 types)
16. **Dropdown** - Single select
17. **Multi-Select** - Multiple choices
18. **Status** - Workflow states with colors
19. **Tags** - Freeform labels

#### BOOLEAN CATEGORY (2 types)
20. **Checkbox** - Yes/No
21. **Toggle** - On/Off switch

#### LOCATION CATEGORY (4 types)
22. **Location Name** - Text location
23. **Map Link** - Google Maps / Apple Maps link  
24. **Coordinates** - Latitude/Longitude
25. **Full Address** - Complete mailing address

#### MEDIA CATEGORY (4 types)
26. **File** - Any file type
27. **Document** - PDFs, DOCX, etc.
28. **Image** - Images with preview
29. **Video** - Videos with player

#### RELATION CATEGORY (3 types)
30. **User Reference** - Link to users
31. **Organization Reference** - Link to orgs
32. **Custom Relation** - Link to other cards

#### SPECIAL CATEGORY (6 types)
33. **Formula** - Calculated fields
34. **Auto-Number** - Auto-incrementing IDs
35. **Barcode/QR Code** - Generate/scan codes
36. **Color Picker** - Color selection
37. **JSON** - Structured data objects
38. **Markdown** - Markdown with preview

#### ADVANCED CATEGORY (4 types)
39. **Lookup** - Pull values from related cards
40. **Rollup** - Aggregate from multiple cards
41. **Button** - Trigger actions
42. **Collaboration** - Comments & activity log

---

## Database Architecture

### Core Schema

```typescript
// Projects - Top-level containers
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

// Templates - Define card structure
mapping_templates: defineTable({
  projectId: v.id("mapping_projects"),
  name: v.string(),
  fields: v.array(v.object({
    id: v.string(),
    name: v.string(),
    type: v.string(),  // One of 42 types
    required: v.boolean(),
    config: v.any(),   // Type-specific config
    order: v.number(),
  })),
  createdAt: v.number(),
  updatedAt: v.number(),
})
.index("by_project", ["projectId"])

// Cards - Data records
mapping_cards: defineTable({
  projectId: v.id("mapping_projects"),
  templateId: v.id("mapping_templates"),
  values: v.any(),  // Dynamic field values
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
  order: v.number(),
  archived: v.boolean(),
})
.index("by_project", ["projectId", "archived"])
.index("by_project_order", ["projectId", "order"])

// Views - Saved view configurations
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

### Field Value Storage Strategy

**Challenge:** 42 different field types with different storage needs.

**Solution:** Type-specific value objects stored as JSON:

```typescript
// Examples of value storage
values: {
  // Text
  "field_name": "Product Name",
  
  // Currency  
  "field_price": {
    amount: 1999.99,
    currency: "USD"
  },
  
  // Image (from Upload app)
  "field_photo": {
    url: "https://cdn.jsdelivr.net/gh/.../photo.jpg",
    fileName: "photo.jpg",
    fileSize: 1024000,
    width: 1920,
    height: 1080
  },
  
  // Status
  "field_status": "in_progress",
  
  // User Reference
  "field_assignee": "j5x7k9m2n4p6q8r0s2t4v",
  
  // Formula (computed)
  "field_total": 2599.87,
  
  // Multiple values (Multi-Select)
  "field_tags": ["urgent", "review", "approved"],
}
```

---

## UX/UI Design Principles

### 1. Zero Learning Curve

**Problem:** Database concepts are intimidating.

**Solution:** Never use technical jargon:
- ❌ "schema", "foreign key", "join"
- ✅ "template", "link", "connect"

### 2. Progressive Disclosure  

Start simple, reveal complexity on-demand:

**Step 1:** Create project (just name)  
**Step 2:** Add fields visually  and insert values in the fields and immediatelly display in a card visualizer for best UX!
**Step 3:** Create cards  
**Done** → Advanced features available but not forced

### 3. Inline Everything

No modal dialogs unless necessary:
- Edit field names inline (double-click)
- Edit card values in table (click cell)
- Add fields in template builder (inline form)

### 4. Smart Defaults

When user adds a currency field:
- Auto-detect their currency from location
- Pre-fill with 2 decimals
- Enable thousand separators

### 5. Keyboard-First

Power users need speed:
```
Cmd+K → Quick actions
Cmd+N → New card
Cmd+F → Search
Enter → Edit
Esc → Cancel
Tab → Next field
```

### 6. Responsive Design

Mobile considerations:
- Table → Swipeable cards
- Grid stays grid
- Kanban → Horizontal scroll
- Forms → Stack fields

---

## Implementation Plan

### Phase 1: Core Foundation

**Backend:**
- [ ] Database schema in Convex
- [ ] CRUD mutations for projects
- [ ] CRUD mutations for templates
- [ ] CRUD mutations for cards
- [ ] Field type system setup

**Frontend:**
- [ ] Project list page
- [ ] Project creation flow
- [ ] Basic template builder UI
- [ ] Simple card form

**Deliverable:** Can create project, define 5 basic field types (text, number, date, dropdown, checkbox), create cards

---

### Phase 2: Field Types
**Implement all 42 field types:**

Week 3 Focus:
- [ ] TEXT category (6 types)
- [ ] NUMBERS category (4 types)  
- [ ] DATE & TIME category (5 types)
- [ ] SELECTION category (4 types)
- [ ] BOOLEAN category (2 types)

Week 4 Focus:
- [ ] LOCATION category (4 types)
- [ ] MEDIA category (4 types)
- [ ] RELATION category (3 types)
- [ ] SPECIAL category (6 types)
- [ ] ADVANCED category (4 types)

**Each field type needs:**
1. Config schema
2. Input component
3. Display component
4. Validation logic
5. Tests

**Deliverable:** All 42 field types functional

---

### Phase 3: Views & Visualization

**View System:**
- [ ] Table view (default)
  - Sortable columns
  - Resizable columns
  - Frozen first column
  - Inline editing
  - Bulk select
  
- [ ] Grid view
  - Responsive cards
  - Customizable card layout
  - Quick actions on hover
  
- [ ] Kanban view
  - Group by Status/Dropdown fields
  - Drag-and-drop between columns
  - Column limits (WIP limits)
  
- [ ] Calendar view
  - Group by Date fields
  - Month/Week/Day views
  - Create cards by clicking dates
  
- [ ] Gallery view
  - For Image-heavy projects
  - Large previews
  - Lightbox on click

**Filters & Sorting:**
- [ ] Add filter UI
- [ ] Multi-field filtering
- [ ] Save filter presets
- [ ] Sort by any field
- [ ] Multi-level sorting

**Search:**
- [ ] Full-text search across cards
- [ ] Search within specific fields
- [ ] Fuzzy matching

**Deliverable:** Complete view system with filtering

---

### Phase 4: Advanced Features

**Formulas:**
- [ ] Formula editor
- [ ] Math operations
- [ ] Date calculations
- [ ] String operations
- [ ] Conditional logic

**Automation:**
- [ ] Auto-number field
- [ ] Timestamp fields
- [ ] Lookup fields
- [ ] Rollup fields

**Collaboration:**
- [ ] Comments on cards
- [ ] @mentions
- [ ] Activity log
- [ ] Real-time updates

**Import/Export:**
- [ ] CSV import
- [ ] CSV export
- [ ] JSON export
- [ ] Excel import (future)

**Deliverable:** Production-ready feature set

---

### Phase 5: Polish & Testing

**Performance:**
- [ ] Optimize queries (1000+ cards)
- [ ] Implement pagination
- [ ] Virtual scrolling for large tables
- [ ] Debounce search

**Mobile:**
- [ ] Responsive layouts
- [ ] Touch gestures
- [ ] Mobile-optimized forms

**Testing:**
- [ ] Unit tests for field types
- [ ] Integration tests for views
- [ ] E2E tests for critical flows
- [ ] Performance testing

**Documentation:**
- [ ] User guide
- [ ] Video tutorials
- [ ] API documentation
- [ ] Migration guides

**Deliverable:** Production-ready, tested, documented

---

## Integration Strategy

### With Upload Micro-App

Media fields (File, Document, Image, Video) integrate with Upload:

```typescript
// User clicks "Upload Image" in Image field
openUploadModal({
  fileType: "image",
  onUploadComplete: (cdnUrl, metadata) => {
    // Save to card
    updateCardField(cardId, fieldId, {
      url: cdnUrl,
      fileName: metadata.fileName,
      fileSize: metadata.fileSize,
      width: metadata.width,
      height: metadata.height,
    });
  }
});
```

### With Cross-Poster Micro-App (Future)

Button field can trigger cross-posting:

```typescript
// Add Button field with action
{
  type: "button",
  label: "Post to Social Media",
  action: {
    type: "function",
    function: "cross_poster.createPost",
    params: {
      content: "{field_description}",
      image: "{field_photo}",
      platforms: ["twitter", "linkedin"]
    }
  }
}
```

### API for External Tools (DO NOT WORK ON THAT YET THIS IS A FUTURE FEATURE NOT IN MVP!)

Public API to allow external integrations:

```
POST /api/mapping/projects/{projectId}/cards
GET /api/mapping/projects/{projectId}/cards
PUT /api/mapping/projects/{projectId}/cards/{cardId}
DELETE /api/mapping/projects/{projectId}/cards/{cardId}
```

---

## Testing & QA

### Test Matrix

| Feature | Unit Tests | Integration Tests | E2E Tests |
|---------|------------|-------------------|-----------|
| Field Types | ✅ All 42 types | ✅ Input/Display | ✅ Create card flow |
| Views | ✅ Rendering logic | ✅ Filtering/Sorting | ✅ Switch views |
| CRUD | ✅ Mutations | ✅ Full lifecycle | ✅ Create→Edit→Delete |
| Formulas | ✅ Evaluation | ✅ Dependencies | ✅ Live updates |
| Import/Export | ✅ Parsers | ✅ Large files | ✅ Round-trip |

### Performance Benchmarks (DO NOT WORK ON THAT YET THIS IS A FUTURE FEATURE NOT IN MVP!)

**Target Metrics:**
- Load 100 cards: <500ms
- Load 1,000 cards: <2s
- Switch views: <200ms
- Filter 1,000 cards: <100ms
- Create card: <300ms

### Browser Support (DO NOT WORK ON THAT YET THIS IS A FUTURE FEATURE NOT IN MVP!)

- Chrome/Edge (latest 2)
- Firefox (latest 2)
- Safari (latest 2)
- Mobile Safari (iOS 15+)
- Chrome Mobile (Android 10+)

---

## Deployment Strategy

### Feature Flags (DO NOT WORK ON THAT, NO NEED FOR ENABLING/DISABLING should work out of the box)

Use Convex's environment variables:

```typescript
const MAPPING_ENABLED = process.env.ENABLE_MAPPING === "true";
const MAPPING_BETA_USERS = process.env.MAPPING_BETA_USERS?.split(",") || [];

// In Convex function
if (!MAPPING_ENABLED && !MAPPING_BETA_USERS.includes(userId)) {
  throw new Error("Feature not available");
}
```

### Rollout Plan (DO NOT WORK ON THAT, NO NEED FOR ROLLING OUT)

**Week 1:** Internal team only (dogfooding)
**Week 2:** Beta users (10 handpicked users)
**Week 3:** Gradual rollout (10% → 25% → 50%)
**Week 4:** Full release to all users

### Monitoring

**Key Metrics:**
- Projects created per day
- Cards created per project
- Most-used field types
- View usage (Table vs Grid vs Kanban)
- Error rates by feature
- Performance metrics

**Alerts:**
- Error rate >1%
- P95 latency >2s
- Failed card creations >5%

---

## Future Roadmap

### Phase 2 Features

**Advanced Views:**
- Timeline view (Gantt charts)
- Map view (for location fields)
- Chart view (analytics/graphs)

**Advanced Formulas:**
- IF/THEN/ELSE logic
- LOOKUP functions
- Array operations
- Regular expressions

**Automation:**
- Triggers (on create/update)
- Actions (send email, webhook)
- Scheduled tasks
- Button actions

**Collaboration:**
- Permissions per field
- View sharing
- Public forms
- Embedded views

---

## Technical Specifications

### File Structure

```
app/
├── m/                              # Mapping routes
│   ├── page.tsx                    # Project list
│   ├── new/page.tsx               # Create project
│   └── [projectId]/
│       ├── page.tsx               # Project view
│       ├── template/page.tsx      # Edit template
│       ├── views/[viewId]/        # Saved views
│       └── card/
│           ├── new/page.tsx       # Create card
│           └── [cardId]/page.tsx  # Edit card

components/
└── mapping/
    ├── field-types/               # All 42 field components
    │   ├── text.tsx
    │   ├── currency.tsx
    │   ├── image.tsx
    │   └── ...
    ├── views/
    │   ├── table-view.tsx
    │   ├── grid-view.tsx
    │   ├── kanban-view.tsx
    │   ├── calendar-view.tsx
    │   └── gallery-view.tsx
    ├── project-list.tsx
    ├── template-builder.tsx
    ├── card-form.tsx
    ├── field-selector.tsx
    ├── filter-builder.tsx
    └── export-dialog.tsx

convex/
└── mapping/
    ├── projects.ts                # Project CRUD
    ├── templates.ts               # Template management
    ├── cards.ts                   # Card CRUD
    ├── views.ts                   # View management
    ├── activity.ts                # Activity logging
    └── formulas.ts                # Formula evaluation

lib/
├── field-types.ts                 # Type definitions
├── field-config.ts                # Config schemas
├── field-validation.ts            # Validation logic
├── formula-engine.ts              # Formula evaluation
└── currencies.ts                  # Currency definitions
```

### Key Dependencies

```json
{
  "dependencies": {
    "@tiptap/react": "^2.1.0",           // Rich text editor
    "@tiptap/starter-kit": "^2.1.0",     
    "react-phone-number-input": "^3.3.0", // Phone input
    "date-fns": "^3.0.0",                // Date utilities
    "qrcode": "^1.5.3",                  // QR code generation
    "react-markdown": "^9.0.0",          // Markdown preview
    "mathjs": "^12.0.0",                 // Formula evaluation
    "@dnd-kit/core": "^6.1.0",           // Drag and drop (Kanban)
    "papaparse": "^5.4.1",               // CSV parsing
    "xlsx": "^0.18.5"                    // Excel import/export
  }
}
```
---
## Conclusion

The Mapping App represents a massive undertaking but has the potential to be EchoRay's flagship product. By building a truly flexible data management system with best-in-class UX, we can capture users who need more than spreadsheets but don't want to learn database concepts.

**Key Success Factors:**
1. **Simplicity first** - Hide complexity until needed
2. **Performance** - Must feel instant even with 1000s of cards
3. **Integration** - Leverage Upload, Cross-Poster, and future micro-apps
4. **Iteration** - Ship MVP fast, improve based on user feedback

**Next Steps:**
1. Review and approve this plan
2. Set up project tracking (use Mapping app! 😄)
3. Begin Phase 1 implementation
4. Weekly check-ins on progress

---

**Document Version:** 1.0  
**Last Updated:** January 19, 2026  
**Status:** Ready for Implementation
