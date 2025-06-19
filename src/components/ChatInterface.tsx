import React, { useState, useRef, useEffect } from 'react'
import { Send, Copy, Edit3, Trash2 } from 'lucide-react'
import { AppearanceSettings } from './AppearanceSettings'
import { FrogIcon } from './FrogIcon'

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
  showAppearance: boolean
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  activePrompt,
  onSavePrompt,
  onUpdatePrompt,
  onDeletePrompt,
  showAppearance,
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

  // Auto-focus the input when component mounts
  useEffect(() => {
    if (inputRef.current && !activePrompt && !showAppearance) {
      inputRef.current.focus()
    }
  }, [activePrompt, showAppearance])

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
        <div className="px-6 py-4" style={{ 
          borderBottom: '1px solid var(--color-border)', 
          backgroundColor: 'var(--color-bg)' 
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyPress}
                  className="text-lg font-semibold bg-transparent border-b-2 focus:outline-none flex-1"
                  style={{
                    color: 'var(--color-text)',
                    borderColor: 'var(--color-accent)',
                  }}
                  autoFocus
                />
              ) : (
                <h2 
                  className="text-lg font-semibold cursor-pointer flex-1 transition-colors"
                  style={{ color: 'var(--color-text)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text)'}
                  onClick={() => setIsEditingTitle(true)}
                >
                  {activePrompt.title}
                </h2>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingTitle(true)}
                className="p-2 rounded-lg transition-all duration-200"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-text)'
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                title="Edit title"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => activePrompt && onDeletePrompt(activePrompt.id)}
                className="p-2 rounded-lg transition-all duration-200"
                style={{ color: 'var(--color-warning)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-warning)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--color-warning)'
                }}
                title="Delete prompt"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        {showAppearance ? (
          <AppearanceSettings />
        ) : messages.length === 0 && !activePrompt ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="flex items-center justify-center gap-3 mb-4">
                <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                  Welcome to Prompt.d
                </h3>
                <FrogIcon size={32} className="flex-shrink-0" />
              </div>
              <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Your personal prompt journal
              </p>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Prompts are really just snippets of thoughts you need to remember. If it's a prompt for AI great, if not, it's just a note taking app.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
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
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Hide when showing appearance settings */}
      {!showAppearance && (
        <div className="p-6" style={{ 
          backgroundColor: 'var(--color-bg)', 
          borderTop: '1px solid var(--color-border)',
          height: '20vh'
        }}>
          <div className="flex gap-4 h-full">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Paste your prompt here..."
              className="prompt-input flex-1"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="btn-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center self-end"
              style={{ minWidth: '56px', height: '56px' }}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}