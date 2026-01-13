-- 008_fix_profile_relationship.sql
-- Fixes the relationship between organization_members and profiles for PostgREST joining.

-- 1. Ensure the user_id in organization_members also references the public.profiles table.
-- This allows PostgREST to automatically detect the relationship.
ALTER TABLE public.organization_members
DROP CONSTRAINT IF EXISTS organization_members_user_id_fkey,
ADD CONSTRAINT organization_members_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Add an index to speed up the join if not exists
CREATE INDEX IF NOT EXISTS idx_org_members_user_profile ON public.organization_members(user_id);
