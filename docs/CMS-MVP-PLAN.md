# CMS MVP Plan for Claude Opus 4.5

## Overview
Build a minimal viable CMS at `/admin/cms/work` with Public/Internal tabs to manage portfolio projects stored in Convex database.

---

## Database Schema (Convex)

### Project Record Structure

```typescript
projects: {
  // Core Identity
  id: string,
  name: string,
  slug: string, // for URL routing
  tagline: string,
  description: string, // rich text
  
  // Public Portfolio Data
  coverImage: string, // URL
  gallery: string[], // array of image URLs
  demoUrl: string,
  clientName: string,
  clientIndustry: string,
  projectType: string, // "website" | "web-app" | "e-commerce" | "saas"
  techStack: {
    frontend: string[],
    backend: string[],
    hosting: string
  },
  status: "completed" | "ongoing",
  completionDate: string,
  isPublished: boolean, // show on public /work page
  
  // Internal MVP Data (bare minimum)
  contractStartDate: string,
  domainExpiry: string,
  sslExpiry: string,
  hostingProvider: string,
  repoUrl: string,
  projectManager: string,
  leadDeveloper: string,
  projectValue: number,
  maintenancePlan: "none" | "basic" | "premium",
  internalNotes: string, // freeform text field
  
  // Metadata
  createdAt: number,
  updatedAt: number
}
```

---

## UI Structure

### Route: `/admin/cms/work`
**Layout:** Two-tab interface

#### Tab 1: Public Tab
Display/edit fields that appear on `/work` and `/work/[slug]`:
- Project name, tagline, description
- Cover image upload
- Gallery images (multi-upload)
- Demo URL
- Client name, industry
- Project type dropdown
- Tech stack (chips/tags input)
- Status toggle (completed/ongoing)
- **Publish toggle** (controls visibility on public site)

#### Tab 2: Internal Tab (MVP)
Simple form for operational tracking:
- Contract start date (date picker)
- Domain expiry (date picker) + alert if <30 days
- SSL expiry (date picker) + alert if <30 days
- Hosting provider (text input)
- Repository URL (text input)
- Project manager (text input)
- Lead developer (text input)
- Project value (number input, €)
- Maintenance plan (dropdown: none/basic/premium)
- Internal notes (textarea, freeform)

---

## Key Features

### Public Tab
1. **WYSIWYG editor** for description (use Tiptap/Slate)
2. **Image upload** with preview (Convex file storage)
3. **Tech stack chips** (add/remove tags)
4. **Live preview** of how card appears on `/work`

### Internal Tab
1. **Expiry warnings** (red badge if domain/SSL <30 days)
2. **Quick links** (open repo, demo URL in new tab)
3. **Auto-save** on field blur

### List View (`/admin/cms/work`)
- Table showing: Name | Status | Published | Domain Expiry | Actions
- Filter by: Published/Draft, Project Type
- Search by name
- "Add New Project" button → opens form

---

## Technical Implementation Steps

### 1. Convex Setup
```bash
# Define schema in convex/schema.ts
# Create mutations: createProject, updateProject, deleteProject
# Create queries: getProjects, getProjectBySlug
```

### 2. Admin Routes
```
/admin/cms/work (list view)
/admin/cms/work/new (create form)
/admin/cms/work/[id] (edit form with tabs)
```

### 3. Components Needed
- `ProjectList.tsx` - table with filters
- `ProjectForm.tsx` - tabbed form container
- `PublicTab.tsx` - public fields form
- `InternalTab.tsx` - internal fields form
- `ImageUpload.tsx` - drag-drop + preview
- `TechStackInput.tsx` - chips input
- `ExpiryBadge.tsx` - visual warning component

### 4. Public Site Integration
Fetch from Convex in `/work/page.tsx`:
```typescript
const projects = useQuery(api.projects.getPublishedProjects)
// Filter where isPublished === true
```

Dynamic route `/work/[slug]/page.tsx`:
```typescript
const project = useQuery(api.projects.getProjectBySlug, { slug })
```

---

## MVP Scope (What to Skip Now)
❌ Rich analytics/metrics tracking  
❌ Client testimonials (add later)  
❌ Case study long-form editor  
❌ Automated renewal reminders  
❌ Financial tracking beyond project value  
❌ Support ticket integration  
❌ Multi-user permissions  

✅ Focus: Get projects displayed publicly + track critical expiry dates

---

## Validation Rules
- Name: required, max 100 chars
- Slug: auto-generated from name, URL-safe
- Demo URL: valid URL format
- Dates: valid date format
- Project value: positive number
- At least 1 image required for published projects

---

## Next Steps After MVP
1. Add client testimonials field
2. Build expiry notification system (email alerts)
3. Add maintenance task tracking
4. Create analytics dashboard per project
5. Implement client portal access

---

## Implementation Priority Order

### Phase 1: Database Foundation
1. Set up Convex schema with project table
2. Create basic CRUD mutations
3. Create query functions for listing and fetching by slug

### Phase 2: Admin List View
1. Build `/admin/cms/work` page with table
2. Implement search and filters
3. Add "New Project" button

### Phase 3: Create/Edit Form
1. Build form layout with tabs
2. Implement Public tab fields
3. Implement Internal tab fields
4. Add image upload functionality
5. Add auto-save functionality

### Phase 4: Public Integration
1. Update `/work` page to fetch from Convex
2. Create `/work/[slug]` dynamic route
3. Style project cards and detail pages
4. Test published/draft filtering

### Phase 5: Polish
1. Add expiry date warnings
2. Implement form validation
3. Add loading states
4. Error handling

---

**Start with**: Database schema → List view → Form with tabs → Public page integration