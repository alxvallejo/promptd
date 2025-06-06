import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          name: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      prompts: {
        Row: {
          id: string
          title: string
          content: string
          folder_id: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          folder_id?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          folder_id?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      picks: {
        Row: {
          id: string
          category: string
          content: string
          link_previews: any
          week_of: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: string
          content: string
          link_previews?: any
          week_of: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: string
          content?: string
          link_previews?: any
          week_of?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}