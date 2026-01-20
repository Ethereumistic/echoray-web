# Mapper: Bugs & Features Implementation Plan

**Created:** 2026-01-19  
**Status:** Ready for Implementation  
**Priority:** High

---

## 📋 Overview

This plan addresses critical bugs and adds powerful new features to enhance the Mapper table view experience. The focus is on improving URL handling, adding visual-only row numbers, enabling column management, implementing column reordering, and moving core functionality from the header to the table view.

---

## 🐛 Bug Fixes

### BUG-001: URL Field Protocol Handling 🔴 **CRITICAL**

**Current Issues:**
1. URL is stored with `https://` prefix unnecessarily
2. URL is displayed with `https://` prefix (not clean)
3. Critical bug: Deleting characters causes `https://https:/` duplication
4. Database bloat from storing redundant protocol
5. Field becomes empty when clicking to edit

**Root Cause:**
- Auto-prefixing logic is applied during input onChange
- Protocol is both stored AND displayed
- Backspace on the prefix causes concatenation bug

**Solution:**
- **NEVER store `https://` in the database** - store clean URLs only (e.g., `example.com` or `www.example.com`)
- **NEVER display `https://` in input fields** - show clean URLs only
- **Add `https://` ONLY when user clicks to open the URL**
- **Smart paste handling** - strip `https://` if user pastes full URL

**Files to Modify:**
- `src/components/apps/mapper/field-types/field-input.tsx`
- `src/components/apps/mapper/field-types/field-display.tsx`

**Tasks:**
- [x] Create task breakdown in this document

---

## ✨ New Features

### FEATURE-001: Visual-Only Row Numbers 📝

**Description:**
Add a `+ Add №` button on the left side of table headers that adds visual-only row numbers (01, 02, 03...) as a column. These numbers are NOT saved to the database and NOT part of the card data - they are purely for visualization.

**Requirements:**
- Button positioned on left side of table (before first column)
- Shows/hides a row number column
- Numbers are auto-incrementing: 01, 02, 03, 04...
- Numbers are NOT stored in database
- Numbers are NOT part of template fields
- Toggle on/off functionality
- Persist toggle state per project (localStorage)
- Numbers update automatically when rows are added/deleted

**Files to Modify:**
- `src/components/apps/mapper/views/table-view.tsx`

**Tasks:**
- [x] Create task breakdown in this document

---

### FEATURE-002: Add Column Functionality 📝

**Description:**
Add a `+ Add Column` button on the right side of table headers that allows users to add new fields directly from the table view. This will actually modify the database template.

**Requirements:**
- Button positioned on right side of table (after last column)
- Opens a field type selector (reuse existing component)
- Adds field to template (modifies database)
- New column appears immediately in table
- Should use existing `field-type-selector.tsx` and `field-editor.tsx` components

**Files to Modify:**
- `src/components/apps/mapper/views/table-view.tsx`
- Possibly create `src/components/apps/mapper/views/add-column-dialog.tsx`

**Integration:**
- Use existing `convex/mapping/templates.ts` → `addField` mutation
- Reuse `field-type-selector.tsx` for type selection
- Reuse `field-editor.tsx` for field configuration

**Tasks:**
- [x] Create task breakdown in this document

---

### FEATURE-003: Column Reordering 📝

**Description:**
Allow users to reorder table columns by dragging column headers. This should update the visual order without changing the database schema initially, then optionally persist the order.

**Requirements:**
- Drag-and-drop column headers
- Visual feedback during drag
- Update column order in real-time
- Persist order preference per user/project
- Should work seamlessly with existing columns

**Technical Approach:**
- Use `@dnd-kit/core` and `@dnd-kit/sortable` (already in project)
- Store column order in localStorage or create a `mapping_view_preferences` table
- Update field display order based on user preference

**Files to Modify:**
- `src/components/apps/mapper/views/table-view.tsx`

**Tasks:**
- [x] Create task breakdown in this document

---

### FEATURE-004: Vertical Column Borders 📝

**Description:**
Add vertical borders/lines to visually separate columns, just like we have horizontal lines separating rows.

**Requirements:**
- Consistent border style with horizontal row borders
- Applied to all table cells
- Clean, professional appearance
- Should work with all field types

**Files to Modify:**
- `src/components/apps/mapper/views/table-view.tsx`

**Tasks:**
- [x] Create task breakdown in this document

---

### FEATURE-005: Header Refactoring - Move to Table View 📝

**Description:**
Deprecate the template settings and "+New Card" functionality from the project header and move all CRUD operations directly to the table view. Replace header space with filtering and sorting controls.

**Phase 1: Move CRUD to Table**
- Move `+ Add Column` to table header right (FEATURE-002)
- `+ Add Row` already exists at table bottom
- Template editing moved to table context
- Remove `/template` route navigation from main view

**Phase 2: Add Filtering & Sorting**
- Add filter builder to header
- Add sort controls to header
- Filter by field type and value
- Multi-field sorting
- Save filter/sort presets

**Requirements:**
- All card creation happens in table view (already done via `+ Add Row`)
- All field management happens in table view (via `+ Add Column`)
- Header shows: Project name/icon, View switcher, Filter/Sort controls, Actions menu
- Clean, streamlined UX

**Files to Modify:**
- `src/components/apps/mapper/project-view.tsx` - Update header
- `src/components/apps/mapper/views/table-view.tsx` - Add controls
- Create `src/components/apps/mapper/filter-builder.tsx`
- Create `src/components/apps/mapper/sort-builder.tsx`

**Tasks:**
- [x] Create task breakdown in this document

---

## 🎯 Task Breakdown

### Task 1: Fix URL Field Protocol Bug 🔴 **START HERE**

**Priority:** Critical  
**Estimated Time:** 30 minutes  
**Complexity:** Medium

**Steps:**
1. **Update `field-input.tsx` URL handling:**
   - Remove auto-prepending logic from onChange
   - Add utility function `stripProtocol()` to remove `https://`, `http://`, `www.` prefixes
   - Apply `stripProtocol()` on value change before saving
   - Apply `stripProtocol()` on paste events
   - Ensure input displays clean URL without protocol

2. **Update `field-display.tsx` URL rendering:**
   - Store URL without protocol in database
   - Add utility function `addProtocol()` to prepend `https://`
   - Apply `addProtocol()` ONLY when rendering the clickable link
   - Display the clean URL text (without protocol)
   - Ensure link href has full URL with protocol

3. **Test cases:**
   - User types `example.com` → saves as `example.com`, links to `https://example.com`
   - User types `www.example.com` → saves as `example.com`, links to `https://example.com`
   - User pastes `https://example.com` → saves as `example.com`, links to `https://example.com`
   - User edits existing URL → no empty field bug
   - User deletes characters → no protocol duplication bug

**Deliverable:** URL fields work cleanly without protocol storage/display bugs

---

### Task 2: Add Visual-Only Row Numbers

**Priority:** High  
**Estimated Time:** 45 minutes  
**Complexity:** Low

**Steps:**
1. **Add state for row numbers toggle:**
   - Add `showRowNumbers` state (boolean)
   - Persist in localStorage with key pattern: `mapper_${projectId}_showRowNumbers`

2. **Create `+ Add №` button:**
   - Position in table header, left side (before columns)
   - Toggle `showRowNumbers` on click
   - Button active state when row numbers are shown

3. **Render row number column:**
   - Conditional column before first data column
   - Width: fixed (e.g., 60px)
   - Header: "№" or "#"
   - Cells: Format as `01`, `02`, `03` using `.toString().padStart(2, '0')`
   - Style consistently with other columns

4. **Handle row number updates:**
   - Auto-update when cards are added/deleted
   - Numbers based on array index + 1
   - No database interaction

**Deliverable:** Toggle-able visual row numbers column

---

### Task 3: Add Column Functionality (+ Add Column Button)

**Priority:** High  
**Estimated Time:** 60 minutes  
**Complexity:** Medium

**Steps:**
1. **Add `+ Add Column` button:**
   - Position in table header, right side (after last column)
   - Opens field type selector dialog

2. **Create or reuse dialog component:**
   - Option 1: Reuse existing `field-type-selector.tsx` as modal
   - Option 2: Create new `add-column-dialog.tsx` wrapper
   - Include field type selection
   - Include field name input
   - Include required toggle

3. **Connect to backend:**
   - Call `convex/mapping/templates.ts` → `addField` mutation
   - Pass field configuration
   - Optimistic UI update or wait for mutation

4. **Update table view:**
   - Re-fetch template after field added
   - New column appears at the end
   - Show success toast notification

**Deliverable:** Users can add new fields directly from table view

---

### Task 4: Column Reordering (Drag & Drop)

**Priority:** Medium  
**Estimated Time:** 90 minutes  
**Complexity:** High

**Steps:**
1. **Install/verify dnd-kit:**
   - Check if `@dnd-kit/core` and `@dnd-kit/sortable` are installed
   - If not: `pnpm add @dnd-kit/core @dnd-kit/sortable`

2. **Implement drag-and-drop on column headers:**
   - Wrap headers in `<SortableContext>`
   - Use `horizontal` orientation
   - Use `useSortable` hook for each header
   - Add drag handle icon/indicator

3. **Handle reorder logic:**
   - On drag end, update local column order state
   - Persist to localStorage: `mapper_${projectId}_columnOrder`
   - Format: `{ fieldId: orderIndex }` mapping

4. **Apply order to table:**
   - Sort fields array based on stored order preference
   - Ensure cells follow same order as headers

5. **Visual feedback:**
   - Show drag overlay/ghost during drag
   - Highlight drop zones
   - Smooth transitions

**Deliverable:** Users can reorder columns by dragging headers

---

### Task 5: Add Vertical Column Borders

**Priority:** Low  
**Estimated Time:** 15 minutes  
**Complexity:** Very Low

**Steps:**
1. **Update table cell styles:**
   - Add `border-r` class to all `<th>` elements
   - Add `border-r` class to all `<td>` elements
   - Match border color with existing horizontal borders
   - Use same border width (likely `border-border`)

2. **Test:**
   - Verify borders appear between all columns
   - Check consistency with horizontal borders
   - Ensure responsive behavior

**Deliverable:** Clean vertical borders separating columns

---

### Task 6: Header Refactoring - Filtering & Sorting

**Priority:** Medium  
**Estimated Time:** 120 minutes  
**Complexity:** High

**Phase A: Simplify Header**
1. **Remove from header:**
   - "Configure Template" button/link
   - "+ New Card" button (if exists)
   
2. **Update header layout:**
   - Left: Project icon + name
   - Center: View switcher (Table/Grid)
   - Right: Filter button, Sort button, Actions menu

**Phase B: Create Filter Builder**
1. **Create `filter-builder.tsx` component:**
   - List all fields as filter options
   - Filter types based on field type:
     - Text: contains, equals, starts with, ends with
     - Number/Currency: equals, greater than, less than, between
     - Date: before, after, between
     - Checkbox: is checked, is not checked
   - Multi-filter support (AND/OR logic)
   - Clear all filters button

2. **Apply filters:**
   - Filter cards array in table view
   - Show active filter count in header
   - Persist filters to localStorage

**Phase C: Create Sort Builder**
1. **Create  `sort-builder.tsx` component:**
   - List all fields as sort options
   - Ascending/Descending toggle
   - Multi-level sorting (sort by X, then by Y)
   - Clear sort button

2. **Apply sorting:**
   - Sort cards array in table view
   - Show active sort indicator in header
   - Persist sort to localStorage

**Phase D: Backend (Future Enhancement)**
- Move filtering/sorting to Convex queries for better performance
- Add indexes for commonly filtered/sorted fields

**Deliverable:** Full filtering and sorting from header, streamlined CRUD in table

---

## 📅 Implementation Order

**Day 1: Critical Fixes**
1. ✅ **Task 1: Fix URL Protocol Bug** (30 min) - CRITICAL
2. ✅ **Task 5: Add Vertical Borders** (15 min) - Quick win

**Day 2: Core Features**
3. ✅ **Task 2: Row Numbers** (45 min) - User-requested
4. ✅ **Task 3: Add Column** (60 min) - High value

**Day 3: Advanced Features**
5. ✅ **Task 4: Column Reordering** (90 min) - Polish
6. ✅ **Task 6: Filtering & Sorting** (120 min) - Major feature

---

## 🧪 Testing Checklist

### URL Field Testing
- [ ] Type `example.com` → saved correctly, opens correctly
- [ ] Type `www.example.com` → cleaned and works
- [ ] Paste `https://example.com` → cleaned and works
- [ ] Edit existing URL → no empty field
- [ ] Delete characters in URL → no duplication bug
- [ ] External link click → full URL with protocol

### Row Numbers Testing
- [ ] Toggle button shows/hides column
- [ ] Numbers format correctly (01, 02, 03...)
- [ ] Numbers update when rows added
- [ ] Numbers update when rows deleted
- [ ] State persists on page refresh

### Add Column Testing
- [ ] Button opens field selector
- [ ] Can select all field types
- [ ] New column appears immediately
- [ ] Can edit new column values
- [ ] Template updated in database

### Column Reordering Testing
- [ ] Can drag column headers
- [ ] Cells follow header order
- [ ] Order persists on refresh
- [ ] Works with all field types
- [ ] Visual feedback during drag

### Vertical Borders Testing
- [ ] Borders appear between all columns
- [ ] Border style matches horizontal borders
- [ ] Works in all views
- [ ] Responsive on mobile

### Filtering Testing
- [ ] Can filter by any field
- [ ] Multiple filters work (AND logic)
- [ ] Filters update table immediately
- [ ] Can clear filters
- [ ] Filter state persists

### Sorting Testing
- [ ] Can sort by any field
- [ ] Ascending/descending works
- [ ] Multi-level sorting works
- [ ] Can clear sort
- [ ] Sort state persists

---

## 📁 Files Impacted

### To Modify
- `src/components/apps/mapper/field-types/field-input.tsx` - URL fix
- `src/components/apps/mapper/field-types/field-display.tsx` - URL fix
- `src/components/apps/mapper/views/table-view.tsx` - ALL features
- `src/components/apps/mapper/project-view.tsx` - Header refactor

### To Create
- `src/components/apps/mapper/filter-builder.tsx` - NEW
- `src/components/apps/mapper/sort-builder.tsx` - NEW
- `src/lib/mapper/utils.ts` - Utility functions (stripProtocol, addProtocol)

### Backend (No Changes Needed)
- All existing Convex functions work as-is
- Future optimization: Move filter/sort to backend

---

## 🎯 Success Criteria

### Bug Fix Success
- ✅ URL fields have NO protocol duplication bugs
- ✅ URLs stored cleanly in database
- ✅ URLs display cleanly in UI
- ✅ URLs open correctly with full protocol

### Feature Success
- ✅ Users can toggle visual row numbers
- ✅ Users can add columns from table view
- ✅ Users can reorder columns by dragging
- ✅ Columns have clear visual separation
- ✅ Users can filter data by multiple criteria
- ✅ Users can sort data by multiple fields
- ✅ Header is streamlined and focused

### UX Success
- ✅ Table view is self-sufficient (no need to leave page)
- ✅ Common actions are fast and intuitive
- ✅ Visual hierarchy is clear
- ✅ No confusing workflows
- ✅ Professional, polished appearance

---

## 🚀 Ready to Implement!

All tasks are well-defined and ready to execute. Start with **Task 1** (URL bug fix) as it's critical, then proceed in the recommended order for best results.
