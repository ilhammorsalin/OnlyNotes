'use server'

import { createServerClient as createSSRClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './supabase'

// Create a Supabase client with the user's auth session
async function createServerClient() {
  const cookieStore = await cookies()
  
  return createSSRClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

// Get the current user
async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Get the current user's profile
async function getCurrentProfile() {
  const supabase = await createServerClient()
  const user = await getCurrentUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  // Type assertion to help TypeScript
  return profile as Database['public']['Tables']['profiles']['Row'] | null
}

// Add a new note
export async function addNoteAction(data: {
  course_id: string
  title: string
  hook_summary: string
  full_content: string
  media_url?: string
}) {
  const supabase = await createServerClient()
  const user = await getCurrentUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: note, error } = await supabase
    .from('notes')
    // @ts-ignore - Database type inference issue with createServerClient return type
    .insert({
      author_id: user.id,
      course_id: data.course_id,
      title: data.title,
      hook_summary: data.hook_summary,
      full_content: data.full_content,
      media_url: data.media_url
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data: note }
}

// Update an existing note
export async function updateNoteAction(
  id: string,
  data: {
    title?: string
    hook_summary?: string
    full_content?: string
    media_url?: string
  }
) {
  const supabase = await createServerClient()
  const user = await getCurrentUser()
  const profile = await getCurrentProfile()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if user is the author or an admin
  const { data: note } = await supabase
    .from('notes')
    .select('author_id')
    .eq('id', id)
    .single()

  if (!note) {
    return { error: 'Note not found' }
  }

  // Check authorization - must be author or admin
  const isAuthor = (note as any).author_id === user.id
  const isAdmin = profile?.is_admin || profile?.role === 'admin'
  
  if (!isAuthor && !isAdmin) {
    return { error: 'Not authorized to update this note' }
  }

  const { data: updatedNote, error } = await supabase
    .from('notes')
    // @ts-ignore - Database type inference issue with createServerClient return type
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data: updatedNote }
}

// Admin-specific delete action
export async function adminDeleteNote(id: string) {
  const supabase = await createServerClient()
  const profile = await getCurrentProfile()
  
  // CRITICAL: Must check if the user is an admin
  const isAdmin = profile?.is_admin || profile?.role === 'admin'
  if (!isAdmin) {
    return { error: 'Not authorized. Admin access required.' }
  }

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

// Swipe-to-save action
export async function saveNoteAction(noteId: string) {
  const supabase = await createServerClient()
  const user = await getCurrentUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // 1. Insert swipe record with action 'RIGHT'
    const { error: swipeError } = await supabase
      .from('swipes')
      // @ts-ignore - Database type inference issue with createServerClient return type
      .insert({
        user_id: user.id,
        note_id: noteId,
        action: 'RIGHT'
      })

    // Ignore duplicate swipe errors (user may have already swiped)
    // Using code 23505 for unique constraint violations
    if (swipeError && swipeError.code !== '23505') {
      return { error: swipeError.message }
    }

    // 2. Insert into unlocks table for permanent save
    const { error: unlockError } = await supabase
      .from('unlocks')
      // @ts-ignore - Database type inference issue with createServerClient return type
      .insert({
        user_id: user.id,
        note_id: noteId
      })

    // Handle uniqueness constraint - note already unlocked/saved
    // Using code 23505 for unique constraint violations
    if (unlockError) {
      if (unlockError.code === '23505') {
        return { success: true, alreadySaved: true }
      }
      return { error: unlockError.message }
    }

    return { success: true, alreadySaved: false }
  } catch {
    return { error: 'Failed to save note' }
  }
}
