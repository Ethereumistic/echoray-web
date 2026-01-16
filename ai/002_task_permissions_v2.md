🎯 ECHORAY PERMISSION SYSTEM REFACTOR PLAN
Executive Summary
Current State: Spaghetti code with leaks, race conditions, and architectural flaws
Target State: Robust, testable, type-safe permission system with clear separation of concerns
Tech Stack: Next.js 15 (app router), TypeScript, Zod, Zustand, Convex, shadcn-ui, pnpm
Approach: Complete refactor from ground up
OS: Windows 11

🏗️ Architecture Overview
Core Principle: Scoped Permissions with Tier Capping
User's Personal Tier
  ↓
  Determines:
  1. Personal permissions (p.*)
  2. Ability to create orgs
  3. Max orgs allowed
  
Organization Owner's Tier
  ↓
  Sets the ceiling for ALL org members:
  1. Available org features (o.*)
  2. What roles can grant
  3. Org-wide limits
  
Member's Role in Org
  ↓
  Grants permissions WITHIN the org tier ceiling:
  1. Member: view, use
  2. Editor: + edit, invite members
  3. Admin: + create, delete, manage roles
  
Owner Status
  ↓
  Grants ALL org permissions up to their tier ceiling
  + danger zone permissions
Permission Resolution Formula
typescript// For organization context
finalPermissions = (
  userTier.basePermissions // Personal (p.*) permissions
  | 
  (memberRole.permissions & ownerTier.orgFeatures) // Org permissions capped
  |
  (isOwner ? ALL_ORG_PERMISSIONS & ownerTier.orgFeatures : 0) // Owner gets all
  |
  overrides // Individual grants/denies
) & PUBLIC_BITS_MASK // Strip system bits unless staff

📊 Corrected Database Schema
1. Subscription Tiers
typescript// convex/schema.ts - CORRECTED
subscriptionTiers: defineTable({
  name: v.string(), // 'Free', 'Web', 'App', 'CRM', 'Staff Admin'
  slug: v.string(), // 'free', 'web', 'app', 'crm', 'staff_admin'
  type: v.union(v.literal("commercial"), v.literal("system")),
  priceEur: v.number(),
  isCustom: v.boolean(),
  
  // Personal permissions (p.* + global)
  // What THIS user can do in personal realm
  basePermissions: v.number(), // Bitwise: p.project.create, profile.*, etc.
  
  // Organization features (o.*)
  // What orgs OWNED by this tier can do (CEILING for all members)
  orgFeatures: v.number(), // Bitwise: o.project.*, o.member.*, etc.
  
  // Limits
  maxPersonalProjects: v.number(), // e.g., Free=1, Web=3, App=10, CRM=unlimited
  maxOrganizations: v.number(), // Free=0, Web=1, App=5, CRM=15
  maxMembersPerOrg: v.optional(v.number()), // null = unlimited
  
  // Marketing
  description: v.optional(v.string()),
  features: v.optional(v.array(v.string())),
})
Seed Data:
typescript// FREE tier
{
  slug: 'free',
  priceEur: 0,
  basePermissions: 0b1111, // p.profile.*, p.project.create (bits 0-3)
  orgFeatures: 0, // Cannot create orgs
  maxPersonalProjects: 1,
  maxOrganizations: 0, // Cannot create orgs
}

// WEB tier
{
  slug: 'web',
  priceEur: 99,
  basePermissions: 0b11111111, // p.* + analytics.basic, export.basic
  orgFeatures: 0b111111100000000000000000, // o.project.*, o.member.invite (bits 20-25)
  maxPersonalProjects: 3,
  maxOrganizations: 1,
  maxMembersPerOrg: 5,
}

// APP tier
{
  slug: 'app',
  priceEur: 299,
  basePermissions: 0b1111111111111, // All from WEB + api.access, export.advanced
  orgFeatures: 0b1111111111111100000000000000, // All from WEB + o.project.delete, o.role.manage
  maxPersonalProjects: 10,
  maxOrganizations: 5,
  maxMembersPerOrg: 20,
}

// CRM tier
{
  slug: 'crm',
  priceEur: 900,
  basePermissions: 0b111111111111111111111, // All commercial permissions
  orgFeatures: 0b11111111111111111111100000000000000, // All o.* permissions
  maxPersonalProjects: -1, // unlimited
  maxOrganizations: 15,
  maxMembersPerOrg: null, // unlimited
}

// STAFF_ADMIN (system tier)
{
  slug: 'staff_admin',
  type: 'system',
  priceEur: 0,
  basePermissions: Number.MAX_SAFE_INTEGER, // All bits
  orgFeatures: Number.MAX_SAFE_INTEGER,
  maxPersonalProjects: -1,
  maxOrganizations: -1,
}
2. Organizations
typescript// Organizations DO NOT have their own subscription
// They inherit capabilities from owner's tier
organizations: defineTable({
  name: v.string(),
  ownerId: v.id("users"), // Owner's tier determines org capabilities
  
  // NO subscriptionTierId here!
  // Org capabilities = owner's tier.orgFeatures
  
  // Custom overrides (for custom CRM configs)
  customPermissions: v.optional(v.number()), // Additional permissions
  customLimits: v.optional(v.object({
    maxMembers: v.optional(v.number()),
    maxProjects: v.optional(v.number()),
  })),
  
  // Danger zone (only owner can do these)
  dangerZoneActions: v.optional(v.array(v.string())), // ['delete_org', 'transfer_ownership']
})
3. Roles (Organization-scoped)
typescriptroles: defineTable({
  organizationId: v.id("organizations"),
  name: v.string(), // 'member', 'editor', 'admin'
  
  // ONLY o.* permissions (bits 20-39)
  // CANNOT grant permissions the org doesn't have
  permissions: v.number(), // Will be capped by ownerTier.orgFeatures
  
  isSystemRole: v.boolean(),
  systemRoleType: v.optional(v.union(
    v.literal("member"),
    v.literal("editor"),
    v.literal("admin")
  )),
})
System Roles (auto-created per org):
typescript// MEMBER (default)
{
  name: 'Member',
  permissions: setBits([20, 21]), // o.project.view, o.project.use
  isSystemRole: true,
  systemRoleType: 'member',
}

// EDITOR
{
  name: 'Editor',
  permissions: setBits([20, 21, 22, 25]), // + o.project.edit, o.member.invite
  isSystemRole: true,
  systemRoleType: 'editor',
}

// ADMIN
{
  name: 'Admin',
  permissions: setBits([20-32]), // All o.* except danger zone
  isSystemRole: true,
  systemRoleType: 'admin',
}

🔢 Permission Bit Mapping (CORRECTED)
typescript// convex/permissions/bits.ts

export const PERMISSION_BITS = {
  // === PERSONAL/GLOBAL (0-19) ===
  'p.profile.view': 0,
  'p.profile.edit': 1,
  'p.profile.delete': 2,
  'p.project.create': 3, // Can create personal projects
  'p.project.view': 4,
  'p.project.edit': 5,
  
  'analytics.basic': 6,
  'analytics.advanced': 7,
  'export.basic': 8,
  'export.advanced': 9,
  'api.access': 10,
  'webhooks.manage': 11,
  'crm.access': 12, // Personal CRM features
  
  // === ORGANIZATION (20-39) ===
  'o.project.view': 20,
  'o.project.use': 21,
  'o.project.create': 22,
  'o.project.edit': 23,
  'o.project.delete': 24,
  
  'o.member.view': 25,
  'o.member.invite': 26,
  'o.member.remove': 27,
  'o.editor.invite': 28,
  'o.editor.remove': 29,
  'o.admin.invite': 30,
  'o.admin.remove': 31,
  
  'o.role.manage': 32,
  'o.settings.view': 33,
  'o.settings.edit': 34,
  'o.billing.view': 35,
  'o.billing.manage': 36,
  
  // Owner danger zone (37-39)
  'o.owner.delete_org': 37,
  'o.owner.transfer': 38,
  'o.owner.rename': 39,
  
  // === MINI-APPS (40-49) ===
  'app.invoice': 40,
  'app.qr': 41,
  'app.crosspost': 42,
  
  // === SYSTEM (50+) ===
  'system.admin': 50,
  'system.support': 51,
  'system.debug': 52,
  'system.impersonate': 53,
} as const;

// Bitmasks
export const PERSONAL_BITS_MASK = (1n << 20n) - 1n; // Bits 0-19
export const ORG_BITS_MASK = ((1n << 40n) - 1n) ^ PERSONAL_BITS_MASK; // Bits 20-39
export const APP_BITS_MASK = ((1n << 50n) - 1n) ^ ((1n << 40n) - 1n); // Bits 40-49
export const SYSTEM_BITS_MASK = ~((1n << 50n) - 1n); // Bits 50+
export const PUBLIC_BITS_MASK = (1n << 50n) - 1n; // Everything except system

🔐 Core Permission Logic (COMPLETE REFACTOR)
File: convex/permissions/compute.ts
typescriptimport { Id } from "../_generated/dataModel";
import { PERMISSION_BITS, ORG_BITS_MASK, SYSTEM_BITS_MASK } from "./bits";

/**
 * CORE PERMISSION COMPUTATION
 * 
 * Rules:
 * 1. User's tier.basePermissions = personal (p.*) permissions
 * 2. Org owner's tier.orgFeatures = ceiling for ALL org members
 * 3. Member's role.permissions = what they're granted (capped by #2)
 * 4. Owner gets ALL org permissions within their tier
 * 5. Staff admin bypasses everything
 */
export async function computePermissions(
  ctx: any,
  userId: Id<"users">,
  organizationId: Id<"organizations"> | null
): Promise<bigint> {
  
  // === 1. Get user and their tier ===
  const user = await ctx.db.get(userId);
  if (!user) return 0n;
  
  const userTier = user.subscriptionTierId 
    ? await ctx.db.get(user.subscriptionTierId) 
    : null;
  
  // === 2. Staff Admin Godmode ===
  if (userTier?.type === 'system') {
    return BigInt(Number.MAX_SAFE_INTEGER);
  }
  
  // Start with user's personal permissions
  let permissions = BigInt(userTier?.basePermissions || 0);
  
  // === 3. No org context = personal realm only ===
  if (!organizationId) {
    return permissions; // Only p.* permissions
  }
  
  // === 4. Get organization and membership ===
  const org = await ctx.db.get(organizationId);
  if (!org) return permissions; // Org doesn't exist
  
  const membership = await ctx.db
    .query("organizationMembers")
    .withIndex("by_org_user", (q) =>
      q.eq("organizationId", organizationId).eq("userId", userId)
    )
    .first();
  
  if (!membership || membership.status !== "active") {
    return permissions; // Not a member, only personal permissions
  }
  
  // === 5. Get org owner's tier (the CEILING) ===
  const owner = await ctx.db.get(org.ownerId);
  const ownerTier = owner?.subscriptionTierId 
    ? await ctx.db.get(owner.subscriptionTierId) 
    : null;
  
  const orgFeatureCap = BigInt(ownerTier?.orgFeatures || 0);
  
  // === 6. Owner gets ALL org permissions within their tier ===
  if (org.ownerId === userId) {
    // Owner gets all o.* bits within their tier + danger zone
    const allOrgBits = ORG_BITS_MASK & orgFeatureCap;
    const dangerZoneBits = BigInt(
      (1 << PERMISSION_BITS['o.owner.delete_org']) |
      (1 << PERMISSION_BITS['o.owner.transfer']) |
      (1 << PERMISSION_BITS['o.owner.rename'])
    );
    
    permissions |= (allOrgBits | dangerZoneBits);
    return permissions;
  }
  
  // === 7. Get member's role permissions (CAPPED by org features) ===
  const memberRoles = await ctx.db
    .query("memberRoles")
    .withIndex("by_memberId", (q) => q.eq("memberId", membership._id))
    .collect();
  
  let rolePermissions = 0n;
  for (const mr of memberRoles) {
    const role = await ctx.db.get(mr.roleId);
    if (role) {
      rolePermissions |= BigInt(role.permissions);
    }
  }
  
  // CRITICAL: Cap role permissions by org features
  const cappedRolePermissions = rolePermissions & orgFeatureCap;
  permissions |= cappedRolePermissions;
  
  // === 8. Apply individual overrides (still capped) ===
  const overrides = await ctx.db
    .query("memberPermissionOverrides")
    .withIndex("by_memberId", (q) => q.eq("memberId", membership._id))
    .filter((q) =>
      q.or(
        q.eq(q.field("expiresAt"), undefined),
        q.gt(q.field("expiresAt"), Date.now())
      )
    )
    .collect();
  
  for (const override of overrides) {
    const permission = await ctx.db.get(override.permissionId);
    if (!permission) continue;
    
    const bit = 1n << BigInt(permission.bitPosition);
    
    // Check if it's an org permission
    const isOrgPerm = (bit & ORG_BITS_MASK) !== 0n;
    
    if (override.allow) {
      // Can only grant if org has this feature
      if (!isOrgPerm || (orgFeatureCap & bit) !== 0n) {
        permissions |= bit;
      }
    } else {
      // Deny always works
      permissions &= ~bit;
    }
  }
  
  // === 9. Strip system bits (unless staff) ===
  if (userTier?.type !== 'system') {
    permissions &= ~SYSTEM_BITS_MASK;
  }
  
  return permissions;
}

/**
 * Check a single permission
 */
export async function checkPermission(
  ctx: any,
  userId: Id<"users">,
  organizationId: Id<"organizations"> | null,
  permissionCode: string
): Promise<boolean> {
  const bitPosition = PERMISSION_BITS[permissionCode];
  if (bitPosition === undefined) return false;
  
  const permissions = await computePermissions(ctx, userId, organizationId);
  const bit = 1n << BigInt(bitPosition);
  
  return (permissions & bit) !== 0n;
}

🎨 Frontend Implementation
1. Zustand Store: stores/permissionStore.ts
typescriptimport { create } from 'zustand';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface PermissionState {
  // Current context
  currentOrgId: Id<"organizations"> | null;
  
  // Computed permissions (cached)
  permissions: Record<string, boolean>;
  permissionsLoading: boolean;
  
  // Actions
  setCurrentOrg: (orgId: Id<"organizations"> | null) => void;
  checkPermission: (code: string) => boolean;
  checkAny: (...codes: string[]) => boolean;
  checkAll: (...codes: string[]) => boolean;
  refreshPermissions: () => Promise<void>;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  currentOrgId: null,
  permissions: {},
  permissionsLoading: false,
  
  setCurrentOrg: (orgId) => {
    set({ currentOrgId: orgId });
    get().refreshPermissions();
  },
  
  checkPermission: (code) => {
    return get().permissions[code] === true;
  },
  
  checkAny: (...codes) => {
    return codes.some(code => get().checkPermission(code));
  },
  
  checkAll: (...codes) => {
    return codes.every(code => get().checkPermission(code));
  },
  
  refreshPermissions: async () => {
    set({ permissionsLoading: true });
    try {
      // This will be called via useQuery hook, not directly
      // Placeholder - actual implementation uses Convex hooks
    } finally {
      set({ permissionsLoading: false });
    }
  },
}));
2. React Hook: hooks/usePermissions.ts
typescriptimport { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { usePermissionStore } from '@/stores/permissionStore';

export function usePermissions() {
  const { currentOrgId, setCurrentOrg } = usePermissionStore();
  
  // Fetch permissions from Convex
  const permissions = useQuery(
    api.permissions.getUserPermissions,
    currentOrgId ? { organizationId: currentOrgId } : {}
  );
  
  const can = (permissionCode: string): boolean => {
    return permissions?.[permissionCode] === true;
  };
  
  const canAny = (...codes: string[]): boolean => {
    return codes.some(code => can(code));
  };
  
  const canAll = (...codes: string[]): boolean => {
    return codes.every(code => can(code));
  };
  
  return {
    permissions: permissions || {},
    loading: permissions === undefined,
    can,
    canAny,
    canAll,
    setCurrentOrg,
    currentOrgId,
  };
}
3. Permission Guard Component: components/PermissionGuard.tsx
typescriptimport { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert } from '@/components/ui/alert';

interface PermissionGuardProps {
  permission: string | string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showError?: boolean;
  children: ReactNode;
}

export function PermissionGuard({
  permission,
  requireAll = false,
  fallback = null,
  showError = false,
  children,
}: PermissionGuardProps) {
  const { can, canAll, canAny, loading } = usePermissions();
  
  if (loading) return null;
  
  const codes = Array.isArray(permission) ? permission : [permission];
  const hasPermission = requireAll ? canAll(...codes) : canAny(...codes);
  
  if (!hasPermission) {
    if (showError) {
      return (
        <Alert variant="destructive">
          You don't have permission to access this feature.
        </Alert>
      );
    }
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
4. Scope Provider: components/ScopeProvider.tsx
typescript'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { usePermissionStore } from '@/stores/permissionStore';
import { Id } from '@/convex/_generated/dataModel';

/**
 * Automatically sets permission scope based on URL
 * /p/* = personal realm (no org)
 * /o/[orgId]/* = organization realm
 */
export function ScopeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setCurrentOrg } = usePermissionStore();
  
  useEffect(() => {
    if (pathname.startsWith('/p/')) {
      // Personal realm
      setCurrentOrg(null);
    } else if (pathname.startsWith('/o/')) {
      // Extract org ID from URL: /o/[orgId]/...
      const match = pathname.match(/^\/o\/([^\/]+)/);
      if (match) {
        setCurrentOrg(match[1] as Id<"organizations">);
      }
    }
  }, [pathname, setCurrentOrg]);
  
  return <>{children}</>;
}

🐛 Staff Admin Debug Panel
Component: components/StaffDebugPanel.tsx
typescript'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSION_BITS } from '@/convex/permissions/bits';

export function StaffDebugPanel() {
  const { can, permissions, currentOrgId } = usePermissions();
  const [showPanel, setShowPanel] = useState(false);
  
  const currentUser = useQuery(api.users.getCurrentUser);
  const changeTier = useMutation(api.debug.changeTier);
  
  // Only show for staff admins
  if (!can('system.debug')) return null;
  
  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded"
      >
        🐛 Debug
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] overflow-auto bg-black text-white p-4 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Staff Debug Panel</h3>
        <button onClick={() => setShowPanel(false)}>✕</button>
      </div>
      
      {/* Current User Info */}
      <div className="mb-4 p-2 bg-gray-800 rounded">
        <h4 className="font-semibold">User Info</h4>
        <p className="text-sm">ID: {currentUser?._id}</p>
        <p className="text-sm">Email: {currentUser?.email}</p>
        <p className="text-sm">Tier: {currentUser?.subscriptionTierId}</p>
      </div>
      
      {/* Current Org Info */}
      {currentOrgId && (
        <div className="mb-4 p-2 bg-gray-800 rounded">
          <h4 className="font-semibold">Organization Context</h4>
          <p className="text-sm">Org ID: {currentOrgId}</p>
        </div>
      )}
      
      {/* Permissions Breakdown */}
      <div className="mb-4 p-2 bg-gray-800 rounded max-h-64 overflow-auto">
        <h4 className="font-semibold mb-2">Active Permissions</h4>
        
        {/* Group by scope */}
        {['Personal', 'Organization', 'System'].map(scope => {
          const prefix = scope === 'Personal' ? 'p.' : scope === 'Organization' ? 'o.' : 'system.';
          const perms = Object.entries(permissions)
            .filter(([code]) => code.startsWith(prefix))
            .filter(([_, has]) => has);
          
          if (perms.length === 0) return null;
          
          return (
            <div key={scope} className="mb-2">
              <p className="text-xs font-bold text-blue-400">{scope}</p>
              {perms.map(([code]) => (
                <p key={code} className="text-xs ml-2">✓ {code}</p>
              ))}
            </div>
          );
        })}
      </div>
      
      {/* Tier Switcher */}
      <div className="mb-4 p-2 bg-gray-800 rounded">
        <h4 className="font-semibold mb-2">Change Tier (Danger!)</h4>
        <select
          className="w-full bg-gray-700 text-white p-1 rounded text-sm"
          onChange={(e) => {
            if (confirm('This will change your tier. Continue?')) {
              changeTier({ tierId: e.target.value as any });
            }
          }}
        >
          <option value="">Select tier...</option>
          <option value="free">Free</option>
          <option value="web">Web (€99)</option>
          <option value="app">App (€299)</option>
          <option value="crm">CRM (€900+)</option>
          <option value="staff_admin">Staff Admin</option>
        </select>
        <p className="text-xs text-red-400 mt-1">
          ⚠️ Removing staff_admin requires manual DB edit!
        </p>
      </div>
      
      {/* Permission Bits Visualization */}
      <div className="p-2 bg-gray-800 rounded">
        <h4 className="font-semibold mb-2">Bitwise Representation</h4>
        <div className="text-xs font-mono">
          {Object.entries(PERMISSION_BITS).map(([code, bit]) => (
            <div key={code} className="flex justify-between">
              <span>{code}</span>
              <span className={permissions[code] ? 'text-green-400' : 'text-gray-600'}>
                {bit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

📝 Convex Queries & Mutations
File: convex/permissions/queries.ts
typescriptimport { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { auth } from "../auth";
import { computePermissions, checkPermission } from "./compute";

/**
 * Get all permissions for current user
 */
export const getUserPermissions = query({
  args: { organizationId: v.optional(v.id("organizations")) },
  handler: async (ctx, { organizationId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return {};
    
    const permissions = await computePermissions(
      ctx,
      userId,
      organizationId || null
    );
    
    // Convert to permission code -> boolean map
    const allPermissions = await ctx.db.query("permissions").collect();
    const result: Record<string, boolean> = {};
    
    for (const p of allPermissions) {
      const bit = 1n << BigInt(p.bitPosition);
      result[p.code] = (permissions & bit) !== 0n;
    }
    
    return result;
  },
});

/**
 * Check a specific permission
 */
export const can = query({
  args: {
    permissionCode: v.string(),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, { permissionCode, organizationId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return false;
    
    return await checkPermission(
      ctx,
      userId,
      organizationId || null,
      permissionCode
    );
  },
});

/**
 * Get detailed permission breakdown for debugging
 */
export const getPermissionBreakdown = query({
  args: { organizationId: v.optional(v.id("organizations")) },
  handler: async (ctx, { organizationId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    
    const user = await ctx.db.get(userId);
    const userTier = user?.subscriptionTierId 
      ? await ctx.db.get(user.subscriptionTierId) 
      : null;
    
    let breakdown: any = {
      userId,
      userTier: userTier?.name || 'None',
      userTierPermissions: userTier?.basePermissions || 0,
      organizationId,
      isOwner: false,
      rolePermissions: 0,
      orgFeatureCap: 0,
      finalPermissions: 0,
    };
    
    if (organizationId) {
      const org = await ctx.db.get(organizationId);
      breakdown.isOwner = org?.ownerId === userId;
      
      const owner = org ? await ctx.db.get(org.ownerId) : null;
      const ownerTier = owner?.subscriptionTierId 
        ? await ctx.db.get(owner.subscriptionTierId) 
        : null;
      
      breakdown.orgOwnerTier = ownerTier?.name || 'None';
      breakdown.orgFeatureCap = ownerTier?.orgFeatures || 0;
    }
    
    breakdown.finalPermissions = Number(
      await computePermissions(ctx, userId, organizationId || null)
    );
    
    return breakdown;
  },
});
File: convex/debug.ts (Staff Only)
typescriptimport { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { checkPermission } from "./permissions/compute";

/**
 * Change user's tier (staff only, for debugging)
 */
export const changeTier = mutation({
  args: { tierId: v.id("subscriptionTiers") },
  handler: async (ctx, { tierId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Check if staff admin
    const isStaff = await checkPermission(ctx, userId, null, 'system.admin');
    if (!isStaff) throw new Error("Staff only");
    
    await ctx.db.patch(userId, { subscriptionTierId: tierId });
    return { success: true };
  },
});

/**
 * Get current user (for debug panel)
 */
export const getCurrentUser = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

🚀 Implementation Steps (For Claude Opus 4.5)
Phase 1: Database & Schema (Day 1)

✅ Update convex/schema.ts with corrected tier structure
✅ Remove organization subscription fields
✅ Seed subscriptionTiers with correct data
✅ Seed permissions with bit positions
✅ Add migration script to move existing data

Phase 2: Core Permission Logic (Day 2)

✅ Implement convex/permissions/bits.ts (bit definitions)
✅ Implement convex/permissions/compute.ts (core logic)
✅ Write unit tests for computePermissions function
✅ Implement convex/permissions/queries.ts
✅ Test with sample users and orgs

Phase 3: Frontend Integration (Day 3)

✅ Create stores/permissionStore.ts (Zustand)
✅ Create hooks/usePermissions.ts
✅ Create components/PermissionGuard.tsx
✅ Create components/ScopeProvider.tsx
✅ Add ScopeProvider to root layout

Phase 4: Staff Debug Panel (Day 4)

✅ Implement components/StaffDebugPanel.tsx
✅ Implement convex/debug.ts mutations
✅ Add permission breakdown visualization
✅ Add tier switcher with safety warnings
✅ Test with staff_admin account

Phase 5: Refactor Existing Code (Day 5-7)

✅ Find all existing permission checks
✅ Replace with usePermissions().can()
✅ Wrap protected UI with <PermissionGuard>
✅ Update API routes to use new checks
✅ Remove old permission code
✅ Test all features

Phase 6: Edge Cases & Race Conditions (Day 8-9)

✅ Handle org ownership transfer
✅ Handle tier downgrades gracefully
✅ Handle member removal cleanup
✅ Add permission cache invalidation
✅ Test concurrent permission changes

Phase 7: Testing & Documentation (Day 10)

✅ Write integration tests
✅ Test all permission combinations
✅ Document permission codes
✅ Create permission migration guide
✅ Deploy to staging


🔒 Security Checklist

 No way to grant system permissions to non-staff
 Org feature cap enforced at DB level
 Owner cannot be removed accidentally
 Role permissions validated against org features
 Personal tier limits enforced (maxPersonalProjects)
 Staff admin actions logged to audit trail
 Debug panel only visible to staff_admin
 Tier changes require confirmation
 Race conditions handled (optimistic locking)
 Permission cache invalidated on changes


📊 Testing Strategy
Unit Tests
typescript// Test: Free user cannot create org
assert(!(await can(freeUserId, null, 'org.create')));

// Test: Web owner gets all web org permissions
assert(await can(webUserId, webOrgId, 'o.project.edit'));

// Test: Free member in Web org has Web permissions
assert(await can(freeMemberId, webOrgId, 'o.project.use'));

// Test: CRM member in Web org capped by Web tier
assert(!(await can(crmMemberId, webOrgId, 'o.crm.advanced')));

// Test: Owner danger zone
assert(await can(ownerId, orgId, 'o.owner.delete_org'));
assert(!(await can(adminId, orgId, 'o.owner.delete_org')));
Integration Tests

Create org → Verify system roles created
Invite member → Verify default role assigned
Change role → Verify permissions update
Downgrade tier → Verify permissions removed
Transfer ownership → Verify new owner gets danger zone


📦 Deliverables

Complete Schema (convex/schema.ts)
Permission System (convex/permissions/)
Frontend Hooks (hooks/usePermissions.ts)
Components (components/PermissionGuard.tsx, ScopeProvider.tsx)
Debug Panel (components/StaffDebugPanel.tsx)
Migration Script (old → new)
Tests (unit + integration)
Documentation (permission codes, examples)


🎯 Success Criteria

✅ Free users can only do personal actions
✅ Org owners get all permissions within their tier
✅ Members capped by org owner's tier
✅ Roles work correctly (member < editor < admin)
✅ Staff admin can debug and change tiers
✅ No permission leaks or race conditions
✅ Clear, maintainable, testable code
✅ Type-safe throughout