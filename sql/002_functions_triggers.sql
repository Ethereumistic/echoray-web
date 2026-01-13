-- 002_functions_triggers.sql
-- Bitwise functions, cache computation, and system role triggers

-- 1. Bitwise Helper Functions
CREATE OR REPLACE FUNCTION has_permission_bit(
  permissions BIGINT,
  bit_position INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (permissions & (1::BIGINT << bit_position)) != 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION set_permission_bit(
  permissions BIGINT,
  bit_position INTEGER
)
RETURNS BIGINT AS $$
BEGIN
  RETURN permissions | (1::BIGINT << bit_position);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION clear_permission_bit(
  permissions BIGINT,
  bit_position INTEGER
)
RETURNS BIGINT AS $$
BEGIN
  RETURN permissions & ~(1::BIGINT << bit_position);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION combine_permissions(
  perm1 BIGINT,
  perm2 BIGINT
)
RETURNS BIGINT AS $$
BEGIN
  RETURN perm1 | perm2;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. System Role Generation for New Organizations
CREATE OR REPLACE FUNCTION create_system_roles_for_org(org_id UUID)
RETURNS VOID AS $$
DECLARE
  owner_role_id UUID;
  admin_role_id UUID;
  mod_role_id UUID;
  member_role_id UUID;
BEGIN
  -- Owner role (highest privileges)
  INSERT INTO roles (organization_id, name, description, color, permissions, position, is_system_role, system_role_type, is_assignable)
  VALUES (
    org_id,
    'Owner',
    'Organization owner with full control',
    '#e74c3c',
    9223372036854775807, -- All bits set (2^63 - 1)
    0,
    TRUE,
    'owner',
    FALSE
  ) RETURNING id INTO owner_role_id;
  
  -- Admin role
  INSERT INTO roles (organization_id, name, description, color, permissions, position, is_system_role, system_role_type, is_assignable)
  VALUES (
    org_id,
    'Admin',
    'Administrator with most privileges',
    '#3498db',
    524287, 
    1,
    TRUE,
    'admin',
    TRUE
  ) RETURNING id INTO admin_role_id;
  
  -- Moderator role
  INSERT INTO roles (organization_id, name, description, color, permissions, position, is_system_role, system_role_type, is_assignable)
  VALUES (
    org_id,
    'Moderator',
    'Can manage members and content',
    '#2ecc71',
    8191, 
    2,
    TRUE,
    'moderator',
    TRUE
  ) RETURNING id INTO mod_role_id;
  
  -- Member role (default)
  INSERT INTO roles (organization_id, name, description, color, permissions, position, is_system_role, system_role_type, is_assignable, is_default)
  VALUES (
    org_id,
    'Member',
    'Default member role',
    '#95a5a6',
    7, 
    3,
    TRUE,
    'member',
    TRUE,
    TRUE
  ) RETURNING id INTO member_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create system roles when org is created
CREATE OR REPLACE FUNCTION trigger_create_system_roles()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_system_roles_for_org(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_system_roles();

-- 3. Permission Cache Computation
CREATE OR REPLACE FUNCTION compute_member_permissions(member_id UUID)
RETURNS BIGINT AS $$
DECLARE
  v_permissions BIGINT := 0;
  v_org_id UUID;
  v_tier_permissions BIGINT;
  v_custom_permissions BIGINT;
  v_addon_permissions BIGINT := 0;
  v_role_permissions BIGINT := 0;
  v_override RECORD;
BEGIN
  -- Get organization ID
  SELECT organization_id INTO v_org_id
  FROM organization_members WHERE id = member_id;
  
  IF v_org_id IS NULL THEN
    RETURN 0;
  END IF;
  
  -- 1. Get base tier permissions
  SELECT st.base_permissions, o.custom_permissions
  INTO v_tier_permissions, v_custom_permissions
  FROM organizations o
  JOIN subscription_tiers st ON o.subscription_tier_id = st.id
  WHERE o.id = v_org_id;
  
  v_permissions := COALESCE(v_tier_permissions, 0) | COALESCE(v_custom_permissions, 0);
  
  -- 2. Add organization addons
  SELECT COALESCE(BIT_OR(1::BIGINT << p.bit_position), 0) INTO v_addon_permissions
  FROM organization_addons oa
  JOIN permissions p ON oa.permission_id = p.id
  WHERE oa.organization_id = v_org_id
    AND oa.is_active = TRUE
    AND (oa.expires_at IS NULL OR oa.expires_at > NOW());
  
  v_permissions := v_permissions | v_addon_permissions;
  
  -- 3. Combine all role permissions (OR)
  SELECT COALESCE(BIT_OR(r.permissions), 0) INTO v_role_permissions
  FROM member_roles mr
  JOIN roles r ON mr.role_id = r.id
  WHERE mr.member_id = compute_member_permissions.member_id;
  
  v_permissions := v_permissions | v_role_permissions;
  
  -- 4. Apply member-specific overrides (DENY takes precedence)
  FOR v_override IN
    SELECT p.bit_position, mpo.allow
    FROM member_permission_overrides mpo
    JOIN permissions p ON mpo.permission_id = p.id
    WHERE mpo.member_id = compute_member_permissions.member_id
      AND (mpo.expires_at IS NULL OR mpo.expires_at > NOW())
    ORDER BY mpo.allow ASC -- FALSE (deny) comes first
  LOOP
    IF v_override.allow THEN
      -- Grant permission
      v_permissions := set_permission_bit(v_permissions, v_override.bit_position);
    ELSE
      -- Deny permission (remove bit)
      v_permissions := clear_permission_bit(v_permissions, v_override.bit_position);
    END IF;
  END LOOP;
  
  -- Update cache
  UPDATE organization_members
  SET 
    computed_permissions = v_permissions,
    permissions_last_computed_at = NOW()
  WHERE id = compute_member_permissions.member_id;
  
  RETURN v_permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Permission Check Functions
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_organization_id UUID,
  p_permission_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_member_id UUID;
  v_permissions BIGINT;
  v_bit_position INTEGER;
BEGIN
  -- Get permission bit position
  SELECT bit_position INTO v_bit_position
  FROM permissions WHERE code = p_permission_code;
  
  IF v_bit_position IS NULL THEN
    RETURN FALSE; -- Permission doesn't exist
  END IF;
  
  -- Get member ID
  SELECT id INTO v_member_id
  FROM organization_members
  WHERE user_id = p_user_id 
    AND organization_id = p_organization_id
    AND status = 'active';
  
  IF v_member_id IS NULL THEN
    RETURN FALSE; -- User not in organization
  END IF;
  
  -- Get cached permissions
  SELECT 
    CASE 
      WHEN permissions_last_computed_at IS NULL 
           OR permissions_last_computed_at < NOW() - INTERVAL '5 minutes'
      THEN compute_member_permissions(id)
      ELSE computed_permissions
    END
  INTO v_permissions
  FROM organization_members
  WHERE id = v_member_id;
  
  -- Check if bit is set
  RETURN has_permission_bit(v_permissions, v_bit_position);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Invalidation Triggers
CREATE OR REPLACE FUNCTION invalidate_member_permissions_on_role_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE organization_members om
  SET permissions_last_computed_at = NULL
  WHERE EXISTS (
    SELECT 1 FROM member_roles mr
    WHERE mr.member_id = om.id
      AND mr.role_id = COALESCE(NEW.id, OLD.id)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_role_permissions_changed
  AFTER UPDATE OF permissions ON roles
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_member_permissions_on_role_change();

CREATE OR REPLACE FUNCTION invalidate_member_permissions_on_member_role_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE organization_members
  SET permissions_last_computed_at = NULL
  WHERE id = COALESCE(NEW.member_id, OLD.member_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_member_role_changed
  AFTER INSERT OR DELETE ON member_roles
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_member_permissions_on_member_role_change();
