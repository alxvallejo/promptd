import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { Auth } from './components/Auth'
import { Sidebar } from './components/Sidebar'
import { ChatInterface } from './components/ChatInterface'
import { supabase } from './lib/supabase'

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

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  const [folders, setFolders] = useState<Folder[]>([])
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
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
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-50">
        <div className="text-lg text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-50">
      <Sidebar
        folders={folders}
        activeFolder={activeFolder}
        onFolderSelect={handleFolderSelect}
        onNewFolder={handleNewFolder}
        onNewPrompt={handleNewPrompt}
      />
      <ChatInterface
        activePrompt={activePrompt}
        onSavePrompt={handleSavePrompt}
        onUpdatePrompt={handleUpdatePrompt}
        onDeletePrompt={handleDeletePrompt}
      />
    </div>
  )
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App