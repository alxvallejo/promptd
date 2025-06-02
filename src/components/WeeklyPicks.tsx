import React, { useState, useEffect } from 'react'
import { Film, Tv, Gamepad2, Calendar, MoreHorizontal, ExternalLink, User, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface LinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
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

interface WeeklyPicksProps {
  currentWeek: string
  currentUser?: SupabaseUser | null
  onDeletePick?: (pickId: string) => void
}

const categories = [
  { id: 'movies', label: 'Movies', icon: Film },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'games', label: 'Video Games', icon: Gamepad2 },
  { id: 'activities', label: 'Activities', icon: Calendar },
  { id: 'other', label: 'Other', icon: MoreHorizontal },
]

export const WeeklyPicks: React.FC<WeeklyPicksProps> = ({ currentWeek, currentUser, onDeletePick }) => {
  const [picks, setPicks] = useState<Pick[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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

      console.log(`Loaded ${picksData?.length || 0} picks for week: ${currentWeek}`)

      // Load user profiles to get first names
      let profilesMap = new Map()
      
      if (picksData && picksData.length > 0) {
        const userIds = [...new Set(picksData.map(pick => pick.user_id))]
        console.log(`Loading profiles for ${userIds.length} users`)
        
        try {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name')
            .in('id', userIds)

          if (!profilesError && profilesData) {
            profilesData.forEach(profile => {
              profilesMap.set(profile.id, profile.first_name)
            })
            console.log(`Loaded ${profilesData.length} user profiles`)
          } else if (profilesError) {
            console.log('Profiles table not available:', profilesError.message)
          }
        } catch (profilesError) {
          console.log('Could not load profiles:', profilesError)
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
      console.log(`Formatted ${formattedPicks.length} picks for display`)
    } catch (error) {
      console.error('Error loading weekly picks:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPicksByCategory = (categoryId: string) => {
    return picks.filter(pick => pick.category === categoryId)
  }

  const filteredPicks = selectedCategory 
    ? getPicksByCategory(selectedCategory)
    : picks

  const getPicksCount = (categoryId: string) => {
    return getPicksByCategory(categoryId).length
  }

  const handleDeletePick = async (pickId: string) => {
    if (onDeletePick) {
      try {
        await onDeletePick(pickId)
        // Remove the pick from local state immediately for better UX
        setPicks(prev => prev.filter(pick => pick.id !== pickId))
      } catch (error) {
        console.error('Error deleting pick:', error)
        // Optionally reload picks if delete failed
        loadWeeklyPicks()
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Loading this week's picks...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Community Picks
        </h3>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Week of {currentWeek}
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap justify-center">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            selectedCategory === null ? 'active' : ''
          }`}
          style={{
            backgroundColor: selectedCategory === null ? 'var(--color-accent)' : 'var(--color-bg)',
            color: selectedCategory === null ? 'white' : 'var(--color-text-secondary)',
            border: `1px solid ${selectedCategory === null ? 'var(--color-accent)' : 'var(--color-border)'}`,
          }}
        >
          All ({picks.length})
        </button>
        
        {categories.map((category) => {
          const Icon = category.icon
          const count = getPicksCount(category.id)
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
              disabled={count === 0}
            >
              <Icon size={16} />
              {category.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Picks Display */}
      {filteredPicks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            {selectedCategory 
              ? `No ${categories.find(c => c.id === selectedCategory)?.label.toLowerCase()} picks this week yet.`
              : 'No picks shared this week yet. Be the first to share!'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPicks.map((pick) => {
            const categoryData = categories.find(c => c.id === pick.category)
            const Icon = categoryData?.icon || MoreHorizontal
            
            return (
              <div key={pick.id} className="card p-6">
                {/* Pick Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      backgroundColor: 'var(--color-accent-bg)',
                      color: 'var(--color-accent)'
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                        {categoryData?.label}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                      <div className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                        <User size={14} />
                        <span className="text-sm">{pick.userFirstName}</span>
                      </div>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {pick.createdAt.toLocaleDateString()} at {pick.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {/* Delete button - only show for current user's picks */}
                  {currentUser && pick.userId === currentUser.id && onDeletePick && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this pick?')) {
                          handleDeletePick(pick.id)
                        }
                      }}
                      className="p-2 rounded-lg transition-colors"
                      style={{ 
                        color: 'var(--color-text-muted)',
                        backgroundColor: 'transparent'
                      }}
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
                </div>

                {/* Pick Content */}
                <div className="mb-4">
                  <p style={{ color: 'var(--color-text)' }} className="whitespace-pre-wrap">
                    {pick.content}
                  </p>
                </div>

                {/* Link Previews */}
                {pick.linkPreviews.length > 0 && (
                  <div className="space-y-3">
                    {pick.linkPreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 rounded-lg"
                        style={{ 
                          backgroundColor: 'var(--color-bg-secondary)',
                          border: '1px solid var(--color-border)'
                        }}
                      >
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 