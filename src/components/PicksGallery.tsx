import React, { useState, useEffect } from 'react'
import { Film, Gamepad2, Calendar, MoreHorizontal, ExternalLink, User, Trash2, X, Maximize2, Minimize2, Users, Eye, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface LinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
  isImage?: boolean
  rating?: number
  review?: string
  userTitle?: string
  userComment?: string
  exifData?: any
}

interface Pick {
  id: string
  category: string
  content: string
  linkPreviews: LinkPreview[]
  weekOf: string
  userId: string
  userFirstName?: string
  createdAt: Date
}

interface PicksGalleryProps {
  currentWeek: string
  currentUser?: SupabaseUser | null
  onDeletePick?: (pickId: string) => void
  isExpanded?: boolean
  onToggleExpanded?: () => void
}

const categories = [
  { id: 'movies-tv', label: 'Movies & TV', icon: Film },
  { id: 'games', label: 'Video Games', icon: Gamepad2 },
  { id: 'activities', label: 'Activities', icon: Calendar },
  { id: 'other', label: 'Other', icon: MoreHorizontal },
]

export const PicksGallery: React.FC<PicksGalleryProps> = ({ currentWeek, currentUser, onDeletePick, isExpanded = false, onToggleExpanded }) => {
  const [picks, setPicks] = useState<Pick[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedPick, setSelectedPick] = useState<Pick | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [previewingImage, setPreviewingImage] = useState<string | null>(null)
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  useEffect(() => {
    loadWeeklyPicks()
  }, [currentWeek])

  const loadWeeklyPicks = async () => {
    try {
      setLoading(true)
      
      // Load picks for the current week
      const { data: picksData, error: picksError } = await supabase
        .from('picks')
        .select('*')
        .eq('week_of', currentWeek)
        .order('created_at', { ascending: false })

      if (picksError) {
        console.error('Error loading weekly picks:', picksError)
        return
      }

      // Load user profiles to get first names
      let profilesMap = new Map()
      
      if (picksData && picksData.length > 0) {
        const userIds = [...new Set(picksData.map(pick => pick.user_id))]
        
        try {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name')
            .in('id', userIds)

          if (!profilesError && profilesData) {
            profilesData.forEach(profile => {
              profilesMap.set(profile.id, profile.first_name)
            })
          }
        } catch {
          // Profiles table not available
        }
      }

      const formattedPicks = picksData?.map(pick => ({
        id: pick.id,
        category: pick.category,
        content: pick.content,
        linkPreviews: pick.link_previews || [],
        weekOf: pick.week_of,
        userId: pick.user_id,
        userFirstName: profilesMap.get(pick.user_id) || 'Anonymous User',
        createdAt: new Date(pick.created_at),
      })) || []

      setPicks(formattedPicks)
    } catch (error) {
      console.error('Error loading weekly picks:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'movies-tv': '#e11d48',
      'games': '#7c3aed',
      'activities': '#059669',
      'other': '#dc2626'
    }
    return colors[category as keyof typeof colors] || '#6b7280'
  }

  const getPicksByCategory = (categoryId: string) => {
    if (categoryId === 'movies-tv') {
      return picks.filter(pick => 
        pick.category === 'movies-tv' || 
        pick.category === 'movies' || 
        pick.category === 'tv'
      )
    }
    return picks.filter(pick => pick.category === categoryId)
  }

  const getPicksCount = (categoryId: string) => {
    return getPicksByCategory(categoryId).length
  }

  const getUniqueUsers = () => {
    const users = picks.reduce((acc, pick) => {
      if (!acc.find(u => u.id === pick.userId)) {
        acc.push({
          id: pick.userId,
          name: pick.userFirstName || 'Anonymous',
          count: picks.filter(p => p.userId === pick.userId).length
        })
      }
      return acc
    }, [] as Array<{ id: string, name: string, count: number }>)
    
    return users.sort((a, b) => b.count - a.count) // Sort by count descending
  }

  const getFilteredPicks = () => {
    let filtered = picks
    
    // Apply category filter
    if (selectedCategory) {
      filtered = getPicksByCategory(selectedCategory)
    }
    
    // Apply user filter
    if (selectedUser) {
      filtered = filtered.filter(pick => pick.userId === selectedUser)
    }
    
    return filtered
  }

  const handleDeletePick = async (pickId: string) => {
    if (onDeletePick) {
      try {
        await onDeletePick(pickId)
        setPicks(prev => prev.filter(pick => pick.id !== pickId))
        // Close drawer if the deleted pick was selected
        if (selectedPick?.id === pickId) {
          setSelectedPick(null)
          setIsDrawerOpen(false)
        }
      } catch (error) {
        console.error('Error deleting pick:', error)
      }
    }
  }

  const openPickDrawer = (pick: Pick) => {
    setSelectedPick(pick)
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedPick(null)
  }

  const toggleImagePreview = (imageUrl: string) => {
    setPreviewingImage(previewingImage === imageUrl ? null : imageUrl)
  }

  const exitPreviewMode = () => {
    setPreviewingImage(null)
  }

  const generateContentThumbnail = (content: string, categoryColor: string) => {
    // Create a simple colored tile with text preview
    const canvas = document.createElement('canvas')
    const size = isExpanded ? 224 : 192 // 20% smaller than previous double size
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Background
      ctx.fillStyle = categoryColor
      ctx.fillRect(0, 0, size, size)
      
      // Text
      ctx.fillStyle = 'white'
      ctx.font = `${Math.floor(size / 16)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Wrap text
      const words = content.split(' ')
      const lines = []
      let currentLine = ''
      const maxWidth = size - 40
      
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word
        if (ctx.measureText(testLine).width > maxWidth && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
        if (lines.length >= 12) break // More lines for much larger tiles
      }
      if (currentLine && lines.length < 12) {
        lines.push(currentLine)
      }
      
      const lineHeight = Math.floor(size / 14)
      const startY = (size - (lines.length * lineHeight)) / 2 + lineHeight / 2
      
      lines.forEach((line, index) => {
        ctx.fillText(line, size / 2, startY + (index * lineHeight))
      })
    }
    
    return canvas.toDataURL()
  }

  // Get filtered picks
  const filteredPicks = getFilteredPicks()

  // Create tiles from picks - one unified tile per pick
  const createTiles = (picks: Pick[]) => {
    const tiles: Array<{
      id: string
      type: 'content' | 'link' | 'image'
      pick: Pick
      preview?: LinkPreview
      thumbnail: string
      title: string
      hasMultipleImages: boolean
    }> = []

    picks.forEach(pick => {
      const categoryColor = getCategoryColor(pick.category)
      
      // Get the first image preview if available
      const firstImagePreview = pick.linkPreviews.find(preview => preview.image)
      const imagePreviewsCount = pick.linkPreviews.filter(preview => preview.image).length
      
      if (firstImagePreview?.image) {
        // Create a unified tile with image background and content overlay
        tiles.push({
          id: `${pick.id}-unified`,
          type: firstImagePreview.isImage ? 'image' : 'link',
          pick,
          preview: firstImagePreview,
          thumbnail: firstImagePreview.image,
          title: pick.content.slice(0, 50) + (pick.content.length > 50 ? '...' : ''),
          hasMultipleImages: imagePreviewsCount > 1
        })
        
        // Add additional image tiles only if there are multiple images
        if (imagePreviewsCount > 1) {
          pick.linkPreviews.slice(1).forEach((preview, index) => {
            if (preview.image) {
              tiles.push({
                id: `${pick.id}-extra-${index}`,
                type: preview.isImage ? 'image' : 'link',
                pick,
                preview,
                thumbnail: preview.image,
                title: preview.title || `Image ${index + 2}`,
                hasMultipleImages: false
              })
            }
          })
        }
      } else {
        // No image preview, create content tile
        tiles.push({
          id: `${pick.id}-content`,
          type: 'content',
          pick,
          thumbnail: generateContentThumbnail(pick.content, categoryColor),
          title: pick.content.slice(0, 50) + (pick.content.length > 50 ? '...' : ''),
          hasMultipleImages: false
        })
      }
    })

    return tiles
  }

  const tiles = createTiles(filteredPicks)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Loading gallery...
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Main Gallery Area */}
      <div className={`transition-all duration-300 ${isDrawerOpen ? 'flex-1 pr-4' : 'w-full'}`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center mb-8 relative">
            {onToggleExpanded && (
              <button
                onClick={onToggleExpanded}
                className="absolute top-0 left-0 p-2 rounded-lg transition-colors"
                style={{ 
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'var(--color-bg-tertiary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-text)'
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-bg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-muted)'
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                }}
                title={isExpanded ? "Collapse view" : "Expand to full width"}
              >
                {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            )}
            <h3 className="text-3xl font-bold mb-3 flex items-center gap-3 justify-center" style={{ color: 'var(--color-text)' }}>
              <Users size={32} style={{ color: 'var(--color-accent)' }} />
              Gallery
            </h3>
            <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
              Week of {currentWeek}
            </p>
            <div className="mt-4 mx-auto w-24 h-1 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></div>
          </div>

          {/* Filters Toggle */}
          <div className="mb-4">
            <div className="flex items-center justify-center">
              <button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                style={{
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  border: `2px solid var(--color-border)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)'
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.backgroundColor = 'var(--color-bg)'
                }}
              >
                <Filter size={18} />
                <span className="font-medium">Filters</span>
                <div className="flex items-center gap-1">
                  {(selectedCategory || selectedUser) && (
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600">
                      {(selectedCategory ? 1 : 0) + (selectedUser ? 1 : 0)}
                    </span>
                  )}
                  {filtersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>
            </div>
          </div>

          {/* Collapsible Filters */}
          {filtersExpanded && (
            <div className="mb-6 space-y-6">
              {/* Category Filters */}
              <div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>🏷️ Categories</span>
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-200 shadow-sm hover:shadow-md ${
                      selectedCategory === null ? 'active' : ''
                    }`}
                    style={{
                      background: selectedCategory === null 
                        ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))' 
                        : 'var(--color-bg)',
                      color: selectedCategory === null ? 'white' : 'var(--color-text-secondary)',
                      border: `2px solid ${selectedCategory === null ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    }}
                  >
                    <span className="text-lg">✨</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      selectedCategory === null 
                        ? 'bg-black/20 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {picks.length}
                    </span>
                  </button>
                  
                  {categories.map((category) => {
                    const Icon = category.icon
                    const count = getPicksCount(category.id)
                    const isSelected = selectedCategory === category.id
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-200 shadow-sm hover:shadow-md ${
                          isSelected ? 'active' : ''
                        }`}
                        style={{
                          background: isSelected 
                            ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))' 
                            : 'var(--color-bg)',
                          color: isSelected ? 'white' : 'var(--color-text-secondary)',
                          border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                          opacity: count === 0 ? 0.5 : 1,
                        }}
                        disabled={count === 0}
                      >
                        <Icon size={18} />
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          isSelected 
                            ? 'bg-black/20 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* User Filters */}
              {getUniqueUsers().length > 0 && (
                <div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>👥 Contributors</span>
                  </div>
                  <div className="flex gap-3 flex-wrap justify-center">
                    <button
                      onClick={() => setSelectedUser(null)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-200 shadow-sm hover:shadow-md ${
                        selectedUser === null ? 'active' : ''
                      }`}
                      style={{
                        background: selectedUser === null 
                          ? 'linear-gradient(135deg, #10b981, #059669)' 
                          : 'var(--color-bg)',
                        color: selectedUser === null ? 'white' : 'var(--color-text-secondary)',
                        border: `2px solid ${selectedUser === null ? '#10b981' : 'var(--color-border)'}`,
                      }}
                    >
                      <span className="text-lg">👥</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        selectedUser === null 
                          ? 'bg-black/20 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getUniqueUsers().length}
                      </span>
                    </button>
                    {getUniqueUsers().map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-200 shadow-sm hover:shadow-md ${
                          selectedUser === user.id ? 'active' : ''
                        }`}
                        style={{
                          background: selectedUser === user.id 
                            ? 'linear-gradient(135deg, #10b981, #059669)' 
                            : 'var(--color-bg)',
                          color: selectedUser === user.id ? 'white' : 'var(--color-text-secondary)',
                          border: `2px solid ${selectedUser === user.id ? '#10b981' : 'var(--color-border)'}`,
                        }}
                      >
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ 
                            background: selectedUser === user.id 
                              ? 'rgba(0,0,0,0.2)' 
                              : 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
                          }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="max-w-20 truncate font-medium">{user.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          selectedUser === user.id 
                            ? 'bg-black/20 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gallery Grid */}
          {tiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
                No picks shared this week yet. Be the first to share!
              </p>
            </div>
          ) : (
            <div className={`p-4 ${isExpanded ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
              {tiles.map((tile) => (
                <div
                  key={tile.id}
                  className="flex items-center gap-6 p-4 rounded-lg transition-all duration-200 hover:shadow-lg relative"
                  style={{ 
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent)'
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                    e.currentTarget.style.backgroundColor = 'var(--color-bg)'
                  }}
                >
                  {/* Delete button for user's own picks */}
                  {currentUser && tile.pick.userId === currentUser.id && onDeletePick && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Are you sure you want to delete this pick?')) {
                          handleDeletePick(tile.pick.id)
                        }
                      }}
                      className="absolute top-2 right-2 p-2 rounded-lg transition-colors z-10"
                      style={{ 
                        color: 'var(--color-text-muted)',
                        backgroundColor: 'var(--color-bg)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--color-warning)'
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--color-text-muted)'
                        e.currentTarget.style.backgroundColor = 'var(--color-bg)'
                      }}
                      title="Delete this pick"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  {/* Content details */}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => openPickDrawer(tile.pick)}
                  >
                    {/* User name */}
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(tile.pick.category) }}
                      />
                      <h4 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>
                        {tile.pick.userFirstName}
                      </h4>
                      <span className="text-sm px-2 py-1 rounded-full" style={{ 
                        backgroundColor: 'var(--color-accent-bg)', 
                        color: 'var(--color-accent)'
                      }}>
                        {categories.find(c => c.id === tile.pick.category)?.label}
                      </span>
                    </div>

                    {/* Movie/TV title if available */}
                    {(tile.pick.category === 'movies-tv' || tile.pick.category === 'movies' || tile.pick.category === 'tv') && 
                     tile.pick.linkPreviews && tile.pick.linkPreviews.length > 0 && tile.pick.linkPreviews[0].title && (
                      <div className="mb-3">
                        <h5 className="font-medium text-xl mb-1" style={{ color: 'var(--color-text)' }}>
                          {tile.pick.linkPreviews[0].title}
                        </h5>
                        {tile.pick.linkPreviews[0].description && (
                          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {tile.pick.linkPreviews[0].description}
                          </p>
                        )}
                      </div>
                    )}

                    {/* User's content */}
                    <p className="text-base mb-3 line-clamp-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {tile.pick.content}
                    </p>

                    {/* Image metadata and user content for image picks */}
                    {tile.pick.linkPreviews && tile.pick.linkPreviews.some(preview => preview.isImage && (preview.exifData || preview.userTitle || preview.userComment)) && (
                      <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                        <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                          📸 Photo Details
                        </p>
                        <div className="space-y-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {tile.pick.linkPreviews
                            .filter(preview => preview.isImage && (preview.exifData || preview.userTitle || preview.userComment))
                            .slice(0, 1) // Show metadata for first image only
                            .map((preview, index) => (
                              <div key={index} className="space-y-2">
                                {/* User title and comment */}
                                {(preview.userTitle || preview.userComment) && (
                                  <div className="space-y-1">
                                    {preview.userTitle && (
                                      <div className="flex items-start gap-2">
                                        <span>🏷️</span>
                                        <span className="font-medium" style={{ color: 'var(--color-text)' }}>{preview.userTitle}</span>
                                      </div>
                                    )}
                                    {preview.userComment && (
                                      <div className="flex items-start gap-2">
                                        <span>💬</span>
                                        <span className="leading-relaxed">{preview.userComment}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* EXIF data */}
                                {preview.exifData && (
                                  <div className="space-y-1">
                                    {preview.exifData?.dateTaken && (
                                      <div className="flex items-center gap-2">
                                        <span>📅</span>
                                        <span>{
                                          (() => {
                                            const date = preview.exifData.dateTaken instanceof Date 
                                              ? preview.exifData.dateTaken 
                                              : new Date(preview.exifData.dateTaken)
                                            return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                          })()
                                        }</span>
                                      </div>
                                    )}
                                    {preview.exifData?.location && (
                                      <div className="flex items-center gap-2">
                                        <span>📍</span>
                                        <span>{preview.description?.split(' • ').find(part => part.includes(',')) || `${preview.exifData.location.latitude.toFixed(4)}, ${preview.exifData.location.longitude.toFixed(4)}`}</span>
                                      </div>
                                    )}
                                    {preview.exifData?.camera && (
                                      <div className="flex items-center gap-2">
                                        <span>📷</span>
                                        <span>{[preview.exifData.camera.make, preview.exifData.camera.model].filter(Boolean).join(' ')}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}

                    {/* Rating and review if available */}
                    {tile.pick.linkPreviews && tile.pick.linkPreviews.length > 0 && tile.pick.linkPreviews[0].rating && (
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Rating:</span>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-lg ${star <= (tile.pick.linkPreviews[0].rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        {tile.pick.linkPreviews[0].review && (
                          <p className="text-sm italic line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                            "{tile.pick.linkPreviews[0].review}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tile */}
                  <div 
                    className="relative w-48 h-48 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                    style={{ 
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: '2px solid var(--color-border)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      // If there's a link preview, open that link, otherwise open drawer
                      const firstLinkPreview = tile.pick.linkPreviews.find(preview => !preview.isImage)
                      if (firstLinkPreview) {
                        window.open(firstLinkPreview.url, '_blank')
                      } else {
                        openPickDrawer(tile.pick)
                      }
                    }}
                  >
                  {tile.type === 'content' ? (
                    // Pure content tile (no image preview)
                    <div 
                      className="w-full h-full flex items-center justify-center p-3"
                      style={{ backgroundColor: getCategoryColor(tile.pick.category) }}
                    >
                      <div className="text-center">
                        <div className={`text-white font-medium leading-tight ${isExpanded ? 'text-base' : 'text-sm'}`}>
                          {tile.pick.content.slice(0, isExpanded ? 120 : 100)}
                        </div>
                      </div>
                    </div>
                  ) : tile.id.includes('unified') ? (
                    // Unified tile with image background (no overlay text)
                    <div className="relative w-full h-full group">
                      <img
                        src={tile.thumbnail}
                        alt={tile.title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Preview overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleImagePreview(tile.thumbnail)
                          }}
                          className="p-3 rounded-full bg-white bg-opacity-20 backdrop-blur-sm transition-all hover:bg-opacity-30"
                          title="Preview image"
                        >
                          <Eye size={24} color="white" />
                        </button>
                      </div>
                      
                      {/* Multiple images indicator */}
                      {tile.hasMultipleImages && (
                        <div className={`absolute top-3 right-3 rounded-full bg-white bg-opacity-80 flex items-center justify-center ${isExpanded ? 'w-6 h-6' : 'w-5 h-5'}`}>
                          <span className={`font-bold text-black ${isExpanded ? 'text-xs' : 'text-[10px]'}`}>+</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Additional image tiles
                    <div className="relative w-full h-full group">
                      <img
                        src={tile.thumbnail}
                        alt={tile.title}
                        className="w-full h-full object-cover"
                      />

                      {/* Preview overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleImagePreview(tile.thumbnail)
                          }}
                          className="p-3 rounded-full bg-white bg-opacity-20 backdrop-blur-sm transition-all hover:bg-opacity-30"
                          title="Preview image"
                        >
                          <Eye size={24} color="white" />
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Drawer */}
      {isDrawerOpen && selectedPick && (
        <div 
          className="w-96 h-full flex flex-col transition-all duration-300"
          style={{ 
            backgroundColor: 'var(--color-bg)',
            borderLeft: '1px solid var(--color-border)'
          }}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{ 
                  backgroundColor: 'var(--color-accent-bg)',
                  color: 'var(--color-accent)'
                }}
              >
                <User size={18} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                  {selectedPick.userFirstName}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {categories.find(c => c.id === selectedPick.category)?.label}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Delete button for user's own picks */}
              {currentUser && selectedPick.userId === currentUser.id && onDeletePick && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this pick?')) {
                      handleDeletePick(selectedPick.id)
                    }
                  }}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-warning)'
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-muted)'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  title="Delete this pick"
                >
                  <Trash2 size={16} />
                </button>
              )}
              
              <button
                onClick={closeDrawer}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-text)'
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-muted)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Pick Content */}
            <div className="space-y-3">
              <h4 className="font-medium" style={{ color: 'var(--color-text)' }}>
                Pick Details
              </h4>
              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
              >
                <p className="whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>
                  {selectedPick.content}
                </p>
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {selectedPick.createdAt.toLocaleDateString()} at {selectedPick.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Link Previews */}
            {selectedPick.linkPreviews.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium" style={{ color: 'var(--color-text)' }}>
                  Links & Media
                </h4>
                <div className="space-y-3">
                  {selectedPick.linkPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg"
                      style={{ 
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      {preview.image && (
                        <img
                          src={preview.image}
                          alt={preview.title}
                          className={`w-full object-cover rounded-lg mb-3 ${preview.isImage ? 'max-h-48' : 'h-24'}`}
                        />
                      )}
                      <div>
                        <h5 className="font-medium text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                          {preview.title || 'Link Preview'}
                        </h5>
                        {preview.description && (
                          <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                            {preview.description}
                          </p>
                        )}
                        {!preview.isImage && (
                          <a
                            href={preview.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs transition-colors"
                            style={{ color: 'var(--color-accent)' }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            <ExternalLink size={10} />
                            Visit Link
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewingImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={exitPreviewMode}
        >
          <div 
            className="relative max-w-5xl max-h-full w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-h-[90vh] flex items-center justify-center">
              <img
                src={previewingImage}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              {/* Close button */}
              <button
                onClick={exitPreviewMode}
                className="absolute top-4 right-4 p-3 rounded-full backdrop-blur-sm transition-colors"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'
                }}
                title="Close preview"
              >
                <X size={24} />
              </button>

              {/* Overlaid text content for image with title/comment */}
              {(() => {
                // Find the pick and preview that matches the current image
                const matchingPick = picks.find(pick => 
                  pick.linkPreviews.some(preview => preview.image === previewingImage)
                )
                const matchingPreview = matchingPick?.linkPreviews.find(preview => preview.image === previewingImage)
                
                if (matchingPreview && (matchingPreview.userTitle || matchingPreview.userComment || matchingPreview.exifData)) {
                  return (
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <div className="space-y-3">
                        {matchingPreview.userTitle && (
                          <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                            {matchingPreview.userTitle}
                          </h3>
                        )}
                        {matchingPreview.userComment && (
                          <p className="text-white/90 drop-shadow-lg leading-relaxed text-lg">
                            {matchingPreview.userComment}
                          </p>
                        )}
                        
                        {/* EXIF info */}
                        {matchingPreview.exifData && (
                          <div className="flex flex-wrap gap-4 text-sm text-white/70 mt-4">
                            {matchingPreview.exifData.dateTaken && (
                              <span>📅 {
                                (() => {
                                  const date = matchingPreview.exifData.dateTaken instanceof Date 
                                    ? matchingPreview.exifData.dateTaken 
                                    : new Date(matchingPreview.exifData.dateTaken)
                                  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                })()
                              }</span>
                            )}
                            {matchingPreview.exifData.location && (
                              <span>📍 {matchingPreview.description?.split(' • ').find(part => part.includes(',')) || 'Location'}</span>
                            )}
                            {matchingPreview.exifData.camera && (
                              <span>📷 {[matchingPreview.exifData.camera.make, matchingPreview.exifData.camera.model].filter(Boolean).join(' ')}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 