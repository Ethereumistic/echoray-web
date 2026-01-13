-- 001_core_tables.sql
-- Core tables for Discord-style Roles & Permissions system

-- 1. Subscription Tiers Table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- 'user', 'web', 'app', 'crm'
  slug TEXT UNIQUE NOT NULL, -- 'user', 'web', 'app', 'crm'
  price_eur INTEGER NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  description TEXT,
  base_permissions BIGINT DEFAULT 0, -- Bitwise base permissions
  features JSONB DEFAULT '[]'::jsonb, -- Marketing features list
  max_members INTEGER, -- NULL = unlimited
  max_organizations INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  
  -- Ownership
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Subscription
  subscription_tier_id UUID REFERENCES subscription_tiers(id) NOT NULL,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'cancelled', 'paused')),
  subscription_started_at TIMESTAMPTZ DEFAULT NOW(),
  subscription_ends_at TIMESTAMPTZ,
  
  -- Custom tier config (for CRM tier)
  custom_permissions BIGINT DEFAULT 0,
  custom_config JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

-- 3. Organization Members Table
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Invitation tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('invited', 'active', 'suspended', 'left')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  
  -- Permissions cache (for performance)
  computed_permissions BIGINT DEFAULT 0,
  permissions_last_computed_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id)
);

-- 4. System Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, 
  bit_position INTEGER UNIQUE NOT NULL CHECK (bit_position >= 0 AND bit_position < 64),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, 
  
  -- Tier requirements
  min_tier TEXT, 
  is_addon BOOLEAN DEFAULT FALSE, 
  addon_price_eur INTEGER,
  
  -- Metadata
  is_dangerous BOOLEAN DEFAULT FALSE, 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- Role definition
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, 
  
  -- Permissions (bitwise)
  permissions BIGINT DEFAULT 0,
  
  -- Hierarchy
  position INTEGER NOT NULL DEFAULT 0,
  
  -- System roles
  is_system_role BOOLEAN DEFAULT FALSE,
  system_role_type TEXT CHECK (system_role_type IN ('owner', 'admin', 'moderator', 'member')),
  
  -- Settings
  is_assignable BOOLEAN DEFAULT TRUE, 
  is_default BOOLEAN DEFAULT FALSE, 
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, name),
  CHECK (NOT is_system_role OR system_role_type IS NOT NULL)
);

-- 6. Member Roles Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS member_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES organization_members(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  
  -- Assignment tracking
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(member_id, role_id)
);

-- 7. Member Permission Overrides Table
CREATE TABLE IF NOT EXISTS member_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES organization_members(id) ON DELETE CASCADE NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  
  -- Override type
  allow BOOLEAN NOT NULL, 
  
  -- Tracking
  granted_by UUID REFERENCES auth.users(id),
  reason TEXT, 
  expires_at TIMESTAMPTZ, 
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(member_id, permission_id)
);

-- 8. Organization Addons Table
CREATE TABLE IF NOT EXISTS organization_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  
  -- Purchase tracking
  purchased_by UUID REFERENCES auth.users(id),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, 
  
  -- Billing
  price_paid_eur INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  
  UNIQUE(organization_id, permission_id)
);

-- 9. Audit Log Table
CREATE TABLE IF NOT EXISTS permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),
  
  -- Action
  action TEXT NOT NULL CHECK (action IN (
    'role_created', 'role_updated', 'role_deleted',
    'role_assigned', 'role_unassigned',
    'permission_granted', 'permission_revoked',
    'addon_purchased', 'addon_cancelled',
    'member_invited', 'member_joined', 'member_removed',
    'tier_upgraded', 'tier_downgraded',
    'override_added', 'override_removed'
  )),
  
  -- Targets
  target_user_id UUID REFERENCES auth.users(id),
  target_role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  target_permission_id UUID REFERENCES permissions(id) ON DELETE SET NULL,
  
  -- Details
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_tier ON organizations(subscription_tier_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_status ON organization_members(status);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_addon ON permissions(is_addon) WHERE is_addon = TRUE;
CREATE INDEX IF NOT EXISTS idx_roles_org ON roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_roles_position ON roles(organization_id, position);
CREATE INDEX IF NOT EXISTS idx_roles_system ON roles(organization_id, is_system_role);
CREATE INDEX IF NOT EXISTS idx_member_roles_member ON member_roles(member_id);
CREATE INDEX IF NOT EXISTS idx_member_roles_role ON member_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_permission_overrides_member ON member_permission_overrides(member_id);
CREATE INDEX IF NOT EXISTS idx_org_addons_org ON organization_addons(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_org ON permission_audit_log(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON permission_audit_log(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_target ON permission_audit_log(target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON permission_audit_log(action, created_at DESC);
