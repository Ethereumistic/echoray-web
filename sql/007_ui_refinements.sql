-- 007_ui_refinements.sql
-- UI-focused refinements for roles and permissions

-- 1. Update Admin role color to yellow (#f1c40f) in the generator function
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
    '#e74c3c', -- Red
    9223372036854775807, -- All bits set
    0,
    TRUE,
    'owner',
    FALSE
  ) RETURNING id INTO owner_role_id;
  
  -- Admin role (Updated color to yellow)
  INSERT INTO roles (organization_id, name, description, color, permissions, position, is_system_role, system_role_type, is_assignable)
  VALUES (
    org_id,
    'Admin',
    'Administrator with most privileges',
    '#f1c40f', -- Yellow
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
    '#2ecc71', -- Green
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
    '#95a5a6', -- Gray
    7, 
    3,
    TRUE,
    'member',
    TRUE,
    TRUE
  ) RETURNING id INTO member_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update existing Admin roles to yellow
UPDATE roles 
SET color = '#f1c40f' 
WHERE system_role_type = 'admin' 
  AND is_system_role = TRUE;
