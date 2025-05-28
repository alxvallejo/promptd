import React, { useState } from 'react'
import { Plus, Folder, MessageSquare, Settings, Moon, Sun, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

interface SidebarProps {
  folders: Array<{ id: string; name: string }>
  activeFolder: string | null
  onFolderSelect: (folderId: string | null) => void
  onNewFolder: () => void
  onNewPrompt: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  activeFolder,
  onFolderSelect,
  onNewFolder,
  onNewPrompt,
}) => {
  const { signOut, user } = useAuth()
  const { isDark, toggleTheme, fontFamily, setFontFamily } = useTheme()
  const [showSettings, setShowSettings] = useState(false)

  const fontOptions = [
    { value: 'font-inter', label: 'Inter' },
    { value: 'font-poppins', label: 'Poppins' },
    { value: 'font-space-grotesk', label: 'Space Grotesk' },
    { value: 'font-dm-sans', label: 'DM Sans' },
  ]

  return (
    <div className="w-64 h-screen bg-white dark:bg-slate-100 border-r border-gray-200 dark:border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-200">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
          Prompt.d
        </h1>
      </div>

      {/* New Prompt Button */}
      <div className="p-4">
        <button
          onClick={onNewPrompt}
          className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-100 dark:bg-indigo-100 text-indigo-700 dark:text-indigo-700 rounded-lg border border-indigo-200 dark:border-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-200 transition-all duration-200"
        >
          <Plus size={18} />
          New Prompt
        </button>
      </div>

      {/* Folders */}
      <div className="flex-1 px-4 overflow-y-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Folders
            </span>
            <button
              onClick={onNewFolder}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div
            className={`sidebar-item ${activeFolder === null ? 'active' : ''}`}
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

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-200 bg-gray-50 dark:bg-slate-50">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Font Family
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-100 border border-gray-200 dark:border-slate-200 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500"
              >
                {fontOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-200">
        <div className="space-y-2">
          <button
            onClick={toggleTheme}
            className="sidebar-item w-full"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="sidebar-item w-full"
          >
            <Settings size={18} />
            Settings
          </button>
          
          <div className="sidebar-item">
            <User size={18} />
            <span className="truncate">{user?.email}</span>
          </div>
          
          <button
            onClick={signOut}
            className="sidebar-item w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}