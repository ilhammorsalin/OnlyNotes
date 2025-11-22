import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions for database tables
export type Database = {
  public: {
    Tables: {
      universities: {
        Row: {
          id: string
          name: string
          domain: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          domain?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string | null
          created_at?: string
        }
      }
      programs: {
        Row: {
          id: string
          university_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          university_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          university_id?: string
          name?: string
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          university_id: string
          code: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          university_id: string
          code: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          university_id?: string
          code?: string
          name?: string
          created_at?: string
        }
      }
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
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          university_id?: string | null
          program_id?: string | null
          enrollment_year?: number | null
          total_score?: number
          role?: 'user' | 'admin'
          is_admin?: boolean
          is_banned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          university_id?: string | null
          program_id?: string | null
          enrollment_year?: number | null
          total_score?: number
          role?: 'user' | 'admin'
          is_admin?: boolean
          is_banned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          author_id: string
          course_id: string
          title: string
          hook_summary: string
          full_content: string
          media_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          course_id: string
          title: string
          hook_summary: string
          full_content: string
          media_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          course_id?: string
          title?: string
          hook_summary?: string
          full_content?: string
          media_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      swipes: {
        Row: {
          id: string
          user_id: string
          note_id: string
          action: 'LEFT' | 'RIGHT'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          note_id: string
          action: 'LEFT' | 'RIGHT'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          note_id?: string
          action?: 'LEFT' | 'RIGHT'
          created_at?: string
        }
      }
      unlocks: {
        Row: {
          id: string
          user_id: string
          note_id: string
          triggered_at: string
        }
        Insert: {
          id?: string
          user_id: string
          note_id: string
          triggered_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          note_id?: string
          triggered_at?: string
        }
      }
    }
  }
}
