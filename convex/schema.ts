import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * Convex Schema for Echoray
 * Migrated from Supabase PostgreSQL schema
 * 
 * Key differences from SQL:
 * - Uses Convex's document-based storage instead of relational
 * - IDs are Convex's built-in `_id` field
 * - References use `v.id("tableName")` instead of foreign keys
 * - No need for explicit indexes on _id fields
 */

// Subscription status enum values
const subscriptionStatus = v.union(
    v.literal("active"),
    v.literal("trialing"),
    v.literal("past_due"),
    v.literal("cancelled"),
    v.literal("paused")
);

// Member status enum values
const memberStatus = v.union(
    v.literal("invited"),
    v.literal("active"),
    v.literal("suspended"),
    v.literal("left")
);

// System role types
const systemRoleType = v.union(
    v.literal("owner"),
    v.literal("admin"),
    v.literal("moderator"),
    v.literal("member")
);

// Audit log action types
const auditAction = v.union(
    v.literal("role_created"),
    v.literal("role_updated"),
    v.literal("role_deleted"),
    v.literal("role_assigned"),
    v.literal("role_unassigned"),
    v.literal("permission_granted"),
    v.literal("permission_revoked"),
    v.literal("addon_purchased"),
    v.literal("addon_cancelled"),
    v.literal("member_invited"),
    v.literal("member_joined"),
    v.literal("member_removed"),
    v.literal("tier_upgraded"),
    v.literal("tier_downgraded"),
    v.literal("override_added"),
    v.literal("override_removed")
);

export default defineSchema({
    // Include Convex Auth tables
    ...authTables,

    // Unified Users table
    users: defineTable({
        name: v.optional(v.string()), // Maps to fullName
        image: v.optional(v.string()), // Maps to avatarUrl
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        isAnonymous: v.optional(v.boolean()),

        // Extended profile fields
        username: v.optional(v.string()),

        // User Subscription (Tightly related to users)
        subscriptionTierId: v.optional(v.id("subscriptionTiers")),
        subscriptionStatus: v.optional(subscriptionStatus),
        subscriptionStartedAt: v.optional(v.number()),
        subscriptionEndsAt: v.optional(v.number()),
    })
        .index("by_email", ["email"])
        .index("by_username", ["username"])
        .index("by_subscriptionTierId", ["subscriptionTierId"]),

    // Subscription Tiers
    subscriptionTiers: defineTable({
        name: v.string(), // 'User', 'Web', 'App', 'CRM', 'Staff Admin'
        slug: v.string(),
        type: v.union(v.literal("commercial"), v.literal("system")),
        priceEur: v.number(),
        isCustom: v.boolean(),
        description: v.optional(v.string()),
        basePermissions: v.number(), // Bitwise: global + personal permissions
        orgFeatures: v.optional(v.number()), // Bitwise: which o.* features orgs owned by this tier get
        features: v.optional(v.array(v.string())), // Marketing features list
        maxMembers: v.optional(v.number()), // null = unlimited
        maxOrganizations: v.number(),
    })
        .index("by_slug", ["slug"])
        .index("by_name", ["name"]),

    // Organizations
    organizations: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        logoUrl: v.optional(v.string()),
        website: v.optional(v.string()),

        // Ownership (Orgs derive features from owner's subscription)
        ownerId: v.id("users"),

        // Organization subscription (optional - orgs can have their own subscription)
        subscriptionTierId: v.optional(v.id("subscriptionTiers")),
        subscriptionStatus: v.optional(subscriptionStatus),
        subscriptionStartedAt: v.optional(v.number()),
        subscriptionEndsAt: v.optional(v.number()),

        // Custom config (Overrides)
        customPermissions: v.number(),
        customConfig: v.optional(v.any()),

        // Metadata
        metadata: v.optional(v.any()),
    })
        .index("by_ownerId", ["ownerId"]),

    // Organization Members
    organizationMembers: defineTable({
        organizationId: v.id("organizations"),
        userId: v.id("users"),

        // Status
        status: memberStatus,

        // Invitation tracking
        invitedBy: v.optional(v.id("users")),
        invitedAt: v.number(), // Unix timestamp
        joinedAt: v.optional(v.number()),

        // Permissions cache
        computedPermissions: v.number(), // Bitwise permissions
        permissionsLastComputedAt: v.optional(v.number()),

        // Metadata
        metadata: v.optional(v.any()),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_userId", ["userId"])
        .index("by_org_user", ["organizationId", "userId"])
        .index("by_status", ["status"]),

    permissions: defineTable({
        code: v.string(), // e.g., 'profile.view', 'analytics.view'
        bitPosition: v.number(), // 0-63
        name: v.string(),
        description: v.optional(v.string()),
        category: v.string(), // 'basic', 'analytics', 'export', etc.

        // Tier requirements
        minTier: v.optional(v.string()),
        isAddon: v.boolean(),
        addonPriceEur: v.optional(v.number()),

        // Flags
        isDangerous: v.boolean(),
    })
        .index("by_code", ["code"])
        .index("by_bitPosition", ["bitPosition"])
        .index("by_category", ["category"])
        .index("by_isAddon", ["isAddon"]),

    // Projects - can be owned by a user (personal) or organization (shared)
    projects: defineTable({
        name: v.string(),
        description: v.optional(v.string()),

        // Ownership: EITHER personal OR organizational (never both)
        ownerId: v.optional(v.id("users")),         // Personal project
        organizationId: v.optional(v.id("organizations")), // Org project

        // Default view type
        defaultView: v.optional(v.union(
            v.literal("table"),
            v.literal("kanban"),
            v.literal("cards"),
            v.literal("gallery")
        )),

        // Project settings
        settings: v.optional(v.object({
            isPublic: v.optional(v.boolean()),
            allowedFeatures: v.optional(v.array(v.string())),
        })),

        // Setup status (has user completed the setup flow?)
        isSetupComplete: v.optional(v.boolean()),

        // Metadata
        metadata: v.optional(v.any()),
    })
        .index("by_ownerId", ["ownerId"])
        .index("by_organizationId", ["organizationId"]),

    // Field schema definitions (user customizable)
    projectFields: defineTable({
        projectId: v.id("projects"),
        fieldKey: v.string(),     // Internal key: "field1", "date1", "number1"
        fieldName: v.string(),    // Display name: "URL", "Start Date", "Price"
        fieldType: v.union(
            // Text types
            v.literal("text"),
            v.literal("textarea"),
            v.literal("richtext"),
            // URL & Links
            v.literal("url"),
            v.literal("email"),
            v.literal("phone"),
            // Numbers
            v.literal("number"),
            v.literal("currency"),
            v.literal("percentage"),
            v.literal("rating"),     // 1-5 stars
            // Date & Time
            v.literal("date"),
            v.literal("datetime"),
            v.literal("time"),
            v.literal("duration"),   // Time span
            // Selection
            v.literal("select"),     // Single dropdown
            v.literal("multiselect"),// Multiple selection
            v.literal("status"),     // Status with colors
            v.literal("tags"),       // Tag list
            // Boolean
            v.literal("checkbox"),
            v.literal("toggle"),
            // Location
            v.literal("location"),
            // Media
            v.literal("file"),
            v.literal("image"),
            // Relations
            v.literal("user"),       // User reference
            v.literal("relation"),   // Link to another record
            // Special
            v.literal("formula"),    // Calculated field
            v.literal("autonumber"), // Auto-incrementing
            v.literal("barcode"),
            v.literal("color")
        ),

        // Sub-type configuration (e.g., location can have url, geocoords, etc.)
        subTypes: v.optional(v.array(v.string())), // ["url", "geocoords", "map"]

        // Options for select/multiselect/status fields
        options: v.optional(v.array(v.object({
            value: v.string(),
            label: v.string(),
            color: v.optional(v.string()), // For status fields
        }))),

        // Legacy options array - for simple string options
        simpleOptions: v.optional(v.array(v.string())),

        // Validation
        isRequired: v.boolean(),
        minValue: v.optional(v.number()),
        maxValue: v.optional(v.number()),
        minLength: v.optional(v.number()),
        maxLength: v.optional(v.number()),
        pattern: v.optional(v.string()),  // Regex pattern

        // Display
        order: v.number(),
        width: v.optional(v.string()),    // "sm" | "md" | "lg" | "full"
        hidden: v.optional(v.boolean()),

        // Formatting
        currencySymbol: v.optional(v.string()),
        dateFormat: v.optional(v.string()),
        numberFormat: v.optional(v.string()),
        placeholder: v.optional(v.string()),
        defaultValue: v.optional(v.any()),

        // Formula (for calculated fields)
        formula: v.optional(v.string()),
    })
        .index("by_project", ["projectId"])
        .index("by_project_key", ["projectId", "fieldKey"])
        .index("by_project_order", ["projectId", "order"]),

    // Actual card/record data (flexible JSON storage)
    projectRecords: defineTable({
        projectId: v.id("projects"),
        data: v.any(),            // { field1: "www.m-texx.com", date1: "2025-06-05", ... }
        createdBy: v.id("users"),
    })
        .index("by_project", ["projectId"])
        .index("by_createdBy", ["createdBy"]),

    // View configurations (multiple views per project)
    projectViews: defineTable({
        projectId: v.id("projects"),
        name: v.string(),         // "Main View", "By Provider"
        viewType: v.union(
            v.literal("table"),
            v.literal("kanban"),
            v.literal("cards"),
            v.literal("gallery")
        ),
        isDefault: v.boolean(),   // Is this the default view?
        config: v.optional(v.any()), // View-specific settings
        // Kanban config example: { groupBy: "field2" }
        // Table config example: { columns: ["field1", "field2", "date1"], sortBy: "date1" }
    })
        .index("by_project", ["projectId"])
        .index("by_project_default", ["projectId", "isDefault"]),

    // Roles
    roles: defineTable({
        organizationId: v.id("organizations"),

        // Role definition
        name: v.string(),
        description: v.optional(v.string()),
        color: v.optional(v.string()), // Hex color

        // Permissions (bitwise)
        permissions: v.number(),

        // Hierarchy
        position: v.number(),

        // System roles
        isSystemRole: v.boolean(),
        systemRoleType: v.optional(systemRoleType),

        // Settings
        isAssignable: v.boolean(),
        isDefault: v.boolean(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_org_name", ["organizationId", "name"])
        .index("by_org_position", ["organizationId", "position"])
        .index("by_org_systemRole", ["organizationId", "isSystemRole"]),

    // Member Roles (Many-to-Many)
    memberRoles: defineTable({
        memberId: v.id("organizationMembers"),
        roleId: v.id("roles"),

        // Assignment tracking
        assignedBy: v.optional(v.id("users")),
        assignedAt: v.number(), // Unix timestamp
    })
        .index("by_memberId", ["memberId"])
        .index("by_roleId", ["roleId"])
        .index("by_member_role", ["memberId", "roleId"]),

    // Member Permission Overrides
    memberPermissionOverrides: defineTable({
        memberId: v.id("organizationMembers"),
        permissionId: v.id("permissions"),

        // Override type
        allow: v.boolean(), // true = grant, false = deny

        // Tracking
        grantedBy: v.optional(v.id("users")),
        reason: v.optional(v.string()),
        expiresAt: v.optional(v.number()), // Unix timestamp
    })
        .index("by_memberId", ["memberId"])
        .index("by_member_permission", ["memberId", "permissionId"]),

    // Organization Addons
    organizationAddons: defineTable({
        organizationId: v.id("organizations"),
        permissionId: v.id("permissions"),

        // Purchase tracking
        purchasedBy: v.optional(v.id("users")),
        purchasedAt: v.number(), // Unix timestamp
        expiresAt: v.optional(v.number()),

        // Billing
        pricePaidEur: v.optional(v.number()),
        isActive: v.boolean(),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_org_permission", ["organizationId", "permissionId"]),

    // Audit Log
    permissionAuditLog: defineTable({
        organizationId: v.optional(v.id("organizations")),
        actorId: v.optional(v.id("users")),

        // Action
        action: auditAction,

        // Targets
        targetUserId: v.optional(v.id("users")),
        targetRoleId: v.optional(v.id("roles")),
        targetPermissionId: v.optional(v.id("permissions")),

        // Details
        metadata: v.optional(v.any()),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
    })
        .index("by_organizationId", ["organizationId"])
        .index("by_actorId", ["actorId"])
        .index("by_targetUserId", ["targetUserId"])
        .index("by_action", ["action"]),
});
