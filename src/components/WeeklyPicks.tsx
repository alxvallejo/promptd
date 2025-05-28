import React, { useState, useEffect } from 'react'
import { Film, Tv, Gamepad2, Calendar, MoreHorizontal, ExternalLink, User } from 'lucide-react'
import { supabase } from '../lib/supabase'

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
  userEmail?: string
  createdAt: Date
}

interface WeeklyPicksProps {
  currentWeek: string
}

const categories = [
  { id: 'movies', label: 'Movies', icon: Film },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'games', label: 'Video Games', icon: Gamepad2 },
  { id: 'activities', label: 'Activities', icon: Calendar },
  { id: 'other', label: 'Other', icon: MoreHorizontal },
]

export const WeeklyPicks: React.FC<WeeklyPicksProps> = ({ currentWeek }) => {
  const [picks, setPicks] = useState<Pick[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    loadWeeklyPicks()
  }, [currentWeek])

  const loadWeeklyPicks = async () => {
    try {
      setLoading(true)
      
      // First, try to load picks for the current week from all users
      const { data: picksData, error } = await supabase
        .from('picks')
        .select('*')
        .eq('week_of', currentWeek)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading weekly picks:', error)
        return
      }

      // Get unique user IDs from picks
      const userIds = [...new Set(picksData?.map(pick => pick.user_id) || [])]
      
      // Get user emails from auth.users (this requires RLS to be configured properly)
      const userEmails: { [key: string]: string } = {}
      
      if (userIds.length > 0) {
        try {
          // Try to get user data - this might not work depending on RLS setup
          const { data: userData } = await supabase.auth.admin.listUsers()
          
          if (userData?.users) {
            userData.users.forEach(user => {
              if (userIds.includes(user.id)) {
                userEmails[user.id] = user.email || 'Anonymous'
              }
            })
          }
        } catch (error) {
          console.log('Could not fetch user emails, using anonymous names')
        }
      }

      const formattedPicks = picksData?.map(pick => ({
        id: pick.id,
        category: pick.category,
        content: pick.content,
        linkPreviews: pick.link_previews || [],
        weekOf: pick.week_of,
        userId: pick.user_id,
        userEmail: userEmails[pick.user_id] || 'Anonymous User',
        createdAt: new Date(pick.created_at),
      })) || []

      setPicks(formattedPicks)
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
                        <span className="text-sm">{pick.userEmail}</span>
                      </div>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {pick.createdAt.toLocaleDateString()} at {pick.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
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