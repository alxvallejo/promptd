import React, { useState, useRef, useEffect } from 'react'
import { Send, Film, Tv, Gamepad2, Calendar, MoreHorizontal, X, ExternalLink } from 'lucide-react'
import { WeeklyPicks } from './WeeklyPicks'
import { searchIMDB, createIMDBLinkPreview, detectQuotedTitles, shouldSearchIMDB, extractIMDBId, searchIMDBById } from '../lib/imdbSearch'
import { fetchGeneralLinkPreview } from '../lib/linkPreview'
import type { User } from '@supabase/supabase-js'

interface LinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
  loading: boolean
  imdbData?: any
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
  { id: 'movies', label: 'Movies', icon: Film, placeholder: 'What movie are you picking this week? Put the title in "quotes" for automatic IMDb lookup, or paste a link...' },
  { id: 'tv', label: 'TV', icon: Tv, placeholder: 'What TV show are you watching this week? Put the title in "quotes" for automatic IMDb lookup, or share a link...' },
  { id: 'games', label: 'Video Games', icon: Gamepad2, placeholder: 'What game are you playing this week? Drop a link or describe your gaming pick...' },
  { id: 'activities', label: 'Activities', icon: Calendar, placeholder: 'What activity or experience are you picking this week? Share details or a link...' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, placeholder: 'What else are you picking this week? Share your choice...' },
]

export const Picks: React.FC<PicksProps> = ({ onSavePick, onDeletePick, currentUser }) => {
  const [selectedCategory, setSelectedCategory] = useState('movies')
  const [inputValue, setInputValue] = useState('')
  const [linkPreviews, setLinkPreviews] = useState<LinkPreview[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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
  }, [selectedCategory])

  // Extract URLs from text
  const extractUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.match(urlRegex) || []
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

  // Handle input change and detect URLs and quoted titles
  const handleInputChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Extract URLs from text
    const urls = extractUrls(newValue)
    const newUrls = urls.filter(url => !linkPreviews.some(preview => preview.url === url))

    // Extract quoted titles for IMDB search
    const quotedTitles = detectQuotedTitles(newValue)
    const newTitles = quotedTitles.filter(title => 
      shouldSearchIMDB(selectedCategory, title) && 
      !linkPreviews.some(preview => preview.url.includes('imdb.com') && preview.title?.includes(title.replace(/["""'']/g, '')))
    )

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

    // Handle IMDB searches for quoted titles
    if (newTitles.length > 0) {
      // Add loading previews for IMDB searches
      const loadingIMDBPreviews = newTitles.map(title => ({
        url: `imdb-search-${title}`, // Temporary URL for tracking
        title: `Searching "${title}"...`,
        description: 'Looking up movie/TV show information...',
        image: 'https://via.placeholder.com/300x400/f5c518/000000?text=IMDb+Search',
        loading: true
      }))
      setLinkPreviews(prev => [...prev, ...loadingIMDBPreviews])

      // Search IMDB for each quoted title
      for (const title of newTitles) {
        try {
          const searchType = selectedCategory === 'movies' ? 'movie' : selectedCategory === 'tv' ? 'series' : undefined
          const imdbData = await searchIMDB(title, searchType)
          
          if (imdbData) {
            const imdbPreview = createIMDBLinkPreview(imdbData)
            setLinkPreviews(prev => 
              prev.map(p => p.url === `imdb-search-${title}` ? imdbPreview : p)
            )
          } else {
            // Remove loading preview if no results found
            setLinkPreviews(prev => 
              prev.filter(p => p.url !== `imdb-search-${title}`)
            )
          }
        } catch (error) {
          console.error('Error searching IMDB for', title, error)
          setLinkPreviews(prev => 
            prev.filter(p => p.url !== `imdb-search-${title}`)
          )
        }
      }
    }

    // Remove previews for URLs that are no longer in the text
    const currentUrls = urls
    const currentTitles = quotedTitles
    
    setLinkPreviews(prev => prev.filter(preview => {
      // Keep URL previews that are still in the text (or their replaced titles for IMDB)
      if (preview.url.startsWith('http')) {
        // For IMDB URLs that have been replaced with titles, keep the preview if the title is in the text
        if (extractIMDBId(preview.url) && preview.imdbData?.Title) {
          const currentText = inputValue
          return currentUrls.includes(preview.url) || currentText.includes(preview.imdbData.Title)
        }
        return currentUrls.includes(preview.url)
      }
      // Keep IMDB previews for titles that are still quoted in the text
      if (preview.url.includes('imdb.com') && preview.imdbData) {
        return currentTitles.some(title => 
          preview.title?.includes(title.replace(/["""'']/g, '')) ||
          preview.imdbData.Title?.toLowerCase().includes(title.replace(/["""'']/g, '').toLowerCase())
        )
      }
      // Keep loading IMDB searches
      if (preview.url.startsWith('imdb-search-')) {
        const searchTitle = preview.url.replace('imdb-search-', '')
        return currentTitles.includes(searchTitle)
      }
      return false
    }))
  }

  const handleSubmit = async () => {
    if (!inputValue.trim()) return

    try {
      await onSavePick({
        category: selectedCategory,
        content: inputValue.trim(),
        linkPreviews: linkPreviews.filter(p => !p.loading),
        weekOf: currentWeek,
      })

      setInputValue('')
      setLinkPreviews([])
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
    // Also remove the URL from the input text
    setInputValue(prev => prev.replace(url, '').trim())
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)

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
                {(category.id === 'movies' || category.id === 'tv') && (
                  <span 
                    className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--color-accent)',
                      color: isSelected ? 'white' : 'white',
                      fontSize: '10px'
                    }}
                    title="Automatic IMDB lookup available - put titles in quotes"
                  >
                    IMDb
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Area - Split between input/previews and weekly picks */}
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-full">
          {/* Left Column - Input and Link Previews */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              Share Your Pick
            </h3>
            
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
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate" style={{ color: 'var(--color-text)' }}>
                            {preview.title || 'Link Preview'}
                          </h4>
                          {preview.description && (
                            <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                              {preview.description}
                            </p>
                          )}
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
                  {(selectedCategory === 'movies' || selectedCategory === 'tv') && (
                    <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        💡 <strong>Tip:</strong> Put titles in "quotes" for automatic IMDb lookup!
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Example: I just watched "The Matrix" - amazing film!
                      </p>
                    </div>
                  )}
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
            disabled={!inputValue.trim()}
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