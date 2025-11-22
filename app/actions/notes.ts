'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Create a server-side Supabase client with proper auth context
async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
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
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Save a note by swiping right
 * Performs two insertions:
 * 1. Insert into swipes table with action 'RIGHT'
 * 2. Insert into unlocks table
 */
export async function saveNoteAction(noteId: string) {
  try {
    const supabaseClient = await getSupabaseServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    // Insert into swipes table with action 'RIGHT'
    const { error: swipeError } = await supabaseClient
      .from('swipes')
      .insert({
        user_id: user.id,
        note_id: noteId,
        action: 'RIGHT'
      })

    if (swipeError) {
      // Check if it's a unique constraint violation (already swiped)
      if (swipeError.code === '23505') {
        return {
          success: false,
          error: 'You have already swiped on this note'
        }
      }
      console.error('Error inserting swipe:', swipeError)
      return {
        success: false,
        error: 'Failed to record swipe'
      }
    }

    // Insert into unlocks table
    const { error: unlockError } = await supabaseClient
      .from('unlocks')
      .insert({
        user_id: user.id,
        note_id: noteId
      })

    if (unlockError) {
      // If it's not a unique constraint violation, this is a real error
      if (unlockError.code !== '23505') {
        console.error('Error inserting unlock:', unlockError)
        return {
          success: false,
          error: 'Failed to unlock note'
        }
      }
      // If it's a unique constraint violation, the note was already unlocked
      // which is fine - we still consider this a success
    }

    revalidatePath('/')
    
    return {
      success: true,
      message: 'Note saved successfully!'
    }
  } catch (error) {
    console.error('Error in saveNoteAction:', error)
    return {
      success: false,
      error: 'An unexpected error occurred'
    }
  }
}

/**
 * Record a left swipe (skip)
 */
export async function recordSwipeLeft(noteId: string) {
  try {
    const supabaseClient = await getSupabaseServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    // Insert into swipes table with action 'LEFT'
    const { error: swipeError } = await supabaseClient
      .from('swipes')
      .insert({
        user_id: user.id,
        note_id: noteId,
        action: 'LEFT'
      })

    if (swipeError) {
      // Check if it's a unique constraint violation (already swiped)
      if (swipeError.code === '23505') {
        return {
          success: false,
          error: 'You have already swiped on this note'
        }
      }
      console.error('Error inserting swipe:', swipeError)
      return {
        success: false,
        error: 'Failed to record swipe'
      }
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Error in recordSwipeLeft:', error)
    return {
      success: false,
      error: 'An unexpected error occurred'
    }
  }
}

/**
 * Admin action to delete a note
 * Verifies admin role before deletion
 */
export async function adminDeleteNote(noteId: string) {
  try {
    const supabaseClient = await getSupabaseServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Not authenticated'
      }
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return {
        success: false,
        error: 'Failed to verify admin status'
      }
    }

    // Check if user has admin role (support both old is_admin and new role fields)
    if (profile.role !== 'admin' && !profile.is_admin) {
      return {
        success: false,
        error: 'Unauthorized: Admin access required'
      }
    }

    // Delete the note
    const { error: deleteError } = await supabaseClient
      .from('notes')
      .delete()
      .eq('id', noteId)

    if (deleteError) {
      console.error('Error deleting note:', deleteError)
      return {
        success: false,
        error: 'Failed to delete note'
      }
    }

    revalidatePath('/admin')
    revalidatePath('/')
    
    return {
      success: true,
      message: 'Note deleted successfully'
    }
  } catch (error) {
    console.error('Error in adminDeleteNote:', error)
    return {
      success: false,
      error: 'An unexpected error occurred'
    }
  }
}
