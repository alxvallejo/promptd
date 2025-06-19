import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    console.log('Sign out initiated...')
    
    // Skip Supabase entirely and force manual logout
    console.log('Forcing manual logout to avoid 403 errors...')
    
    // Clear user state immediately
    setUser(null)
    console.log('User state cleared')
    
    // Clear all possible auth storage
    try {
      // Clear localStorage
      console.log('Clearing localStorage...')
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
          console.log('Removing localStorage key:', key)
          localStorage.removeItem(key)
        }
      })
      
      // Clear sessionStorage
      console.log('Clearing sessionStorage...')
      sessionStorage.clear()
      
      // Also try to clear the specific Supabase auth key patterns
      const possibleKeys = [
        'supabase.auth.token',
        'sb-auth-token',
        'supabase-auth-token'
      ]
      
      possibleKeys.forEach(key => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })
      
    } catch (storageError) {
      console.error('Error clearing storage:', storageError)
    }
    
    console.log('About to reload page...')
    // Force reload to ensure clean state
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  const value = {
    user,
    loading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}