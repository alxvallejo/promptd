import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { Auth } from './components/Auth'
import { Sidebar } from './components/Sidebar'
import { ChatInterface } from './components/ChatInterface'
import { Picks } from './components/Picks'
import { PastPics } from './components/PastPics'
import { AppearanceSettings } from './components/AppearanceSettings'
import { supabase } from './lib/supabase'
import { setupPicksTable, PICKS_TABLE_SQL } from './lib/setupDatabase'

interface Folder {
  id: string
  name: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

interface Prompt {
  id: string
  title: string
  content: string
  folderId: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

interface LinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
  loading: boolean
  rating?: number
  review?: string
}

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const [folders, setFolders] = useState<Folder[]>([])
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAppearance, setShowAppearance] = useState(false)
  const [showPicks, setShowPicks] = useState(false)
  const [showPastPics, setShowPastPics] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      initializeApp()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const initializeApp = async () => {
    try {
      setIsLoading(true)
      setDbError(null)
      
      // First, try to setup the picks table
      try {
        await setupPicksTable()
      } catch (error) {
        console.warn('Could not auto-create picks table:', error)
        setDbError('Database setup needed. Please run the SQL schema in your Supabase dashboard.')
      }
      
      await loadData()
    } catch (error) {
      console.error('Error initializing app:', error)
      setDbError('Failed to load application data. Please check your database connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadData = async () => {
    try {
      // Load folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true })

      if (foldersError) {
        console.error('Error loading folders:', foldersError)
      } else {
        const formattedFolders = foldersData?.map(folder => ({
          id: folder.id,
          name: folder.name,
          userId: folder.user_id,
          createdAt: new Date(folder.created_at),
          updatedAt: new Date(folder.updated_at),
        })) || []
        setFolders(formattedFolders)
      }

      // Load prompts
      const { data: promptsData, error: promptsError } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (promptsError) {
        console.error('Error loading prompts:', promptsError)
      } else {
        const formattedPrompts = promptsData?.map(prompt => ({
          id: prompt.id,
          title: prompt.title,
          content: prompt.content,
          folderId: prompt.folder_id,
          userId: prompt.user_id,
          createdAt: new Date(prompt.created_at),
          updatedAt: new Date(prompt.updated_at),
        })) || []
        setPrompts(formattedPrompts)
      }

      // Load picks (only if table exists)
      try {
        const { data: picksData, error: picksError } = await supabase
          .from('picks')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })

        if (picksError) {
          if (picksError.message.includes('relation "public.picks" does not exist')) {
            console.log('Picks table does not exist yet')
          } else {
            console.error('Error loading picks:', picksError)
          }
        } else {
          console.log('Picks loaded successfully:', picksData?.length || 0)
        }
      } catch (error) {
        console.log('Picks table not available:', error)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleNewFolder = async () => {
    const name = prompt('Enter folder name:')
    if (!name?.trim() || !user) return

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([{
          name: name.trim(),
          user_id: user.id,
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating folder:', error)
        return
      }

      const newFolder: Folder = {
        id: data.id,
        name: data.name,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }

      setFolders(prev => [...prev, newFolder])
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }

  const handleNewPrompt = () => {
    setActivePrompt(null)
    setActiveFolder(null)
    setShowAppearance(false)
    setShowPicks(false)
    setShowPastPics(false)
  }

  const handleToggleAppearance = () => {
    setShowAppearance(!showAppearance)
    setShowPicks(false)
    setShowPastPics(false)
    // Clear active prompt when showing appearance settings
    if (!showAppearance) {
      setActivePrompt(null)
      setActiveFolder(null)
    }
  }

  const handleTogglePicks = () => {
    setShowPicks(!showPicks)
    setShowAppearance(false)
    setShowPastPics(false)
    // Clear active prompt when showing picks
    if (!showPicks) {
      setActivePrompt(null)
      setActiveFolder(null)
    }
  }

  const handleTogglePastPics = () => {
    setShowPastPics(!showPastPics)
    setShowAppearance(false)
    setShowPicks(false)
    // Clear active prompt when showing past pics
    if (!showPastPics) {
      setActivePrompt(null)
      setActiveFolder(null)
    }
  }

  const handleSavePrompt = async (promptData: { title: string; content: string; folderId: string | null }) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('prompts')
        .insert([{
          title: promptData.title,
          content: promptData.content,
          folder_id: promptData.folderId,
          user_id: user.id,
        }])
        .select()
        .single()

      if (error) {
        console.error('Error saving prompt:', error)
        return
      }

      const newPrompt: Prompt = {
        id: data.id,
        title: data.title,
        content: data.content,
        folderId: data.folder_id,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      }

      setPrompts(prev => [newPrompt, ...prev])
      setActivePrompt(newPrompt)
    } catch (error) {
      console.error('Error saving prompt:', error)
    }
  }

  const handleSavePick = async (pickData: { category: string; content: string; linkPreviews: LinkPreview[]; weekOf: string }) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('picks')
        .insert([{
          category: pickData.category,
          content: pickData.content,
          link_previews: pickData.linkPreviews,
          week_of: pickData.weekOf,
          user_id: user.id,
        }])
        .select()
        .single()

      if (error) {
        console.error('Error saving pick:', error)
        if (error.message.includes('relation "public.picks" does not exist')) {
          setDbError('Picks table does not exist. Please run the SQL schema in your Supabase dashboard.')
        }
        throw error
      }

      console.log('Pick saved successfully:', data)
    } catch (error) {
      console.error('Error saving pick:', error)
      throw error
    }
  }

  const handleDeletePick = async (pickId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('picks')
        .delete()
        .eq('id', pickId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting pick:', error)
        return
      }

      console.log('Pick deleted successfully:', pickId)
    } catch (error) {
      console.error('Error deleting pick:', error)
    }
  }

  const handleUpdatePrompt = async (id: string, updates: Partial<Prompt>) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('prompts')
        .update({
          title: updates.title,
          content: updates.content,
          folder_id: updates.folderId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating prompt:', error)
        return
      }

      setPrompts(prev => prev.map(prompt => 
        prompt.id === id 
          ? { ...prompt, ...updates, updatedAt: new Date() }
          : prompt
      ))

      if (activePrompt?.id === id) {
        setActivePrompt(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null)
      }
    } catch (error) {
      console.error('Error updating prompt:', error)
    }
  }

  const handleDeletePrompt = async (id: string) => {
    if (!user || !confirm('Are you sure you want to delete this prompt?')) return

    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting prompt:', error)
        return
      }

      setPrompts(prev => prev.filter(prompt => prompt.id !== id))
      if (activePrompt?.id === id) {
        setActivePrompt(null)
      }
    } catch (error) {
      console.error('Error deleting prompt:', error)
    }
  }

  const handleFolderSelect = (folderId: string | null) => {
    setActiveFolder(folderId)
    setShowAppearance(false)
    setShowPicks(false)
    setShowPastPics(false)
    
    // Find the first prompt in the selected folder
    const folderPrompts = prompts.filter(prompt => 
      folderId === null ? true : prompt.folderId === folderId
    )
    
    if (folderPrompts.length > 0) {
      setActivePrompt(folderPrompts[0])
    } else {
      setActivePrompt(null)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  // Show database error if there's an issue
  if (dbError && showPicks) {
    return (
      <div className="flex h-screen" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <Sidebar
          folders={folders}
          activeFolder={activeFolder}
          onFolderSelect={handleFolderSelect}
          onNewFolder={handleNewFolder}
          onNewPrompt={handleNewPrompt}
          showAppearance={showAppearance}
          onToggleAppearance={handleToggleAppearance}
          showPicks={showPicks}
          onTogglePicks={handleTogglePicks}
          showPastPics={showPastPics}
          onTogglePastPics={handleTogglePastPics}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-2xl p-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              Database Setup Required
            </h2>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              The Picks feature requires a database table that doesn't exist yet. Please run the following SQL in your Supabase dashboard:
            </p>
            <div className="p-4 rounded-lg text-left overflow-x-auto" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
              <pre className="text-sm" style={{ color: 'var(--color-text)' }}>
                {PICKS_TABLE_SQL}
              </pre>
            </div>
            <button
              onClick={() => setDbError(null)}
              className="mt-4 btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderMainContent = () => {
    if (showAppearance) {
      return <AppearanceSettings />
    }
    
    if (showPicks) {
      return <Picks onSavePick={handleSavePick} onDeletePick={handleDeletePick} currentUser={user} />
    }
    
    if (showPastPics) {
      return <PastPics currentUser={user} onDeletePick={handleDeletePick} />
    }
    
    return (
      <ChatInterface
        activePrompt={activePrompt}
        onSavePrompt={handleSavePrompt}
        onUpdatePrompt={handleUpdatePrompt}
        onDeletePrompt={handleDeletePrompt}
        showAppearance={showAppearance}
      />
    )
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <Sidebar
        folders={folders}
        activeFolder={activeFolder}
        onFolderSelect={handleFolderSelect}
        onNewFolder={handleNewFolder}
        onNewPrompt={handleNewPrompt}
        showAppearance={showAppearance}
        onToggleAppearance={handleToggleAppearance}
        showPicks={showPicks}
        onTogglePicks={handleTogglePicks}
        showPastPics={showPastPics}
        onTogglePastPics={handleTogglePastPics}
      />
      {renderMainContent()}
    </div>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App