import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Database } from '@/lib/supabase'
import NotesDashboardClient from './NotesDashboardClient'

export default async function NotesDashboard() {
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

  // Fetch the user's profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/')
  }

  // Fetch initial list of notes
  // If user is admin, we'll show both My Notes and Global Notes options
  const { data: myNotes } = await supabase
    .from('notes')
    .select(`
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
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  // TypeScript helper: profile is non-null here after redirect check
  const isAdmin = profile.is_admin || false
  const { data: globalNotes } = isAdmin ? await supabase
    .from('notes')
    .select(`
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
    `)
    .order('created_at', { ascending: false })
    .limit(50) : { data: [] }

  return (
    <NotesDashboardClient
      user={user}
      profile={profile}
      initialMyNotes={myNotes || []}
      initialGlobalNotes={globalNotes || []}
      isAdmin={isAdmin}
    />
  )
}
