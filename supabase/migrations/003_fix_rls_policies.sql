-- OnlyNotes V4.1: Fix RLS recursion by using SECURITY DEFINER helpers
-- Description: Add helper functions to check admin/banned flags on profiles
-- and update policies to call the helpers (avoids recursive policy evaluation).

-- Helper to check if a given user id is admin.
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT is_admin FROM public.profiles WHERE id = uid) = true;
END;
$$;

-- Helper to check if a given user id is banned.
CREATE OR REPLACE FUNCTION public.is_banned(uid uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT is_banned FROM public.profiles WHERE id = uid) = true;
END;
$$;

-- === Recreate/replace policies to call helper functions ===

-- NOTE: replace policies on profiles to call helpers rather than sub-selecting
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

-- Notes delete by admins
DROP POLICY IF EXISTS "Admins can delete any note" ON notes;
CREATE POLICY "Admins can delete any note"
  ON notes FOR DELETE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) = true
  );

-- Notes insert checks should ensure user is not banned and is the author
DROP POLICY IF EXISTS "Authenticated users can insert notes" ON notes;
CREATE POLICY "Authenticated users can insert notes"
  ON notes FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = author_id
    AND public.is_banned(auth.uid()) = false
  );

-- Swipes insert checks
DROP POLICY IF EXISTS "Authenticated users can insert swipes" ON swipes;
CREATE POLICY "Authenticated users can insert swipes"
  ON swipes FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = user_id
    AND public.is_banned(auth.uid()) = false
  );

-- Unlocks insert checks
DROP POLICY IF EXISTS "Authenticated users can insert unlocks" ON unlocks;
CREATE POLICY "Authenticated users can insert unlocks"
  ON unlocks FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = user_id
    AND public.is_banned(auth.uid()) = false
  );
