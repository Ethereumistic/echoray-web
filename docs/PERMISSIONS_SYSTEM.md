# Echoray Permission System (v2)

This document explains the bitwise permission system implemented in Echoray. Use this as a reference for future AI or developer onboarding.

## 1. Architecture Overview

The system uses a **bitwise representation** for permissions, stored as 64-bit integers (BigInt in JS/Postgres). This allows for extremely fast permission checking and easy grouping of permissions.

### Permission Bit Ranges:
- **00 - 19**: Personal Context Permissions (`p.*`)
- **20 - 39**: Organization Context Permissions (`o.*`)
- **40 - 49**: App Feature Permissions (`app.*`)
- **50 - 63**: System/Staff Permissions (`system.*`)

### Hierarchy Defaults:
- **Owner**: God-mode within Org. Can invite/remove anyone.
- **Admin**: Cannot invite other Admins. Cannot remove other Admins. Cannot manage Roles/Settings by default.
- **Editor**: Can only invite Members. Cannot invite other Editors.
- **Member**: Baseline access. No invitation/removal powers.

## 2. Core Logic (Convex)

The source of truth for permissions resides in `convex/permissions.ts`.

### key Functions:
- `computeMemberPermissions(ctx, userId, orgId)`: The "Mother of all Checks". It resolves:
    1. The user's **Subscription Tier** base permissions.
    2. The **Organization Role** permissions.
    3. **Intersection (Capping)**: Org permissions are capped by what the organization owner's tier allows.
    4. **Owner Privilege**: Owners always get basic management bits (24-28).
    5. **System Admin**: Users with bit 50 (`system.admin`) get `MAX_SAFE_INTEGER`.

### Capping Logic Formula:
```typescript
finalPermissions = (
  userTier.basePermissions // Personal/Global bits
  | 
  (memberRole.permissions & orgOwnerTier.orgFeatures) // Capped Org bits
  |
  ORG_OWNER_BITS // Guaranteed bits if owner
)
```

## 3. Frontend Integration

### Auth Store (`src/stores/auth-store.ts`)
The `useAuthStore` holds a `permissions: Record<string, boolean>` object. This is populated by `OrgInitializer.tsx` using the `getUserPermissions` Convex query.

### Permission Checking:
- **Hook**: `const { hasPermission } = useAuthStore()`
- **Component**: `<PermissionGuard permission="o.project.create">`

### Scope Switching:
Permissions are automatically re-calculated and pushed to the frontend whenever the `activeOrganization` changes in the store.

## 4. Key Files
- `convex/permissions.ts`: Core bitwise logic and queries.
- `convex/seed.ts`: Source of truth for Bit Positions and Tiers.
- `src/types/permissions.ts`: Frontend types and bit mapping.
- `src/components/debug/permission-debugger.tsx`: Real-time inspection tool.

## 5. Adding a New Permission
1. Add to `convex/seed.ts` in the `permissions` array with a unique `bitPosition`.
2. Run `npx convex run seed:seedData`.
3. Add the code string (e.g., `o.new.feat`) to `PERMISSION_BITS` in `convex/permissions.ts` and `src/types/permissions.ts`.
4. Run `npx convex run seed:fixupRoles` if existing roles should grant it.
