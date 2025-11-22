# RBAC, Profile Badges, and Swipe to Save Implementation

This document describes the implementation of Role-Based Access Control (RBAC), User Profile Badges, and the Swipe to Save feature for the OnlyNotes application.

## Overview

The implementation includes:
1. Database schema updates for RBAC with role-based permissions
2. Server actions for note management and swipe functionality
3. Frontend UI updates for role badges, admin dashboard, and real-time updates

**Note**: This implementation properly merges with the main branch to resolve all conflicts. This is a proper two-parent merge commit.

---

## 1. Database Updates

### New Migration: `004_add_role_rbac.sql`

#### Role Column
- Added `role` column to `profiles` table
- Type: `TEXT` with default value `'user'`
- Constraint: Must be either `'user'` or `'admin'`
- Existing `is_admin` boolean values are migrated to the new role system

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

UPDATE profiles 
SET role = 'admin' 
WHERE is_admin = true;
```

#### Updated RLS Policies

**Admin Policies:**
- Admins can view all profiles and notes
- Admins can update any profile
- Admins can insert, update, and delete any note
- Uses updated `is_admin()` helper function that checks the role column

**User Policies:**
- Users can only edit notes where `author_id = auth.uid()` (maintained from original schema)
- Users cannot delete notes (only admins can)

---

## 2. Server Actions

### Location: `app/actions/notes.ts`

#### `saveNoteAction(noteId: string)`
Triggered when a user swipes right on a note.

**Workflow:**
1. Validates user authentication
2. Inserts into `swipes` table with action `'RIGHT'`
3. Inserts into `unlocks` table (triggers score update via database trigger)
4. Returns success/error message

**Error Handling:**
- Checks for duplicate swipes (unique constraint violation)
- Handles unlock errors appropriately
- Revalidates pages for fresh data

#### `recordSwipeLeft(noteId: string)`
Triggered when a user swipes left on a note.

**Workflow:**
1. Validates user authentication
2. Inserts into `swipes` table with action `'LEFT'`
3. Returns success status

#### `adminDeleteNote(noteId: string)`
Admin-only action to delete notes.

**Workflow:**
1. Validates user authentication
2. Checks if user has admin role (supports both `role = 'admin'` and legacy `is_admin = true`)
3. Deletes the note
4. Revalidates admin and home pages

**Security:**
- Uses proper Supabase server-side authentication via `@supabase/ssr`
- Validates admin status before allowing deletion
- Returns appropriate error messages for unauthorized access

---

## 3. Frontend UI/UX Updates

### Profile Page (SocialView)

**Role Badge Display:**
- **Admin**: Red badge with "ADMIN" text
- **User**: Blue badge with "USER" text
- Badge displays below username on profile tab

```tsx
{userRole === 'admin' ? (
  <Badge variant="destructive" className="text-xs font-bold uppercase">
    ADMIN
  </Badge>
) : (
  <Badge variant="secondary" className="text-xs font-bold uppercase bg-blue-500/20 text-blue-500">
    USER
  </Badge>
)}
```

### Admin Dashboard

**Tabs for Note Management:**
- **All Notes Tab**: Shows all notes in the system with author information
- **My Notes Tab**: Shows only notes created by the admin user
- Both tabs support delete functionality using the `adminDeleteNote` server action

**Features:**
- Author banning/unbanning
- Note deletion with confirmation
- Stats display (total users, total notes)
- Real-time data loading

### Home View (Swipe Interface)

**Swipe Actions:**
- **Swipe Right**: Calls `saveNoteAction()` and displays toast notification
- **Swipe Left**: Calls `recordSwipeLeft()`
- **Toast Notification**: "Note Unlocked! Saved to your library 🎉"

**Implementation:**
```tsx
const removeNote = async (id: string, direction: "left" | "right") => {
  setVisibleNotes((prev) => prev.filter((note) => note.id !== id));
  const note = visibleNotes.find((n) => n.id === id);
  
  if (note && user) {
    if (direction === "right") {
      const result = await saveNoteAction(id);
      if (result.success) {
        onSave(note);
        showToast("Note Unlocked! Saved to your library 🎉");
      }
    } else if (direction === "left") {
      await recordSwipeLeft(id);
    }
  }
};
```

### Library View (Saved Notes)

**Updated Data Source:**
- Fetches notes from `unlocks` table instead of `swipes` table
- Shows all notes the user has unlocked by swiping right

**Real-time Updates:**
- Subscribes to `unlocks` table changes
- Automatically updates saved notes when new unlocks are added
- Also refreshes leaderboard scores in real-time

```tsx
useEffect(() => {
  if (!user) return;

  const channel = supabase
    .channel('unlocks-changes')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'unlocks',
      filter: `user_id=eq.${user.id}`,
    }, async () => {
      const saved = await fetchSavedNotes(user.id);
      setSavedNotes(saved);
      
      const usersData = await fetchLeaderboard();
      setUsers(usersData);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);
```

---

## 4. TypeScript Updates

### Updated `lib/supabase.ts`

Added role and admin fields to the `profiles` table type definition:

```typescript
profiles: {
  Row: {
    id: string
    username: string
    avatar_url: string | null
    university_id: string | null
    program_id: string | null
    enrollment_year: number | null
    total_score: number
    role: 'user' | 'admin'
    is_admin: boolean
    is_banned: boolean
    created_at: string
    updated_at: string
  }
  // Insert and Update types follow similar pattern
}
```

---

## 5. Security Considerations

### Authentication
- Server actions use `@supabase/ssr` for proper server-side authentication
- Cookie-based auth tokens are automatically managed
- All actions verify user authentication before proceeding

### Authorization
- RLS policies enforce role-based access at the database level
- Server-side checks verify admin role before deletion
- Users can only edit their own notes (original policy maintained)

### Error Handling
- Duplicate swipe attempts are caught and handled gracefully
- Unlock errors are properly logged and returned to the user
- Admin operations require confirmation dialogs

---

## 6. Testing Checklist

- [ ] Test user swipe right → verify entry in swipes and unlocks tables
- [ ] Test user swipe left → verify entry in swipes table
- [ ] Test toast notification appears on swipe right
- [ ] Test saved notes appear in library view
- [ ] Test real-time updates when note is unlocked
- [ ] Test admin can see both "My Notes" and "All Notes" tabs
- [ ] Test admin can delete any note
- [ ] Test user cannot access admin dashboard
- [ ] Test role badge appears correctly for admin and user
- [ ] Test backward compatibility with existing is_admin field

---

## 7. Migration Path

To deploy these changes:

1. **Run Migration:**
   ```bash
   # Apply the new migration to add role column and update policies
   supabase db push supabase/migrations/004_add_role_rbac.sql
   ```

2. **Install Dependencies:**
   ```bash
   npm install @supabase/ssr
   ```

3. **Deploy Code:**
   - Deploy updated frontend components
   - Deploy server actions
   - Verify authentication works correctly

4. **Verification:**
   - Check that existing admin users have `role = 'admin'`
   - Test swipe functionality end-to-end
   - Verify real-time updates are working

---

## 8. Backward Compatibility

The implementation maintains backward compatibility:
- Both `role` and `is_admin` fields are checked in the code
- Existing admin users are automatically migrated to `role = 'admin'`
- All existing RLS policies continue to work
- No breaking changes to existing functionality

---

## 9. Future Enhancements

Potential improvements:
- Add more roles (e.g., moderator, premium user)
- Implement role-based UI customization
- Add analytics for swipe patterns
- Create admin audit logs for note deletions
- Add bulk operations for admin dashboard
