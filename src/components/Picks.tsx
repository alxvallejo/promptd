import React, { useState, useRef, useEffect } from 'react'
import { Send, Film, Tv, Gamepad2, Calendar, MoreHorizontal, X, ExternalLink } from 'lucide-react'

interface LinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
  loading: boolean
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
}

const categories = [
  { id: 'movies', label: 'Movies', icon: Film, placeholder: 'What movie are you picking this week? Paste a link or describe your choice...' },
  { id: 'tv', label: 'TV', icon: Tv, placeholder: 'What TV show or series are you watching this week? Share a link or tell us about it...' },
  { id: 'games', label: 'Video Games', icon: Gamepad2, placeholder: 'What game are you playing this week? Drop a link or describe your gaming pick...' },
  { id: 'activities', label: 'Activities', icon: Calendar, placeholder: 'What activity or experience are you picking this week? Share details or a link...' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, placeholder: 'What else are you picking this week? Share your choice...' },
]

export const Picks: React.FC<PicksProps> = ({ onSavePick }) => {
  const [selectedCategory, setSelectedCategory] = useState('movies')
  const [inputValue, setInputValue] = useState('')
  const [linkPreviews, setLinkPreviews] = useState<LinkPreview[]>([])
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

  // Fetch link preview (mock implementation - in real app you'd use a service)
  const fetchLinkPreview = async (url: string): Promise<LinkPreview> => {
    // Mock implementation - in a real app, you'd use a service like linkpreview.net
    // or implement server-side scraping
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock data based on common domains
        let mockData: Partial<LinkPreview> = {}
        
        if (url.includes('imdb.com')) {
          mockData = {
            title: 'Movie Title - IMDb',
            description: 'A great movie with amazing reviews and stellar cast.',
            image: 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=Movie+Poster'
          }
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
          mockData = {
            title: 'Video Title - YouTube',
            description: 'An interesting video about the topic.',
            image: 'https://via.placeholder.com/300x200/ff0000/ffffff?text=YouTube+Video'
          }
        } else if (url.includes('netflix.com')) {
          mockData = {
            title: 'TV Show - Netflix',
            description: 'A popular series streaming on Netflix.',
            image: 'https://via.placeholder.com/300x200/e50914/ffffff?text=Netflix+Show'
          }
        } else if (url.includes('steam')) {
          mockData = {
            title: 'Game Title - Steam',
            description: 'An exciting game available on Steam.',
            image: 'https://via.placeholder.com/300x200/1b2838/ffffff?text=Steam+Game'
          }
        } else {
          mockData = {
            title: 'Link Preview',
            description: 'Preview of the shared link.',
            image: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Link+Preview'
          }
        }
        
        resolve({
          url,
          ...mockData,
          loading: false
        })
      }, 1000)
    })
  }

  // Handle input change and detect URLs
  const handleInputChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    const urls = extractUrls(newValue)
    const newUrls = urls.filter(url => !linkPreviews.some(preview => preview.url === url))

    if (newUrls.length > 0) {
      // Add loading previews
      const loadingPreviews = newUrls.map(url => ({ url, loading: true }))
      setLinkPreviews(prev => [...prev, ...loadingPreviews])

      // Fetch actual previews
      for (const url of newUrls) {
        try {
          const preview = await fetchLinkPreview(url)
          setLinkPreviews(prev => 
            prev.map(p => p.url === url ? preview : p)
          )
        } catch (error) {
          console.error('Error fetching preview for', url, error)
          setLinkPreviews(prev => 
            prev.map(p => p.url === url ? { ...p, loading: false } : p)
          )
        }
      }
    }

    // Remove previews for URLs that are no longer in the text
    setLinkPreviews(prev => prev.filter(preview => urls.includes(preview.url)))
  }

  const handleSubmit = () => {
    if (!inputValue.trim()) return

    onSavePick({
      category: selectedCategory,
      content: inputValue.trim(),
      linkPreviews: linkPreviews.filter(p => !p.loading),
      weekOf: currentWeek,
    })

    setInputValue('')
    setLinkPreviews([])
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
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
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
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="mb-4">
                {selectedCategoryData && <selectedCategoryData.icon size={48} style={{ color: 'var(--color-accent)', margin: '0 auto' }} />}
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                {selectedCategoryData?.label} Pick
              </h3>
              <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                Share your weekly {selectedCategoryData?.label.toLowerCase()} pick below
              </p>
            </div>
          </div>
        )}
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