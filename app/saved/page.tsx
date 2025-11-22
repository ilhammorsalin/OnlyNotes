import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Database } from '@/lib/supabase'
import SavedNotesClient from './SavedNotesClient'

export default async function SavedNotesPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const cookieStore = await cookies()
  const authToken = cookieStore.get('sb-access-token')?.value
  const refreshToken = cookieStore.get('sb-refresh-token')?.value

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

  // Set the session if we have tokens
  if (authToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: authToken,
      refresh_token: refreshToken
    })
  }

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }

  // Fetch all notes where the note_id exists in the current user's unlocks table
  const { data: savedNotes } = await supabase
    .from('unlocks')
    .select(`
      note_id,
      triggered_at,
      notes (
        id,
        title,
        hook_summary,
        full_content,
        created_at,
        author_id,
        course_id,
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
    .eq('user_id', user.id)
    .order('triggered_at', { ascending: false })

  // Transform the data to flatten the notes structure
  const notes = (savedNotes || []).map((unlock) => ({
    ...unlock.notes,
    savedAt: unlock.triggered_at,
  })).filter((note) => note.id) // Filter out any null notes

  return (
    <SavedNotesClient
      savedNotes={notes}
    />
  )
}
