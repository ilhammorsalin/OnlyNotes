-- OnlyNotes Database Schema
-- Version: 1.0
-- Description: Initial schema for OnlyNotes app with academic hierarchy and engagement tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- A. ACADEMIC HIERARCHY (The Context)
-- =====================================================

CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    domain TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(university_id, name)
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(university_id, code)
);

-- =====================================================
-- B. USERS & CONTENT
-- =====================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    enrollment_year INTEGER,
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    hook_summary TEXT NOT NULL CHECK (char_length(hook_summary) <= 280),
    full_content TEXT NOT NULL,
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- C. THE "MOAT" (Engagement Logic)
-- =====================================================

CREATE TYPE swipe_action AS ENUM ('LEFT', 'RIGHT');

CREATE TABLE swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    action swipe_action NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, note_id)
);

CREATE TABLE unlocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, note_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_programs_university ON programs(university_id);
CREATE INDEX idx_courses_university ON courses(university_id);
CREATE INDEX idx_profiles_university ON profiles(university_id);
CREATE INDEX idx_profiles_program ON profiles(program_id);
CREATE INDEX idx_notes_author ON notes(author_id);
CREATE INDEX idx_notes_course ON notes(course_id);
CREATE INDEX idx_notes_created ON notes(created_at DESC);
CREATE INDEX idx_swipes_user ON swipes(user_id);
CREATE INDEX idx_swipes_note ON swipes(note_id);
CREATE INDEX idx_unlocks_user ON unlocks(user_id);
CREATE INDEX idx_unlocks_note ON unlocks(note_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocks ENABLE ROW LEVEL SECURITY;

-- Universities: Public read, authenticated insert
CREATE POLICY "Universities are viewable by everyone"
    ON universities FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert universities"
    ON universities FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Programs: Public read, authenticated insert
CREATE POLICY "Programs are viewable by everyone"
    ON programs FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert programs"
    ON programs FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Courses: Public read, authenticated insert
CREATE POLICY "Courses are viewable by everyone"
    ON courses FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert courses"
    ON courses FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Profiles: Public read, users can update their own
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Notes: Public read, authenticated insert, authors can update
CREATE POLICY "Notes are viewable by everyone"
    ON notes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert notes"
    ON notes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Authors can update their own notes"
    ON notes FOR UPDATE
    USING (auth.uid() = author_id);

-- Swipes: Users can see their own, authenticated insert
CREATE POLICY "Users can view their own swipes"
    ON swipes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert swipes"
    ON swipes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Unlocks: Users can see their own, authenticated insert
CREATE POLICY "Users can view their own unlocks"
    ON unlocks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert unlocks"
    ON unlocks FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update total_score when unlocks are added
CREATE OR REPLACE FUNCTION update_author_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET total_score = total_score + 1
    WHERE id = (SELECT author_id FROM notes WHERE id = NEW.note_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_score_on_unlock
    AFTER INSERT ON unlocks
    FOR EACH ROW
    EXECUTE FUNCTION update_author_score();
