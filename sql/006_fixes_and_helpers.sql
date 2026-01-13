-- 006_fixes_and_helpers.sql
-- Fixes for RLS recursion and implementation of missing helpers

-- 1. Helper function to check membership without recursion (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION is_member_of(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = p_org_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Fix Organization Members RLS (Remove recursive policy)
DROP POLICY IF EXISTS "Users can view org members" ON organization_members;

CREATE POLICY "Users can view their own membership"
  ON organization_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Members can view other members"
  ON organization_members FOR SELECT
  USING (is_member_of(organization_id));

-- 3. Update other policies to use the non-recursive helper for better performance/reliability
DROP POLICY IF EXISTS "Users can view org roles" ON roles;
CREATE POLICY "Users can view org roles"
  ON roles FOR SELECT
  USING (is_member_of(organization_id));

DROP POLICY IF EXISTS "Users can view org addons" ON organization_addons;
CREATE POLICY "Users can view org addons"
  ON organization_addons FOR SELECT
  USING (is_member_of(organization_id));

DROP POLICY IF EXISTS "Members can view audit log" ON permission_audit_log;
CREATE POLICY "Members can view audit log"
  ON permission_audit_log FOR SELECT
  USING (is_member_of(organization_id));

-- 4. Implement missing get_user_permissions RPC function
CREATE OR REPLACE FUNCTION get_user_permissions(
  p_user_id UUID,
  p_organization_id UUID
)
RETURNS TABLE (permission_code TEXT, has_permission BOOLEAN) AS $$
DECLARE
  v_permissions BIGINT;
BEGIN
  -- Get user's bitmask
  SELECT 
    CASE 
      WHEN permissions_last_computed_at IS NULL 
           OR permissions_last_computed_at < NOW() - INTERVAL '5 minutes'
      THEN compute_member_permissions(id)
      ELSE computed_permissions
    END
  INTO v_permissions
  FROM organization_members
  WHERE user_id = p_user_id 
    AND organization_id = p_organization_id; -- Allow checking even if not 'active' for own debug? 
    -- Actually keep it safe, but include status in check if needed.
    -- For now, match the initializer's expectation.

  IF v_permissions IS NULL THEN
    v_permissions := 0;
  END IF;

  -- Return table of all system permissions and whether user has them
  RETURN QUERY
  SELECT 
    p.code,
    has_permission_bit(v_permissions, p.bit_position)
  FROM permissions p;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
