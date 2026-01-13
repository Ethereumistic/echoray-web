-- 004_rls_policies.sql
-- Row Level Security (RLS) policies for all tables

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;

-- 1. Organizations RLS
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Owners can update organizations"
  ON organizations FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete organizations"
  ON organizations FOR DELETE
  USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- 2. Organization Members RLS
CREATE POLICY "Users can view org members"
  ON organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Note: Insert/Update/Delete for members is mostly handled via SECURITY DEFINER functions in 003
-- But we add basic policies for visibility/manual small updates if needed

-- 3. Roles RLS
CREATE POLICY "Users can view org roles"
  ON roles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- 4. Member Roles RLS
CREATE POLICY "Users can view role assignments"
  ON member_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.id = member_roles.member_id
        AND om.organization_id IN (
          SELECT organization_id FROM organization_members
          WHERE user_id = auth.uid() AND status = 'active'
        )
    )
  );

-- 5. Permissions (System-wide, readable by all authenticated)
CREATE POLICY "Authenticated users can view permissions"
  ON permissions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 6. Member Permission Overrides RLS
CREATE POLICY "Users can view their own overrides"
  ON member_permission_overrides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.id = member_permission_overrides.member_id
        AND om.user_id = auth.uid()
    )
  );

-- 7. Organization Addons RLS
CREATE POLICY "Users can view org addons"
  ON organization_addons FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- 8. Audit Log RLS
CREATE POLICY "Members can view audit log"
  ON permission_audit_log FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
