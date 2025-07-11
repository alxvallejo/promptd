import React, { useState, useEffect } from 'react'
import { Calendar, Users, Image, FileText, ExternalLink, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface LinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
  isImage?: boolean
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

interface WeekData {
  week: string
  picks: Pick[]
  userCount: number
  totalItems: number
  previewImages: string[]
}

interface WeeklyGalleryProps {
  currentUser?: SupabaseUser | null
  onDeletePick?: (pickId: string) => void
  onToggleFullscreen?: () => void
  isFullscreen?: boolean
}

const categories = [
  { id: 'movies-tv', label: 'Movies & TV', color: '#e11d48' },
  { id: 'games', label: 'Video Games', color: '#7c3aed' },
  { id: 'activities', label: 'Pics', color: '#059669' },
  { id: 'links', label: 'Links', color: '#2563eb' },
  { id: 'other', label: 'Other', color: '#dc2626' },
]

export const WeeklyGallery: React.FC<WeeklyGalleryProps> = ({ 
  currentUser, 
  onDeletePick, 
  onToggleFullscreen, 
  isFullscreen 
}) => {
  const [weeks, setWeeks] = useState<WeekData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState<WeekData | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Get current week string to exclude it
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
    loadWeeksData()
  }, [])

  const loadWeeksData = async () => {
    try {
      setLoading(true)
      
      // Get all picks excluding current week
      const { data: picksData, error: picksError } = await supabase
        .from('picks')
        .select('*')
        .neq('week_of', currentWeek)
        .order('created_at', { ascending: false })

      if (picksError) {
        console.error('Error loading picks:', picksError)
        return
      }

      if (!picksData || picksData.length === 0) {
        setWeeks([])
        return
      }

      // Load user profiles
      const userIds = [...new Set(picksData.map(pick => pick.user_id))]
      let profilesMap = new Map()
      
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

      // Format picks
      const formattedPicks: Pick[] = picksData.map(pick => ({
        id: pick.id,
        category: pick.category,
        content: pick.content,
        linkPreviews: pick.link_previews || [],
        weekOf: pick.week_of,
        userId: pick.user_id,
        userFirstName: profilesMap.get(pick.user_id) || 'Anonymous User',
        createdAt: new Date(pick.created_at),
      }))

      // Group picks by week
      const weekGroups = formattedPicks.reduce((acc, pick) => {
        if (!acc[pick.weekOf]) {
          acc[pick.weekOf] = []
        }
        acc[pick.weekOf].push(pick)
        return acc
      }, {} as Record<string, Pick[]>)

      // Create week data with preview information
      const weeksData: WeekData[] = Object.entries(weekGroups)
        .map(([week, picks]) => {
          const uniqueUsers = new Set(picks.map(p => p.userId))
          const allImages = picks.flatMap(p => 
            p.linkPreviews
              .filter(preview => preview.image)
              .map(preview => preview.image!)
          )
          // Take up to 4 preview images
          const previewImages = allImages.slice(0, 4)
          
          return {
            week,
            picks,
            userCount: uniqueUsers.size,
            totalItems: picks.length + picks.reduce((sum, p) => sum + p.linkPreviews.length, 0),
            previewImages
          }
        })
        .sort((a, b) => {
          // Sort by week (most recent first)
          return new Date(b.picks[0].createdAt).getTime() - new Date(a.picks[0].createdAt).getTime()
        })

      setWeeks(weeksData)
    } catch (error) {
      console.error('Error loading weeks data:', error)
    } finally {
      setLoading(false)
    }
  }

  const openWeekDrawer = (weekData: WeekData) => {
    setSelectedWeek(weekData)
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedWeek(null)
  }

  const handleDeletePick = async (pickId: string) => {
    if (onDeletePick) {
      try {
        await onDeletePick(pickId)
        // Remove from local state
        setWeeks(prev => prev.map(week => ({
          ...week,
          picks: week.picks.filter(pick => pick.id !== pickId)
        })).filter(week => week.picks.length > 0))
        
        // Update selected week if needed
        if (selectedWeek) {
          const updatedPicks = selectedWeek.picks.filter(pick => pick.id !== pickId)
          if (updatedPicks.length === 0) {
            closeDrawer()
          } else {
            setSelectedWeek({ ...selectedWeek, picks: updatedPicks })
          }
        }
      } catch (error) {
        console.error('Error deleting pick:', error)
      }
    }
  }

  const getCategoryIcon = (category: string) => {
    const categoryMap = {
      'movies-tv': '🎬',
      'games': '🎮',
      'activities': '📸',
      'links': '🔗',
      'other': '⭐'
    }
    return categoryMap[category as keyof typeof categoryMap] || '⭐'
  }

  const formatWeekForDisplay = (week: string) => {
    return week
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Loading past weeks...
        </div>
      </div>
    )
  }

  if (weeks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            No Past Weeks Yet
          </h2>
          <p className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
            Once you and your community start sharing picks, you'll be able to browse through past weeks here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Gallery Grid */}
      <div className={`transition-all duration-300 ${isDrawerOpen ? 'flex-1 pr-4' : 'w-full'}`}>
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-8 relative">
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="absolute top-0 right-0 p-3 rounded-lg transition-colors"
                style={{ 
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'var(--color-bg-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-text)'
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-bg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-muted)'
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'
                }}
                title={isFullscreen ? "Exit fullscreen" : "Expand to fullscreen"}
              >
                {isFullscreen ? '✕' : '⛶'}
              </button>
            )}
            <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
              Past Weeks Gallery
            </h2>
            <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
              Browse through {weeks.length} weeks of community picks
            </p>
            <div className="mt-4 mx-auto w-24 h-1 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></div>
          </div>

          {/* Week Tiles Grid */}
          <div className="grid grid-cols-auto-fill gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {weeks.map((weekData) => (
              <div
                key={weekData.week}
                onClick={() => openWeekDrawer(weekData)}
                className="relative w-full h-48 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{ 
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '2px solid var(--color-border)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {/* Background Images Collage */}
                {weekData.previewImages.length > 0 ? (
                  <div className="absolute inset-0">
                    {weekData.previewImages.length === 1 ? (
                      <img
                        src={weekData.previewImages[0]}
                        alt="Week preview"
                        className="w-full h-full object-cover opacity-60"
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-1 h-full">
                        {weekData.previewImages.slice(0, 4).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover opacity-50"
                          />
                        ))}
                      </div>
                    )}
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-black bg-opacity-40" />
                  </div>
                ) : (
                  // Fallback gradient background
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-secondary, #6366f1) 100%)',
                      opacity: 0.8
                    }}
                  />
                )}

                {/* Content Overlay */}
                <div className="relative z-10 p-4 h-full flex flex-col justify-between text-white">
                  {/* Top Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={16} />
                      <span className="text-sm font-medium">
                        {formatWeekForDisplay(weekData.week)}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div>
                    {/* Category Icons */}
                    <div className="flex gap-1 mb-3">
                      {Array.from(new Set(weekData.picks.map(p => p.category))).map(category => (
                        <span key={category} className="text-lg" title={categories.find(c => c.id === category)?.label}>
                          {getCategoryIcon(category)}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={14} />
                        <span>{weekData.userCount} {weekData.userCount === 1 ? 'person' : 'people'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText size={14} />
                        <span>{weekData.picks.length} {weekData.picks.length === 1 ? 'pick' : 'picks'}</span>
                      </div>
                      {weekData.previewImages.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Image size={14} />
                          <span>{weekData.totalItems} total items</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <span className="text-white text-sm">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Drawer */}
      {isDrawerOpen && selectedWeek && (
        <div 
          className="w-96 h-full flex flex-col transition-all duration-300"
          style={{ 
            backgroundColor: 'var(--color-bg)',
            borderLeft: '1px solid var(--color-border)'
          }}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                {formatWeekForDisplay(selectedWeek.week)}
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {selectedWeek.picks.length} picks from {selectedWeek.userCount} {selectedWeek.userCount === 1 ? 'person' : 'people'}
              </p>
            </div>
            
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

          {/* Picks Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedWeek.picks
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((pick) => {
                const category = categories.find(c => c.id === pick.category)
                
                return (
                  <div 
                    key={pick.id} 
                    className="p-4 rounded-lg"
                    style={{ 
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    {/* Pick Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ 
                            backgroundColor: category?.color || 'var(--color-accent)',
                            color: 'white'
                          }}
                        >
                          <span className="text-sm font-medium">
                            {getCategoryIcon(pick.category)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                            {pick.userFirstName}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {category?.label} • {pick.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Delete button for user's own picks */}
                      {currentUser && pick.userId === currentUser.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Are you sure you want to delete this pick?')) {
                              handleDeletePick(pick.id)
                            }
                          }}
                          className="p-1 rounded transition-colors"
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
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Pick Content */}
                    <div className="mb-3">
                      <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>
                        {pick.content}
                      </p>
                    </div>

                    {/* Link Previews */}
                    {pick.linkPreviews.length > 0 && (
                      <div className="space-y-2">
                        {pick.linkPreviews.map((preview, index) => (
                          <div
                            key={index}
                            className="flex gap-3 p-2 rounded"
                            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                          >
                            {preview.image && (
                              <img
                                src={preview.image}
                                alt={preview.title}
                                className={`object-cover rounded ${preview.isImage ? 'w-16 h-16' : 'w-12 h-12'}`}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-xs mb-1 truncate" style={{ color: 'var(--color-text)' }}>
                                {preview.title || 'Link Preview'}
                              </h5>
                              {preview.description && (
                                <p className="text-xs line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                                  {preview.description}
                                </p>
                              )}
                              {!preview.isImage && (
                                <a
                                  href={preview.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs mt-1 transition-colors"
                                  style={{ color: 'var(--color-accent)' }}
                                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                >
                                  <ExternalLink size={10} />
                                  Visit
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
} 