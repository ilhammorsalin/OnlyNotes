-- OnlyNotes RBAC Implementation
-- Version: 4.0
-- Description: Add role column and update RLS policies for RBAC

-- =====================================================
-- ADD ROLE COLUMN TO PROFILES
-- =====================================================

-- Add role column with check constraint
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Migrate existing is_admin values to role column
UPDATE profiles 
SET role = 'admin' 
WHERE is_admin = true;

-- Create index for role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role) WHERE role = 'admin';

-- =====================================================
-- UPDATE HELPER FUNCTIONS TO USE ROLE
-- =====================================================

-- Update is_admin helper to check role column
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = uid) = 'admin';
END;
$$;

-- =====================================================
-- UPDATE RLS POLICIES FOR ADMIN RBAC
-- =====================================================

-- Profiles: Admins can view and update all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) = true
  );

DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) = true
  );

-- Notes: Admins can perform full CRUD operations
-- Admin can select any note
CREATE POLICY "Admins can view all notes"
  ON notes FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) = true
  );

-- Admin can insert notes (as any author - for testing/moderation)
CREATE POLICY "Admins can insert any note"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin(auth.uid()) = true
  );

-- Admin can update any note
CREATE POLICY "Admins can update any note"
  ON notes FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) = true
  );

-- Admin can delete any note (already exists but recreating for completeness)
DROP POLICY IF EXISTS "Admins can delete any note" ON notes;
CREATE POLICY "Admins can delete any note"
  ON notes FOR DELETE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) = true
  );

-- =====================================================
-- MAINTAIN EXISTING USER POLICIES
-- =====================================================
-- Users can still only edit notes where author_id = auth.uid()
-- This is maintained by the existing "Authors can update their own notes" policy
-- which uses USING (auth.uid() = author_id)
