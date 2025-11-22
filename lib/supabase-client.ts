import { supabase } from './supabase';

// Extended Note type with populated relations
export interface NoteWithAuthor {
  id: string;
  title: string;
  hook_summary: string;
  full_content: string;
  media_url: string | null;
  created_at: string;
  course: {
    id: string;
    code: string;
    name: string;
  };
  author: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

// For compatibility with existing Note interface
export interface Note {
  id: string;
  title: string;
  topic: string;
  author: {
    name: string;
    avatar: string;
  };
  hook: string;
  content: string;
  upvotes: number;
  price: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  earnings: number;
  notesPosted: number;
  totalUpvotes: number;
  rank?: number;
}

// Fetch notes with author and course information
export async function fetchNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select(`
      id,
      title,
      hook_summary,
      full_content,
      media_url,
      created_at,
      courses (
        id,
        code,
        name
      ),
      profiles (
        id,
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    return [];
  }

  // Transform Supabase data to match existing Note interface
  return (data || []).map((note: any) => ({
    id: note.id,
    title: note.title,
    topic: note.courses?.name || 'General',
    author: {
      name: note.profiles?.username || 'Unknown',
      avatar: note.profiles?.avatar_url || 'https://i.pravatar.cc/150?u=default',
    },
    hook: note.hook_summary,
    content: note.full_content,
    upvotes: 0, // Will be calculated from unlocks count
    price: 0, // Not in current schema
  }));
}

// Fetch leaderboard users
export async function fetchLeaderboard(): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      avatar_url,
      total_score
    `)
    .order('total_score', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  // Count notes for each user
  const usersWithNotes = await Promise.all(
    (data || []).map(async (profile: any, index: number) => {
      const { count } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', profile.id);

      return {
        id: profile.id,
        name: profile.username,
        avatar: profile.avatar_url || 'https://i.pravatar.cc/150?u=' + profile.username,
        earnings: 0, // Not tracked in current schema
        notesPosted: count || 0,
        totalUpvotes: profile.total_score,
        rank: index + 1,
      };
    })
  );

  return usersWithNotes;
}

// Record a swipe action
export async function recordSwipe(
  userId: string,
  noteId: string,
  action: 'LEFT' | 'RIGHT'
): Promise<boolean> {
  const { error } = await supabase
    .from('swipes')
    .insert({
      user_id: userId,
      note_id: noteId,
      action,
    });

  if (error) {
    console.error('Error recording swipe:', error);
    return false;
  }

  return true;
}

// Record an unlock (upvote)
export async function recordUnlock(
  userId: string,
  noteId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('unlocks')
    .insert({
      user_id: userId,
      note_id: noteId,
    });

  if (error) {
    console.error('Error recording unlock:', error);
    return false;
  }

  return true;
}

// Get user's saved notes (unlocked notes)
export async function fetchSavedNotes(userId: string): Promise<Note[]> {
  const { data: unlocks, error } = await supabase
    .from('unlocks')
    .select(`
      note_id,
      notes (
        id,
        title,
        hook_summary,
        full_content,
        media_url,
        created_at,
        courses (
          id,
          code,
          name
        ),
        profiles (
          id,
          username,
          avatar_url
        )
      )
    `)
    .eq('user_id', userId)
    .order('triggered_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved notes:', error);
    return [];
  }

  // Transform to Note interface
  return (unlocks || [])
    .filter((unlock: any) => unlock.notes)
    .map((unlock: any) => {
      const note = unlock.notes;
      return {
        id: note.id,
        title: note.title,
        topic: note.courses?.name || 'General',
        author: {
          name: note.profiles?.username || 'Unknown',
          avatar: note.profiles?.avatar_url || 'https://i.pravatar.cc/150?u=default',
        },
        hook: note.hook_summary,
        content: note.full_content,
        upvotes: 0,
        price: 0,
      };
    });
}

// Get current user profile
export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}
