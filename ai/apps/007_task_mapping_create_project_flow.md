# Task 007: Create Project Flow

**Status:** Not Started  
**Priority:** High  
**Estimated Time:** 3 hours  
**Dependencies:** Task 006  

## Objective

Create the project creation flow with a form for name, description, and icon selection.

## Deliverables

- [ ] Create new project page route
- [ ] Create project form component
- [ ] Add icon picker
- [ ] Implement validation
- [ ] Add success redirect

## Files to Create

### 1. Page: `src/app/(platform)/[scope]/[slug]/mapper/new/page.tsx`
### 2. Component: `src/components/apps/mapper/create-project-form.tsx`
### 3. Component: `src/components/apps/mapper/icon-picker.tsx`

## Implementation Notes

- Redirect to template builder after creation
- Pre-select default icon
- Keep form simple and focused
- Use existing form components from shadcn/ui

## Testing

- [ ] Form validation works
- [ ] Icon picker functions
- [ ] Project creates successfully
- [ ] Redirects correctly
- [ ] Cancel button works
