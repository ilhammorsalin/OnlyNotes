# OnlyNotes Database Setup

This directory contains the Supabase database schema and seed data for the OnlyNotes application.

## Quick Start

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Save your project URL and anon key

### 2. Run the Migration

You have two options:

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `migrations/001_initial_schema.sql`
5. Paste and run the query

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push
```

### 3. Seed the Database

**Important:** Before running the seed script, you need to create auth users for the profiles.

#### Step 1: Create Auth Users

In the Supabase dashboard, go to **Authentication > Users** and manually create 5 users, or use the following SQL in the SQL Editor:

```sql
-- Note: This is a workaround for testing. In production, users sign up normally.
-- You'll need to get the actual UUIDs after creating auth users

-- Example for creating test users (Supabase Dashboard > Authentication > Users > Add User)
```

#### Step 2: Update Profile IDs

After creating auth users, update the profile IDs in `seed.sql` to match your auth.users IDs.

#### Step 3: Run Seed Script

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy contents of `seed.sql`
3. Update the profile IDs with your actual auth.users IDs
4. Run the script

### 4. Verify Setup

Run this query to check your data:

```sql
SELECT 
  n.title,
  p.username as author,
  c.code as course_code
FROM notes n
JOIN profiles p ON n.author_id = p.id
JOIN courses c ON n.course_id = c.id
LIMIT 10;
```

## Schema Overview

### Tables

- **universities**: University entities
- **programs**: Degree programs linked to universities
- **courses**: Course offerings
- **profiles**: User profiles (extends auth.users)
- **notes**: Student notes
- **swipes**: User swipe actions (LEFT/RIGHT)
- **unlocks**: Note unlock events (triggers score update)

### Security

Row Level Security (RLS) is enabled on all tables. See migration file for detailed policies.

## Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### "relation does not exist" error

Make sure you ran the migration script first.

### "violates foreign key constraint" error

Ensure auth users exist before inserting profiles.

### RLS policy errors

Check that you're authenticated when inserting data. For testing, you can temporarily disable RLS:

```sql
-- ONLY FOR TESTING - Re-enable before production!
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

## Next Steps

After setting up the database:

1. Install Supabase client: `npm install @supabase/supabase-js`
2. Configure Supabase client in your app
3. Update data layer to use Supabase instead of mock data
