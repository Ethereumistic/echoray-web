-- 003_management_functions.sql
-- High-level functions for managing organizations and memberships

-- 1. Create Organization
CREATE OR REPLACE FUNCTION create_organization(
  p_name TEXT,
  p_slug TEXT,
  p_description TEXT DEFAULT NULL,
  p_tier_slug TEXT DEFAULT 'user'
)
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
  v_tier_id UUID;
  v_member_id UUID;
  v_owner_role_id UUID;
BEGIN
  -- Get tier ID
  SELECT id INTO v_tier_id FROM subscription_tiers WHERE slug = p_tier_slug;
  
  IF v_tier_id IS NULL THEN
    RAISE EXCEPTION 'Invalid subscription tier';
  END IF;
  
  -- Create organization
  INSERT INTO organizations (name, slug, description, owner_id, subscription_tier_id)
  VALUES (p_name, p_slug, p_description, auth.uid(), v_tier_id)
  RETURNING id INTO v_org_id;
  
  -- Add creator as member with owner role
  INSERT INTO organization_members (organization_id, user_id, status, joined_at)
  VALUES (v_org_id, auth.uid(), 'active', NOW())
  RETURNING id INTO v_member_id;
  
  -- Assign owner role (system owner role is created by trigger in 002)
  SELECT id INTO v_owner_role_id
  FROM roles
  WHERE organization_id = v_org_id AND system_role_type = 'owner';
  
  INSERT INTO member_roles (member_id, role_id, assigned_by)
  VALUES (v_member_id, v_owner_role_id, auth.uid());
  
  -- Log audit event
  INSERT INTO permission_audit_log (organization_id, actor_id, action, metadata)
  VALUES (v_org_id, auth.uid(), 'tier_upgraded', jsonb_build_object('tier', p_tier_slug));
  
  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Invite Member to Organization
CREATE OR REPLACE FUNCTION invite_member_to_organization(
  p_organization_id UUID,
  p_user_email TEXT,
  p_role_ids UUID[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_member_id UUID;
  v_role_id UUID;
  v_default_role_id UUID;
BEGIN
  -- Check permission
  IF NOT user_has_permission(auth.uid(), p_organization_id, 'members.invite') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Find user by email (using search in auth.users might require special setup or another table)
  -- For this internal function, we assume the user exists or handle search in the app layer
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_user_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with this email not found';
  END IF;
  
  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = p_organization_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'User is already a member or has a pending invitation';
  END IF;
  
  -- Create member invitation
  INSERT INTO organization_members (organization_id, user_id, status, invited_by, invited_at)
  VALUES (p_organization_id, v_user_id, 'invited', auth.uid(), NOW())
  RETURNING id INTO v_member_id;
  
  -- Assign roles (or default role if none specified)
  IF p_role_ids IS NOT NULL AND array_length(p_role_ids, 1) > 0 THEN
    FOREACH v_role_id IN ARRAY p_role_ids LOOP
      INSERT INTO member_roles (member_id, role_id, assigned_by)
      VALUES (v_member_id, v_role_id, auth.uid());
    END LOOP;
  ELSE
    -- Assign default role
    SELECT id INTO v_default_role_id
    FROM roles
    WHERE organization_id = p_organization_id AND is_default = TRUE
    LIMIT 1;
    
    IF v_default_role_id IS NOT NULL THEN
      INSERT INTO member_roles (member_id, role_id, assigned_by)
      VALUES (v_member_id, v_default_role_id, auth.uid());
    END IF;
  END IF;
  
  -- Log audit event
  INSERT INTO permission_audit_log (
    organization_id, actor_id, action, target_user_id, metadata
  ) VALUES (
    p_organization_id, auth.uid(), 'member_invited', v_user_id,
    jsonb_build_object('invited_by', auth.uid())
  );
  
  RETURN v_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Accept Organization Invitation
CREATE OR REPLACE FUNCTION accept_organization_invitation(
  p_organization_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update member status
  UPDATE organization_members
  SET status = 'active', joined_at = NOW()
  WHERE organization_id = p_organization_id
    AND user_id = auth.uid()
    AND status = 'invited';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No pending invitation found for this organization';
  END IF;
  
  -- Log audit event
  INSERT INTO permission_audit_log (
    organization_id, actor_id, action, target_user_id
  ) VALUES (
    p_organization_id, auth.uid(), 'member_joined', auth.uid()
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Remove Member from Organization
CREATE OR REPLACE FUNCTION remove_member_from_organization(
  p_organization_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  -- Check permission
  IF NOT user_has_permission(auth.uid(), p_organization_id, 'members.remove') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Cannot remove owner
  SELECT owner_id INTO v_owner_id FROM organizations WHERE id = p_organization_id;
  
  IF p_user_id = v_owner_id THEN
    RAISE EXCEPTION 'Cannot remove the organization owner';
  END IF;
  
  -- Delete member (cascades to member_roles and overrides)
  DELETE FROM organization_members
  WHERE organization_id = p_organization_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member not found in this organization';
  END IF;
  
  -- Log audit event
  INSERT INTO permission_audit_log (
    organization_id, actor_id, action, target_user_id
  ) VALUES (
    p_organization_id, auth.uid(), 'member_removed', p_user_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Role Management Functions
CREATE OR REPLACE FUNCTION create_custom_role(
  p_organization_id UUID,
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_color TEXT DEFAULT '#95a5a6',
  p_permission_codes TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS UUID AS $$
DECLARE
  v_role_id UUID;
  v_permissions BIGINT := 0;
  v_permission_code TEXT;
  v_bit_position INTEGER;
BEGIN
  -- Check permission
  IF NOT user_has_permission(auth.uid(), p_organization_id, 'roles.manage') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Calculate permissions bitfield
  FOREACH v_permission_code IN ARRAY p_permission_codes LOOP
    SELECT bit_position INTO v_bit_position
    FROM permissions WHERE code = v_permission_code;
    
    IF v_bit_position IS NOT NULL THEN
      v_permissions := set_permission_bit(v_permissions, v_bit_position);
    END IF;
  END LOOP;
  
  -- Create role
  INSERT INTO roles (
    organization_id, name, description, color, permissions, position, is_system_role
  )
  SELECT 
    p_organization_id, p_name, p_description, p_color, v_permissions,
    COALESCE(MAX(position), 0) + 1, FALSE
  FROM roles
  WHERE organization_id = p_organization_id
  RETURNING id INTO v_role_id;
  
  -- Log audit event
  INSERT INTO permission_audit_log (
    organization_id, actor_id, action, target_role_id, metadata
  ) VALUES (
    p_organization_id, auth.uid(), 'role_created', v_role_id,
    jsonb_build_object('name', p_name, 'permissions', p_permission_codes)
  );
  
  RETURN v_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Assign Roles to Member
CREATE OR REPLACE FUNCTION assign_roles_to_member(
  p_organization_id UUID,
  p_user_id UUID,
  p_role_ids UUID[]
)
RETURNS BOOLEAN AS $$
DECLARE
  v_member_id UUID;
  v_role_id UUID;
  v_owner_id UUID;
BEGIN
  -- Check permission
  IF NOT user_has_permission(auth.uid(), p_organization_id, 'roles.manage') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Get member ID
  SELECT id INTO v_member_id
  FROM organization_members
  WHERE organization_id = p_organization_id AND user_id = p_user_id;
  
  IF v_member_id IS NULL THEN
    RAISE EXCEPTION 'Member not found';
  END IF;
  
  -- Prevent modifying owner's roles if not owner
  SELECT owner_id INTO v_owner_id FROM organizations WHERE id = p_organization_id;
  IF p_user_id = v_owner_id AND auth.uid() != v_owner_id THEN
    RAISE EXCEPTION 'Only the owner can modify their own roles';
  END IF;
  
  -- Clear existing roles
  DELETE FROM member_roles WHERE member_id = v_member_id;
  
  -- Assign new roles
  FOREACH v_role_id IN ARRAY p_role_ids LOOP
    -- Verify role belongs to org
    IF EXISTS (SELECT 1 FROM roles WHERE id = v_role_id AND organization_id = p_organization_id) THEN
      INSERT INTO member_roles (member_id, role_id, assigned_by)
      VALUES (v_member_id, v_role_id, auth.uid());
    END IF;
  END LOOP;
  
  -- Log audit event
  INSERT INTO permission_audit_log (
    organization_id, actor_id, action, target_user_id, metadata
  ) VALUES (
    p_organization_id, auth.uid(), 'member_roles_updated', p_user_id,
    jsonb_build_object('role_ids', p_role_ids)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
