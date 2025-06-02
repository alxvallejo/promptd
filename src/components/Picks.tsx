import React, { useState, useRef, useEffect } from 'react'
import { Send, Film, Tv, Gamepad2, Calendar, MoreHorizontal, X, ExternalLink, Upload, Image as ImageIcon } from 'lucide-react'
import { WeeklyPicks } from './WeeklyPicks'
import { extractIMDBId, searchIMDBById, createIMDBLinkPreview } from '../lib/imdbSearch'
import { fetchGeneralLinkPreview } from '../lib/linkPreview'
import { uploadImage, createImagePreview, validateDroppedFiles, type ImagePreview } from '../lib/imageUpload'
import type { User } from '@supabase/supabase-js'

interface LinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
  loading: boolean
  imdbData?: any
  isImage?: boolean
  originalFile?: File
}

interface Pick {
  id: string
  category: string
  content: string
  linkPreviews: LinkPreview[]
  weekOf: string
  createdAt: Date
}

interface PicksProps {
  onSavePick: (pick: { category: string; content: string; linkPreviews: LinkPreview[]; weekOf: string }) => void
  onDeletePick?: (pickId: string) => void
  currentUser?: User | null
}

const categories = [
  { id: 'movies', label: 'Movies', icon: Film, placeholder: 'What movie are you picking this week? Share a link or describe your choice...' },
  { id: 'tv', label: 'TV', icon: Tv, placeholder: 'What TV show are you watching this week? Share a link or tell us about it...' },
  { id: 'games', label: 'Video Games', icon: Gamepad2, placeholder: 'What game are you playing this week? Drop a link or describe your gaming pick...' },
  { id: 'activities', label: 'Activities', icon: Calendar, placeholder: 'What activity or experience are you picking this week? Drag & drop images or share details...' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, placeholder: 'What else are you picking this week? Share your choice...' },
]

export const Picks: React.FC<PicksProps> = ({ onSavePick, onDeletePick, currentUser }) => {
  const [selectedCategory, setSelectedCategory] = useState('movies')
  const [inputValue, setInputValue] = useState('')
  const [linkPreviews, setLinkPreviews] = useState<LinkPreview[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get current week string
  const getCurrentWeek = () => {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    
    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}, ${new Date().getFullYear()}`
  }

  const currentWeek = getCurrentWeek()

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
    // Clear upload errors when switching categories
    setUploadErrors([])
  }, [selectedCategory])

  // Extract URLs from text
  const extractUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.match(urlRegex) || []
  }

  // Handle file uploads
  const handleFileUpload = async (files: File[]) => {
    if (!currentUser) return

    const { valid, errors } = validateDroppedFiles(files)
    setUploadErrors(errors)

    if (valid.length === 0) return

    // Add loading previews
    const loadingPreviews = valid.map(file => ({
      url: `loading-${file.name}`,
      title: file.name,
      description: 'Uploading...',
      image: URL.createObjectURL(file),
      loading: true,
      isImage: true,
      originalFile: file
    }))

    setLinkPreviews(prev => [...prev, ...loadingPreviews])

    // Upload files
    for (const file of valid) {
      try {
        const result = await uploadImage(file, currentUser.id)
        
        if (result.error) {
          setUploadErrors(prev => [...prev, result.error!])
          // Remove loading preview
          setLinkPreviews(prev => 
            prev.filter(p => p.url !== `loading-${file.name}`)
          )
        } else {
          // Replace loading preview with actual preview
          const imagePreview = await createImagePreview(file, result.url) as LinkPreview
          setLinkPreviews(prev => 
            prev.map(p => p.url === `loading-${file.name}` ? imagePreview : p)
          )
        }
      } catch (error) {
        console.error('Upload error:', error)
        setUploadErrors(prev => [...prev, `Failed to upload ${file.name}`])
        // Remove loading preview
        setLinkPreviews(prev => 
          prev.filter(p => p.url !== `loading-${file.name}`)
        )
      }
    }
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    if (selectedCategory === 'activities') {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    // Only set drag over to false if we're leaving the drop area completely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    if (selectedCategory !== 'activities') return

    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }

  // File input handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFileUpload(files)
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Fetch real link preview
  const fetchLinkPreview = async (url: string): Promise<LinkPreview> => {
    try {
      // Check if it's an IMDB URL first
      const imdbId = extractIMDBId(url)
      if (imdbId) {
        console.log('Detected IMDB URL, fetching via OMDB API:', imdbId)
        const imdbData = await searchIMDBById(imdbId)
        if (imdbData) {
          const imdbPreview = createIMDBLinkPreview(imdbData)
          return {
            url,
            title: imdbPreview.title,
            description: imdbPreview.description,
            image: imdbPreview.image,
            loading: false,
            imdbData
          }
        }
      }
      
      // For non-IMDB URLs, use general link preview
      console.log('Fetching general link preview for:', url)
      const linkData = await fetchGeneralLinkPreview(url)
      
      return {
        url,
        title: linkData.title,
        description: linkData.description,
        image: linkData.image,
        loading: false
      }
    } catch (error) {
      console.error('Error fetching link preview:', error)
      return {
        url,
        title: 'Link Preview',
        description: 'Unable to load preview',
        image: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Link+Preview',
        loading: false
      }
    }
  }

  // Handle input change and detect URLs
  const handleInputChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Extract URLs from text
    const urls = extractUrls(newValue)
    const newUrls = urls.filter(url => !linkPreviews.some(preview => preview.url === url))

    // Handle URL previews
    if (newUrls.length > 0) {
      // Add loading previews for URLs
      const loadingPreviews = newUrls.map(url => ({ url, loading: true }))
      setLinkPreviews(prev => [...prev, ...loadingPreviews])

      // Fetch actual previews for URLs
      for (const url of newUrls) {
        try {
          const preview = await fetchLinkPreview(url)
          setLinkPreviews(prev => 
            prev.map(p => p.url === url ? preview : p)
          )
          
          // If this is an IMDB URL and we got a successful preview, replace the URL with the title
          if (extractIMDBId(url) && preview.title && preview.imdbData) {
            const movieTitle = preview.imdbData.Title
            if (movieTitle) {
              setInputValue(prevInput => {
                const updatedInput = prevInput.replace(url, movieTitle)
                return updatedInput
              })
            }
          }
        } catch (error) {
          console.error('Error fetching preview for', url, error)
          setLinkPreviews(prev => 
            prev.map(p => p.url === url ? { ...p, loading: false } : p)
          )
        }
      }
    }

    // Remove previews for URLs that are no longer in the text
    const currentUrls = urls
    
    setLinkPreviews(prev => prev.filter(preview => {
      // Keep image previews
      if (preview.isImage) {
        return true
      }
      
      // Keep URL previews that are still in the text (or their replaced titles for IMDB)
      if (preview.url.startsWith('http')) {
        // For IMDB URLs that have been replaced with titles, keep the preview if the title is in the text
        if (extractIMDBId(preview.url) && preview.imdbData?.Title) {
          const currentText = inputValue
          return currentUrls.includes(preview.url) || currentText.includes(preview.imdbData.Title)
        }
        return currentUrls.includes(preview.url)
      }
      return false
    }))
  }

  const handleSubmit = async () => {
    if (!inputValue.trim() && linkPreviews.length === 0) return

    try {
      await onSavePick({
        category: selectedCategory,
        content: inputValue.trim(),
        linkPreviews: linkPreviews.filter(p => !p.loading),
        weekOf: currentWeek,
      })

      setInputValue('')
      setLinkPreviews([])
      setUploadErrors([])
      // Trigger refresh of weekly picks
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Error saving pick:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const removeLinkPreview = (url: string) => {
    setLinkPreviews(prev => prev.filter(p => p.url !== url))
    // Also remove the URL from the input text if it's not an image
    const preview = linkPreviews.find(p => p.url === url)
    if (preview && !preview.isImage) {
      setInputValue(prev => prev.replace(url, '').trim())
    }
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)
  const isActivitiesCategory = selectedCategory === 'activities'

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 py-4" style={{ 
        borderBottom: '1px solid var(--color-border)', 
        backgroundColor: 'var(--color-bg)' 
      }}>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
          Picks for week of {currentWeek}
        </h2>
      </div>

      {/* Category Selection */}
      <div className="px-6 py-4" style={{ 
        borderBottom: '1px solid var(--color-border)', 
        backgroundColor: 'var(--color-bg-secondary)' 
      }}>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.id
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isSelected ? 'active' : ''
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-bg)',
                  color: isSelected ? 'white' : 'var(--color-text-secondary)',
                  border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                    e.currentTarget.style.color = 'var(--color-text)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg)'
                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                  }
                }}
              >
                <Icon size={18} />
                {category.label}
                {category.id === 'activities' && (
                  <span 
                    className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--color-accent)',
                      color: isSelected ? 'white' : 'white',
                      fontSize: '10px'
                    }}
                    title="Drag & drop images supported"
                  >
                    📷
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Area - Split between input/previews and weekly picks */}
      <div 
        className="flex-1 overflow-y-auto" 
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-full">
          {/* Left Column - Input and Link Previews */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              Share Your Pick
            </h3>
            
            {/* Upload Errors */}
            {uploadErrors.length > 0 && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-error-bg)', borderLeft: '4px solid var(--color-error)' }}>
                <div className="flex items-start">
                  <X size={16} style={{ color: 'var(--color-error)', marginTop: '2px', marginRight: '8px' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>Upload Errors:</p>
                    <ul className="text-sm mt-1" style={{ color: 'var(--color-error)' }}>
                      {uploadErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Drag and Drop Area for Activities */}
            {isActivitiesCategory && (
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
                  isDragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                style={{
                  borderColor: isDragOver ? 'var(--color-accent)' : 'var(--color-border)',
                  backgroundColor: isDragOver ? 'var(--color-accent-bg)' : 'var(--color-bg-tertiary)'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--color-bg)' }}>
                    <ImageIcon size={24} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {isDragOver ? 'Drop images here' : 'Drag & drop images'}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      or click to browse (max 2MB each)
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Link Previews */}
            {linkPreviews.length > 0 && (
              <div className="space-y-3">
                {linkPreviews.map((preview) => (
                  <div
                    key={preview.url}
                    className="card p-4 flex gap-4 relative"
                  >
                    <button
                      onClick={() => removeLinkPreview(preview.url)}
                      className="absolute top-2 right-2 p-1 rounded-full transition-colors"
                      style={{ 
                        color: 'var(--color-text-muted)',
                        backgroundColor: 'var(--color-bg-tertiary)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--color-warning)'
                        e.currentTarget.style.backgroundColor = 'var(--color-bg)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--color-text-muted)'
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                      }}
                    >
                      <X size={14} />
                    </button>

                    {preview.loading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-bg-tertiary)' }} />
                        <div className="flex-1">
                          <div className="h-4 rounded animate-pulse mb-2" style={{ backgroundColor: 'var(--color-bg-tertiary)' }} />
                          <div className="h-3 rounded animate-pulse w-2/3" style={{ backgroundColor: 'var(--color-bg-tertiary)' }} />
                        </div>
                      </div>
                    ) : (
                      <>
                        {preview.image && (
                          <img
                            src={preview.image}
                            alt={preview.title}
                            className={`object-cover rounded-lg ${preview.isImage ? 'w-20 h-20' : 'w-16 h-16'}`}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate" style={{ color: 'var(--color-text)' }}>
                            {preview.title || 'Preview'}
                          </h4>
                          {preview.description && (
                            <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                              {preview.description}
                            </p>
                          )}
                          {!preview.isImage && (
                            <a
                              href={preview.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs mt-2 transition-colors"
                              style={{ color: 'var(--color-accent)' }}
                              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                              <ExternalLink size={12} />
                              Visit Link
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Welcome message when no content */}
            {linkPreviews.length === 0 && !inputValue && (
              <div className="flex items-center justify-center h-48">
                <div className="text-center max-w-md">
                  <div className="mb-4">
                    {selectedCategoryData && <selectedCategoryData.icon size={48} style={{ color: 'var(--color-accent)', margin: '0 auto' }} />}
                  </div>
                  <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                    {selectedCategoryData?.label} Pick
                  </h4>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Share your weekly {selectedCategoryData?.label.toLowerCase()} pick below
                  </p>
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      💡 <strong>Tip:</strong> {isActivitiesCategory ? 'Drag & drop images or paste URLs for previews!' : 'Paste any URL for automatic link previews!'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {isActivitiesCategory ? 'Perfect for sharing photos of your activities and experiences' : 'IMDB, YouTube, and other links get rich previews automatically'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Weekly Picks */}
          <div>
            <WeeklyPicks 
              key={refreshKey} 
              currentWeek={currentWeek} 
              currentUser={currentUser}
              onDeletePick={onDeletePick}
            />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6" style={{ 
        backgroundColor: 'var(--color-bg)', 
        borderTop: '1px solid var(--color-border)',
        height: '20vh'
      }}>
        <div className="flex gap-4 h-full">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={selectedCategoryData?.placeholder}
            className="prompt-input flex-1"
            rows={1}
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim() && linkPreviews.length === 0}
            className="btn-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center self-end"
            style={{ minWidth: '56px', height: '56px' }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
} 