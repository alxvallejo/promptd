import React, { useEffect, useState } from 'react'
import { Plus, Folder, MessageSquare, Moon, Sun, User, LogOut, Palette } from 'lucide-react'
import { Sparkle, Archive } from 'phosphor-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { BookmarkButton } from './BookmarkButton'


interface SidebarProps {
  folders: Array<{ id: string; name: string }>
  activeFolder: string | null
  activePrompt: any | null
  onFolderSelect: (folderId: string | null) => void
  onNewFolder: () => void
  onNewPrompt: () => void
  showAppearance: boolean
  onToggleAppearance: () => void
  showPicks: boolean
  onTogglePicks: () => void
  showPastPics: boolean
  onTogglePastPics: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  activeFolder,
  activePrompt,
  onFolderSelect,
  onNewFolder,
  onNewPrompt,
  showAppearance,
  onToggleAppearance,
  showPicks,
  onTogglePicks,
  showPastPics,
  onTogglePastPics,
}) => {
  const { signOut, user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [userFirstName, setUserFirstName] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
          return
        }

        setUserFirstName(profile?.first_name || null)
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()
  }, [user?.id])

  const displayName = userFirstName || user?.email?.split('@')[0] || 'User'

  // Determine if we're in "new prompt" mode
  const isNewPromptMode = !showPicks && !showPastPics && !showAppearance && !activePrompt

  return (
    <div className="w-64 h-screen flex flex-col" style={{ 
      backgroundColor: 'var(--color-bg-secondary)', 
      borderRight: '1px solid var(--color-border)' 
    }}>
      {/* Header */}
      <div className="p-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-4">
          <img 
            src="/logo_transparent.png" 
            alt="Prompt-D Logo" 
            className="w-16 h-16 flex-shrink-0 object-contain"
          />
          <h1 className="text-3xl font-bold gradient-text">
            Prompt.d
          </h1>
        </div>
      </div>

      {/* New Prompt Button */}
      <div className="p-4">
        <button
          onClick={onNewPrompt}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            isNewPromptMode ? 'gradient-button' : ''
          }`}
          style={{
            backgroundColor: isNewPromptMode ? undefined : 'transparent',
            color: isNewPromptMode ? 'white' : 'var(--color-text-secondary)',
            border: isNewPromptMode ? 'none' : '1px solid var(--color-border)'
          }}
          onMouseEnter={(e) => {
            if (!isNewPromptMode) {
              e.currentTarget.style.backgroundColor = 'var(--color-accent)'
              e.currentTarget.style.color = 'white'
            }
          }}
          onMouseLeave={(e) => {
            if (!isNewPromptMode) {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
            }
          }}
        >
          <Plus size={18} />
          New Prompt
        </button>
      </div>

      {/* Main Navigation */}
      <div className="px-4 mb-4">
        <div
          className={`sidebar-item ${showPicks ? 'active' : ''}`}
          onClick={onTogglePicks}
        >
          <Sparkle size={18} weight="duotone" />
          Picks
        </div>
        <div
          className={`sidebar-item ${showPastPics ? 'active' : ''}`}
          onClick={onTogglePastPics}
        >
          <Archive size={18} weight="duotone" />
          Past Picks
        </div>
      </div>

      {/* Folders */}
      <div className="flex-1 px-4 overflow-y-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Folders
            </span>
            <button
              onClick={onNewFolder}
              className="transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div
            className={`sidebar-item ${activeFolder === null && !showPicks && !showAppearance && !showPastPics ? 'active' : ''}`}
            onClick={() => onFolderSelect(null)}
          >
            <MessageSquare size={18} />
            All Prompts
          </div>
          
          {folders.map((folder) => (
            <div
              key={folder.id}
              className={`sidebar-item ${activeFolder === folder.id ? 'active' : ''}`}
              onClick={() => onFolderSelect(folder.id)}
            >
              <Folder size={18} />
              {folder.name}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-6 pb-8" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="space-y-2">
          <BookmarkButton className="w-full" />
          
          <button
            onClick={toggleTheme}
            className="sidebar-item w-full"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <button
            onClick={onToggleAppearance}
            className={`sidebar-item w-full ${showAppearance ? 'active' : ''}`}
          >
            <Palette size={18} />
            Appearance
          </button>
          
          <div className="sidebar-item">
            <User size={18} />
            <span className="truncate">{displayName}</span>
          </div>
          
          <button
            onClick={signOut}
            className="sidebar-item w-full transition-colors"
            style={{ color: 'var(--color-warning)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-warning)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--color-warning)'
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}