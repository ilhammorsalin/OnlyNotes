-- OnlyNotes V4: Auth & Admin Schema Updates
-- Version: 2.0
-- Description: Add admin/banned columns and auth trigger for profile creation

-- =====================================================
-- ADD ADMIN & BANNED COLUMNS TO PROFILES
-- =====================================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned) WHERE is_banned = true;

-- =====================================================
-- AUTO-CREATE PROFILE ON AUTH SIGNUP (TRIGGER)
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://i.pravatar.cc/150?u=' || NEW.id),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- UPDATE RLS POLICIES FOR ADMIN ACCESS
-- =====================================================

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- Allow admins to update any profile (for banning)
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- Allow admins to delete any note
CREATE POLICY "Admins can delete any note"
  ON notes FOR DELETE
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
  );

-- =====================================================
-- PREVENT BANNED USERS FROM POSTING
-- =====================================================

-- Update insert policy on notes to check banned status
DROP POLICY IF EXISTS "Authenticated users can insert notes" ON notes;
CREATE POLICY "Authenticated users can insert notes"
  ON notes FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid() = author_id
    AND (SELECT is_banned FROM profiles WHERE id = auth.uid()) = false
  );

-- Update insert policy on swipes to check banned status
DROP POLICY IF EXISTS "Authenticated users can insert swipes" ON swipes;
CREATE POLICY "Authenticated users can insert swipes"
  ON swipes FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid() = user_id
    AND (SELECT is_banned FROM profiles WHERE id = auth.uid()) = false
  );

-- Update insert policy on unlocks to check banned status
DROP POLICY IF EXISTS "Authenticated users can insert unlocks" ON unlocks;
CREATE POLICY "Authenticated users can insert unlocks"
  ON unlocks FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid() = user_id
    AND (SELECT is_banned FROM profiles WHERE id = auth.uid()) = false
  );
