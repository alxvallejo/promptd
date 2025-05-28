import React, { useState, useRef, useEffect } from 'react'
import { Send, Copy, Edit3, Trash2 } from 'lucide-react'

interface Message {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: Date
}

interface Prompt {
  id: string
  title: string
  content: string
  folderId: string | null
  createdAt: Date
  updatedAt: Date
}

interface ChatInterfaceProps {
  activePrompt: Prompt | null
  onSavePrompt: (prompt: { title: string; content: string; folderId: string | null }) => void
  onUpdatePrompt: (id: string, updates: Partial<Prompt>) => void
  onDeletePrompt: (id: string) => void
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  activePrompt,
  onSavePrompt,
  onUpdatePrompt,
  onDeletePrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (activePrompt) {
      setMessages([
        {
          id: '1',
          content: activePrompt.content,
          type: 'user',
          timestamp: activePrompt.createdAt,
        }
      ])
      setEditedTitle(activePrompt.title)
    } else {
      setMessages([])
      setEditedTitle('')
    }
  }, [activePrompt])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      type: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, newMessage])
    
    if (!activePrompt) {
      // Create new prompt
      const title = inputValue.trim().slice(0, 50) + (inputValue.length > 50 ? '...' : '')
      onSavePrompt({
        title,
        content: inputValue.trim(),
        folderId: null,
      })
    }
    
    setInputValue('')
    
    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I understand your prompt. This is where the AI response would appear in a real implementation. For now, this is just a placeholder response to demonstrate the chat interface.",
        type: 'assistant',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleTitleSave = () => {
    if (activePrompt && editedTitle.trim()) {
      onUpdatePrompt(activePrompt.id, { title: editedTitle.trim() })
    }
    setIsEditingTitle(false)
  }

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave()
    } else if (e.key === 'Escape') {
      setEditedTitle(activePrompt?.title || '')
      setIsEditingTitle(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      {activePrompt && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-200 bg-white dark:bg-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyPress}
                  className="text-lg font-semibold bg-transparent border-b-2 border-indigo-300 dark:border-indigo-300 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 flex-1"
                  autoFocus
                />
              ) : (
                <h2 
                  className="text-lg font-semibold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-600 flex-1"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {activePrompt.title}
                </h2>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingTitle(true)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-100 transition-all duration-200"
                title="Edit title"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => activePrompt && onDeletePrompt(activePrompt.id)}
                className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-200"
                title="Delete prompt"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-slate-50">
        {messages.length === 0 && !activePrompt && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                Welcome to Prompt.d
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                Start a new conversation by typing a message below
              </p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col space-y-2">
            <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={message.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-current border-opacity-20">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="opacity-70 hover:opacity-100 transition-opacity"
                    title="Copy message"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-white dark:bg-slate-100 border-t border-gray-200 dark:border-slate-200">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your prompt here..."
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-50 border border-gray-200 dark:border-slate-200 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 focus:border-transparent resize-none min-h-[48px] max-h-32"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="px-4 py-3 bg-indigo-500 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}