import React, { useState, useEffect } from 'react'
import { Film, Gamepad2, Calendar, MoreHorizontal, ExternalLink, User, Trash2, Presentation, X, ChevronLeft, ChevronRight, Star } from 'lucide-react'
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
  { id: 'movies-tv', label: 'Movies & TV', icon: Film },
  { id: 'games', label: 'Video Games', icon: Gamepad2 },
  { id: 'activities', label: 'Activities', icon: Calendar },
  { id: 'other', label: 'Other', icon: MoreHorizontal },
]

export const WeeklyPicks: React.FC<WeeklyPicksProps> = ({ currentWeek, currentUser, onDeletePick }) => {
  const [picks, setPicks] = useState<Pick[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)
  const [presentationMode, setPresentationMode] = useState<{ isOpen: boolean; userGroup: any; currentSlide: number } | null>(null)

  // Star Display Component (read-only)
  const StarDisplay: React.FC<{ rating: number }> = ({ rating }) => {
    return (
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <Star
            key={starValue}
            size={16}
            fill={starValue <= rating ? 'var(--color-accent)' : 'none'}
            color={starValue <= rating ? 'var(--color-accent)' : 'var(--color-text-muted)'}
          />
        ))}
        <span className="text-sm ml-1" style={{ color: 'var(--color-text-secondary)' }}>
          ({rating}/5)
        </span>
      </div>
    )
  }

  useEffect(() => {
    loadWeeklyPicks()
  }, [currentWeek])

  // Keyboard navigation for presentation mode
  useEffect(() => {
    if (!presentationMode?.isOpen) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPresentationMode(null)
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextSlide()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        previousSlide()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [presentationMode])

  // Presentation navigation functions
  const nextSlide = () => {
    if (!presentationMode) return
    const totalSlides = presentationMode.userGroup.picks.length
    const nextIndex = (presentationMode.currentSlide + 1) % totalSlides
    setPresentationMode({ ...presentationMode, currentSlide: nextIndex })
  }

  const previousSlide = () => {
    if (!presentationMode) return
    const totalSlides = presentationMode.userGroup.picks.length
    const prevIndex = presentationMode.currentSlide === 0 
      ? totalSlides - 1 
      : presentationMode.currentSlide - 1
    setPresentationMode({ ...presentationMode, currentSlide: prevIndex })
  }

  const goToSlide = (index: number) => {
    if (!presentationMode) return
    setPresentationMode({ ...presentationMode, currentSlide: index })
  }

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

  // Group picks by user
  const groupPicksByUser = (picks: Pick[]) => {
    const grouped = picks.reduce((acc, pick) => {
      const userId = pick.userId
      if (!acc[userId]) {
        acc[userId] = {
          userFirstName: pick.userFirstName || 'Anonymous User',
          userId: userId,
          picks: []
        }
      }
      acc[userId].picks.push(pick)
      return acc
    }, {} as Record<string, { userFirstName: string; userId: string; picks: Pick[] }>)

    // Convert to array and sort by user name
    return Object.values(grouped).sort((a, b) => 
      a.userFirstName.localeCompare(b.userFirstName)
    )
  }

  const getPicksByCategory = (categoryId: string) => {
    // Handle the combined Movies & TV category
    if (categoryId === 'movies-tv') {
      return picks.filter(pick => 
        pick.category === 'movies-tv' || 
        pick.category === 'movies' || 
        pick.category === 'tv'
      )
    }
    return picks.filter(pick => pick.category === categoryId)
  }

  const getUniquePeople = () => {
    const peopleMap = new Map()
    picks.forEach(pick => {
      if (!peopleMap.has(pick.userId)) {
        peopleMap.set(pick.userId, {
          userId: pick.userId,
          userFirstName: pick.userFirstName || 'Anonymous User',
          pickCount: 0
        })
      }
      peopleMap.get(pick.userId).pickCount++
    })
    return Array.from(peopleMap.values()).sort((a, b) => 
      a.userFirstName.localeCompare(b.userFirstName)
    )
  }

  // Apply both category and person filters
  let filteredPicks = picks
  if (selectedCategory) {
    // Handle the combined Movies & TV category
    if (selectedCategory === 'movies-tv') {
      filteredPicks = filteredPicks.filter(pick => 
        pick.category === 'movies-tv' || 
        pick.category === 'movies' || 
        pick.category === 'tv'
      )
    } else {
      filteredPicks = filteredPicks.filter(pick => pick.category === selectedCategory)
    }
  }
  if (selectedPerson) {
    filteredPicks = filteredPicks.filter(pick => pick.userId === selectedPerson)
  }

  const groupedPicks = groupPicksByUser(filteredPicks)
  const uniquePeople = getUniquePeople()

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
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
          Community Picks
        </h3>
        <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
          Week of {currentWeek}
        </p>
        <div className="mt-4 mx-auto w-24 h-1 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></div>
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

      {/* Person Filter */}
      {uniquePeople.length > 1 && (
        <div className="space-y-2">
          <p className="text-center text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Filter by Person
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => setSelectedPerson(null)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedPerson === null ? 'active' : ''
              }`}
              style={{
                backgroundColor: selectedPerson === null ? 'var(--color-accent)' : 'var(--color-bg)',
                color: selectedPerson === null ? 'white' : 'var(--color-text-secondary)',
                border: `1px solid ${selectedPerson === null ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}
            >
              <User size={16} />
              Everyone ({filteredPicks.length})
            </button>
            
            {uniquePeople.map((person) => {
              const isSelected = selectedPerson === person.userId
              // Calculate how many picks this person has that match current category filter
              let personPickCount = person.pickCount
              if (selectedCategory) {
                personPickCount = picks.filter(pick => 
                  pick.userId === person.userId && pick.category === selectedCategory
                ).length
              }
              
              return (
                <button
                  key={person.userId}
                  onClick={() => setSelectedPerson(person.userId)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isSelected ? 'active' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-bg)',
                    color: isSelected ? 'white' : 'var(--color-text-secondary)',
                    border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  }}
                  disabled={personPickCount === 0}
                >
                  <User size={16} />
                  {person.userFirstName} ({personPickCount})
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Picks Display */}
      {filteredPicks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            {(() => {
              if (selectedCategory && selectedPerson) {
                const categoryLabel = categories.find(c => c.id === selectedCategory)?.label.toLowerCase()
                const personName = uniquePeople.find(p => p.userId === selectedPerson)?.userFirstName
                return `No ${categoryLabel} picks from ${personName} this week.`
              } else if (selectedCategory) {
                const categoryLabel = categories.find(c => c.id === selectedCategory)?.label.toLowerCase()
                return `No ${categoryLabel} picks this week yet.`
              } else if (selectedPerson) {
                const personName = uniquePeople.find(p => p.userId === selectedPerson)?.userFirstName
                return `No picks from ${personName} this week yet.`
              } else {
                return 'No picks shared this week yet. Be the first to share!'
              }
            })()}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedPicks.map((userGroup) => (
            <div key={userGroup.userId} className="space-y-4">
              {/* User Header */}
              <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '2px solid var(--color-border)' }}>
                <div 
                  className="p-2 rounded-full"
                  style={{ 
                    backgroundColor: 'var(--color-accent-bg)',
                    color: 'var(--color-accent)'
                  }}
                >
                  <User size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                    {userGroup.userFirstName}
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {userGroup.picks.length} pick{userGroup.picks.length !== 1 ? 's' : ''} this week
                  </p>
                </div>
                {/* Presentation Mode Button */}
                <button
                  onClick={() => setPresentationMode({ isOpen: true, userGroup, currentSlide: 0 })}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-accent)'
                    e.currentTarget.style.color = 'white'
                    e.currentTarget.style.borderColor = 'var(--color-accent)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg)'
                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                  }}
                  title={`Present ${userGroup.userFirstName}'s picks`}
                >
                  <Presentation size={16} />
                  <span className="text-sm font-medium">Present</span>
                </button>
              </div>

              {/* User's Picks */}
              <div className="space-y-4 ml-6">
                {userGroup.picks.map((pick) => {
                  const categoryData = categories.find(c => c.id === pick.category)
                  const Icon = categoryData?.icon || MoreHorizontal
                  
                  return (
                    <div key={pick.id} className="card p-5">
                      {/* Pick Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ 
                            backgroundColor: 'var(--color-accent-bg)',
                            color: 'var(--color-accent)'
                          }}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                              {categoryData?.label}
                            </span>
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
                                  className={`object-cover rounded-lg ${preview.isImage ? 'w-20 h-20' : 'w-16 h-16'}`}
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
                                
                                {/* Display rating and review for IMDB content */}
                                {preview.rating && preview.rating > 0 && (
                                  <div className="mt-2">
                                    <StarDisplay rating={preview.rating} />
                                  </div>
                                )}
                                {preview.review && (
                                  <div className="mt-2 p-2 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                      Review:
                                    </p>
                                    <p className="text-sm italic" style={{ color: 'var(--color-text)' }}>
                                      "{preview.review}"
                                    </p>
                                  </div>
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
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Presentation Mode Lightbox */}
      {presentationMode?.isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
          onClick={() => setPresentationMode(null)}
        >
          <div 
            className="w-full h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Presentation Header */}
            <div className="flex items-center justify-between p-6" style={{ backgroundColor: 'var(--color-bg)' }}>
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                  {presentationMode.userGroup.userFirstName}'s Picks
                </h2>
                <span className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                  Week of {currentWeek}
                </span>
              </div>
              
              {/* Slide Counter */}
              <div className="flex items-center gap-4">
                <span className="text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {presentationMode.currentSlide + 1} / {presentationMode.userGroup.picks.length}
                </span>
                <button
                  onClick={() => setPresentationMode(null)}
                  className="p-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-muted)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-warning)'
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                    e.currentTarget.style.color = 'var(--color-text-muted)'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Current Slide Content */}
            <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              {(() => {
                const currentPick = presentationMode.userGroup.picks[presentationMode.currentSlide]
                const categoryData = categories.find(c => c.id === currentPick.category)
                const Icon = categoryData?.icon || MoreHorizontal

                return (
                  <div 
                    className="w-full max-w-4xl p-8 rounded-3xl"
                    style={{ 
                      backgroundColor: 'var(--color-bg)',
                      border: '3px solid var(--color-border)',
                      minHeight: '60vh'
                    }}
                  >
                    {/* Slide Header */}
                    <div className="flex items-center gap-6 mb-8">
                      <div 
                        className="p-4 rounded-2xl"
                        style={{ 
                          backgroundColor: 'var(--color-accent)',
                          color: 'white'
                        }}
                      >
                        <Icon size={32} />
                      </div>
                      <div>
                        <h3 className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                          {categoryData?.label}
                        </h3>
                        <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
                          {currentPick.createdAt.toLocaleDateString()} at {currentPick.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Slide Content */}
                    {currentPick.content && (
                      <div className="mb-8">
                        <p className="text-2xl leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>
                          {currentPick.content}
                        </p>
                      </div>
                    )}

                    {/* Link Previews - Full Slide Format */}
                    {currentPick.linkPreviews.length > 0 && (
                      <div className="space-y-6">
                        {currentPick.linkPreviews.map((preview: LinkPreview, previewIndex: number) => (
                          <div
                            key={previewIndex}
                            className="flex gap-8 p-6 rounded-2xl"
                            style={{ 
                              backgroundColor: 'var(--color-bg-secondary)',
                              border: '2px solid var(--color-border)'
                            }}
                          >
                            {preview.image && (
                              <img
                                src={preview.image}
                                alt={preview.title}
                                className={`object-cover rounded-xl ${preview.isImage ? 'w-48 h-48' : 'w-32 h-32'}`}
                              />
                            )}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h4 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                                {preview.title || 'Link Preview'}
                              </h4>
                              {preview.description && (
                                <p className="text-xl mb-6 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                  {preview.description}
                                </p>
                              )}
                              
                              {/* Display rating and review in presentation mode */}
                              {preview.rating && preview.rating > 0 && (
                                <div className="mb-4">
                                  <div className="flex gap-2 items-center">
                                    {[1, 2, 3, 4, 5].map((starValue) => (
                                      <Star
                                        key={starValue}
                                        size={24}
                                        fill={starValue <= preview.rating! ? 'var(--color-accent)' : 'none'}
                                        color={starValue <= preview.rating! ? 'var(--color-accent)' : 'var(--color-text-muted)'}
                                      />
                                    ))}
                                    <span className="text-xl ml-2" style={{ color: 'var(--color-text-secondary)' }}>
                                      ({preview.rating}/5)
                                    </span>
                                  </div>
                                </div>
                              )}
                              {preview.review && (
                                <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                                  <p className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                    Review:
                                  </p>
                                  <p className="text-xl italic leading-relaxed" style={{ color: 'var(--color-text)' }}>
                                    "{preview.review}"
                                  </p>
                                </div>
                              )}
                              
                              {!preview.isImage && (
                                <a
                                  href={preview.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-lg transition-colors self-start"
                                  style={{ 
                                    backgroundColor: 'var(--color-accent)',
                                    color: 'white'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                  <ExternalLink size={20} />
                                  Visit Link
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between p-6" style={{ backgroundColor: 'var(--color-bg)' }}>
              {/* Previous Button */}
              <button
                onClick={previousSlide}
                className="flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text)',
                  border: '2px solid var(--color-border)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent)'
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.borderColor = 'var(--color-accent)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                  e.currentTarget.style.color = 'var(--color-text)'
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              {/* Slide Dots */}
              <div className="flex items-center gap-2">
                {presentationMode.userGroup.picks.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className="w-3 h-3 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: index === presentationMode.currentSlide 
                        ? 'var(--color-accent)' 
                        : 'var(--color-border)',
                      transform: index === presentationMode.currentSlide ? 'scale(1.2)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={nextSlide}
                className="flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white',
                  border: '2px solid var(--color-accent)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="text-center pb-4">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Use ← → arrow keys or spacebar to navigate • ESC to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 