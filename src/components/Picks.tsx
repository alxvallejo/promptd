import React, { useState, useRef, useEffect } from 'react'
import { Send, Film, Gamepad2, Camera, MoreHorizontal, X, ExternalLink, Star, Eye, Edit3, AlertTriangle } from 'lucide-react'
import { PicksGallery } from './PicksGallery'
import { extractIMDBId, searchIMDBById, createIMDBLinkPreview } from '../lib/imdbSearch'
import { fetchGeneralLinkPreview } from '../lib/linkPreview'
import { uploadImage, createImagePreview, validateDroppedFiles } from '../lib/imageUpload'
import { supabase } from '../lib/supabase'
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
  rating?: number // 1-5 star rating
  review?: string // User's review text
  userTitle?: string // User-provided title for images
  userComment?: string // User-provided comment for images
  exifData?: any // EXIF data extracted from images
}

interface PicksProps {
  onSavePick: (pick: { category: string; content: string; linkPreviews: LinkPreview[]; weekOf: string }) => void
  onDeletePick?: (pickId: string) => void
  currentUser?: User | null
  onToggleFullscreen?: () => void
  isFullscreen?: boolean
}

const categories = [
  { id: 'movies-tv', label: 'Movies & TV', icon: Film, placeholder: 'What movie or TV show are you picking this week? Share a link or describe your choice...' },
  { id: 'games', label: 'Video Games', icon: Gamepad2, placeholder: 'What game are you playing this week? Drop a link or describe your gaming pick...' },
  { id: 'activities', label: 'Pics', icon: Camera, placeholder: 'Share your photos and memories from this week! Drag & drop images or share details...' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, placeholder: 'What else are you picking this week? Share your choice...' },
]

export const Picks: React.FC<PicksProps> = ({ 
  onSavePick, 
  onDeletePick, 
  currentUser,
  onToggleFullscreen,
  isFullscreen
}) => {
  const [selectedCategory, setSelectedCategory] = useState('movies-tv')
  const [inputValue, setInputValue] = useState('')
  const [linkPreviews, setLinkPreviews] = useState<LinkPreview[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false)
  const [previewingImage, setPreviewingImage] = useState<string | null>(null)
  const [userWeeklyPicksCount, setUserWeeklyPicksCount] = useState(0)
  const [weeklyPicksLoading, setWeeklyPicksLoading] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Constants
  const WEEKLY_PICK_LIMIT = 4

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

  // Load user's weekly picks count
  const loadUserWeeklyPicksCount = async () => {
    if (!currentUser) {
      setUserWeeklyPicksCount(0)
      return
    }

    try {
      setWeeklyPicksLoading(true)
      const { data, error } = await supabase
        .from('picks')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('week_of', currentWeek)

      if (error) {
        console.error('Error loading user weekly picks count:', error)
        return
      }

      setUserWeeklyPicksCount(data?.length || 0)
    } catch (error) {
      console.error('Error loading user weekly picks count:', error)
    } finally {
      setWeeklyPicksLoading(false)
    }
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
    // Clear upload errors when switching categories
    setUploadErrors([])
  }, [selectedCategory])

  useEffect(() => {
    loadUserWeeklyPicksCount()
  }, [currentUser, currentWeek, refreshKey])

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

    // Check weekly pick limit
    if (userWeeklyPicksCount >= WEEKLY_PICK_LIMIT) {
      alert(`You've reached your weekly limit of ${WEEKLY_PICK_LIMIT} picks. You can submit more picks next week!`)
      return
    }

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
      // Update weekly picks count immediately
      setUserWeeklyPicksCount(prev => prev + 1)
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

  const updateLinkPreviewRating = (url: string, rating: number) => {
    setLinkPreviews(prev => 
      prev.map(p => p.url === url ? { ...p, rating } : p)
    )
  }

  const updateLinkPreviewReview = (url: string, review: string) => {
    setLinkPreviews(prev => 
      prev.map(p => p.url === url ? { ...p, review } : p)
    )
  }

  const updateImageTitle = (url: string, userTitle: string) => {
    setLinkPreviews(prev => prev.map(preview => 
      preview.url === url && preview.isImage ? { 
        ...preview,
        userTitle,
        title: userTitle.trim() || preview.originalFile?.name || 'Image'
      } : preview
    ))
  }

  const updateImageComment = (url: string, userComment: string) => {
    setLinkPreviews(prev => prev.map(preview => 
      preview.url === url && preview.isImage ? { 
        ...preview,
        userComment
      } : preview
    ))
  }

  const toggleImagePreview = (url: string) => {
    setPreviewingImage(previewingImage === url ? null : url)
  }

  const exitPreviewMode = () => {
    setPreviewingImage(null)
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)
  const isActivitiesCategory = selectedCategory === 'activities'

  // Star Rating Component
  const StarRating: React.FC<{ rating: number; onRatingChange: (rating: number) => void }> = ({ rating, onRatingChange }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            onClick={() => onRatingChange(starValue)}
            className="transition-colors hover:scale-110"
            type="button"
          >
            <Star
              size={20}
              fill={starValue <= rating ? 'var(--color-accent)' : 'none'}
              color={starValue <= rating ? 'var(--color-accent)' : 'var(--color-text-muted)'}
            />
          </button>
        ))}
      </div>
    )
  }

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

      {/* Content Area - Input column left, Community Picks right */}
      <div 
        className={`flex-1 overflow-hidden ${isGalleryExpanded ? 'block' : 'grid grid-cols-2'}`}
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        {/* Left Side - Input Column (50% width) */}
        {!isGalleryExpanded && (
          <div 
            className="border-r flex flex-col"
            style={{ 
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bg)'
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
          {/* Input Column Header */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              Share Your Pick
            </h3>
          </div>

          {/* Input Column Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    {selectedCategoryData && <selectedCategoryData.icon size={24} style={{ color: 'var(--color-accent)' }} />}
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
                          <div className="relative">
                            <img
                              src={preview.image}
                              alt={preview.title}
                              className={`object-cover rounded-lg ${preview.isImage ? 'w-20 h-20' : 'w-16 h-16'}`}
                            />
                            {preview.isImage && (
                              <button
                                onClick={() => toggleImagePreview(preview.url)}
                                className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity"
                                title="Preview image"
                              >
                                <Eye size={16} color="white" />
                              </button>
                            )}
                          </div>
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
                          
                          {/* Image Title and Comment Fields */}
                          {preview.isImage && (
                            <div className="mt-3 space-y-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                              <div>
                                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                  Image Title
                                </label>
                                <input
                                  type="text"
                                  value={preview.userTitle || ''}
                                  onChange={(e) => updateImageTitle(preview.url, e.target.value)}
                                  placeholder="Add a title for this image..."
                                  className="w-full p-2 text-sm rounded border"
                                  style={{ 
                                    backgroundColor: 'var(--color-bg)',
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text)'
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                  Comment
                                </label>
                                <textarea
                                  value={preview.userComment || ''}
                                  onChange={(e) => updateImageComment(preview.url, e.target.value)}
                                  placeholder="Add a comment about this image..."
                                  className="w-full p-2 text-sm rounded border resize-none"
                                  style={{ 
                                    backgroundColor: 'var(--color-bg)',
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text)'
                                  }}
                                  rows={3}
                                />
                              </div>
                              
                              {/* EXIF Data Display */}
                              {preview.exifData && (
                                <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                    Photo Information
                                  </p>
                                  <div className="space-y-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    {preview.exifData.dateTaken && (
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
                                    {preview.exifData.location && (
                                      <div className="flex items-center gap-2">
                                        <span>📍</span>
                                        <span>Location: {preview.description?.split(' • ').find(part => part.includes(',')) || `${preview.exifData.location.latitude.toFixed(4)}, ${preview.exifData.location.longitude.toFixed(4)}`}</span>
                                      </div>
                                    )}
                                    {preview.exifData.camera && (
                                      <div className="flex items-center gap-2">
                                        <span>📷</span>
                                        <span>{[preview.exifData.camera.make, preview.exifData.camera.model].filter(Boolean).join(' ')}</span>
                                      </div>
                                    )}
                                    {preview.exifData.settings && (
                                      <div className="flex items-center gap-2">
                                        <span>⚙️</span>
                                        <span>
                                          {[
                                            preview.exifData.settings.fNumber && `f/${preview.exifData.settings.fNumber}`,
                                            preview.exifData.settings.exposureTime,
                                            preview.exifData.settings.iso && `ISO ${preview.exifData.settings.iso}`,
                                            preview.exifData.settings.focalLength && `${preview.exifData.settings.focalLength}mm`
                                          ].filter(Boolean).join(' • ')}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Rating and Review Fields for all links */}
                          {!preview.isImage && (
                            <div className="mt-3 space-y-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                              <div>
                                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                  Your Rating
                                </label>
                                <StarRating 
                                  rating={preview.rating || 0} 
                                  onRatingChange={(rating) => updateLinkPreviewRating(preview.url, rating)} 
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                  Your Review
                                </label>
                                <textarea
                                  value={preview.review || ''}
                                  onChange={(e) => updateLinkPreviewReview(preview.url, e.target.value)}
                                  placeholder={preview.imdbData ? "What did you think of this movie/show?" : "What did you think about this?"}
                                  className="w-full p-2 text-sm rounded border resize-none"
                                  style={{ 
                                    backgroundColor: 'var(--color-bg)',
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-text)'
                                  }}
                                  rows={3}
                                />
                              </div>
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
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Welcome message when no content */}
            {linkPreviews.length === 0 && !inputValue && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center max-w-sm">
                  <div className="mb-4">
                    {selectedCategoryData && <selectedCategoryData.icon size={48} style={{ color: 'var(--color-accent)', margin: '0 auto' }} />}
                  </div>
                  <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                    {selectedCategoryData?.label} Pick
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Share your weekly {selectedCategoryData?.label.toLowerCase()} pick below
                  </p>
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      💡 <strong>Tip:</strong> {isActivitiesCategory ? 'Drag & drop images or paste URLs for previews!' : 'Paste any URL for automatic link previews!'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Section at Bottom of Column */}
          <div className="p-4 space-y-3 border-t" style={{ 
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg)'
          }}>
            {/* Weekly Picks Limit Message */}
            {currentUser && !weeklyPicksLoading && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                userWeeklyPicksCount >= WEEKLY_PICK_LIMIT 
                  ? 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                  : userWeeklyPicksCount >= WEEKLY_PICK_LIMIT - 1
                  ? 'bg-yellow-50 border border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300'
                  : 'bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
              }`}>
                <AlertTriangle size={16} />
                <span>
                  {userWeeklyPicksCount >= WEEKLY_PICK_LIMIT ? (
                    `You've submitted all ${WEEKLY_PICK_LIMIT} picks for this week. New picks available next week!`
                  ) : userWeeklyPicksCount >= WEEKLY_PICK_LIMIT - 1 ? (
                    `You have ${WEEKLY_PICK_LIMIT - userWeeklyPicksCount} pick remaining this week (${userWeeklyPicksCount}/${WEEKLY_PICK_LIMIT})`
                  ) : (
                    `You have ${WEEKLY_PICK_LIMIT - userWeeklyPicksCount} picks remaining this week (${userWeeklyPicksCount}/${WEEKLY_PICK_LIMIT})`
                  )}
                </span>
              </div>
            )}

            {/* Category Selection */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => {
                const Icon = category.icon
                const isSelected = selectedCategory === category.id
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
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
                    <Icon size={16} />
                    {category.label}
                  </button>
                )
              })}
            </div>

            {/* Input and Send Button */}
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder={selectedCategoryData?.placeholder}
                className="prompt-input flex-1"
                rows={5}
              />
              <button
                onClick={handleSubmit}
                disabled={(!inputValue.trim() && linkPreviews.length === 0) || userWeeklyPicksCount >= WEEKLY_PICK_LIMIT}
                className="btn-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center self-end"
                style={{ minWidth: '48px', height: '48px' }}
                title={userWeeklyPicksCount >= WEEKLY_PICK_LIMIT ? 'Weekly pick limit reached' : 'Submit pick'}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Right Side - Community Gallery (50% width or full width when expanded) */}
        <div className={`overflow-y-auto ${isGalleryExpanded ? 'w-full' : ''}`}>
          <PicksGallery 
            key={refreshKey} 
            currentWeek={currentWeek} 
            currentUser={currentUser}
            onDeletePick={onDeletePick}
            isExpanded={isGalleryExpanded}
            onToggleExpanded={() => setIsGalleryExpanded(!isGalleryExpanded)}
            onToggleFullscreen={onToggleFullscreen}
            isFullscreen={isFullscreen}
          />
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewingImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={exitPreviewMode}
        >
          <div 
            className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {linkPreviews
              .filter(preview => preview.url === previewingImage)
              .map(preview => (
                <div key={preview.url} className="relative w-full h-full max-h-[90vh] flex items-center justify-center">
                  <img
                    src={preview.image}
                    alt={preview.title}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                  
                  {/* Edit button in top right */}
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
                    <X size={20} />
                  </button>

                  {/* Overlaid text content */}
                  {(preview.userTitle || preview.userComment) && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <div className="space-y-3">
                        {preview.userTitle && (
                          <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                            {preview.userTitle}
                          </h3>
                        )}
                        {preview.userComment && (
                          <p className="text-white/90 drop-shadow-lg leading-relaxed text-lg">
                            {preview.userComment}
                          </p>
                        )}
                        
                        {/* EXIF info */}
                        {preview.exifData && (
                          <div className="flex flex-wrap gap-4 text-sm text-white/70 mt-4">
                            {preview.exifData.dateTaken && (
                                                             <span>📅 {
                                 (() => {
                                   const date = preview.exifData.dateTaken instanceof Date 
                                     ? preview.exifData.dateTaken 
                                     : new Date(preview.exifData.dateTaken)
                                   return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                 })()
                               }</span>
                            )}
                            {preview.exifData.location && (
                              <span>📍 {preview.description?.split(' • ').find(part => part.includes(',')) || 'Location'}</span>
                            )}
                            {preview.exifData.camera && (
                              <span>📷 {[preview.exifData.camera.make, preview.exifData.camera.model].filter(Boolean).join(' ')}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Edit mode button */}
                  <button
                    onClick={exitPreviewMode}
                    className="absolute top-4 left-4 p-3 rounded-full backdrop-blur-sm transition-colors"
                    style={{ 
                      backgroundColor: 'rgba(59, 130, 246, 0.6)',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.8)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.6)'
                    }}
                    title="Edit image details"
                  >
                    <Edit3 size={20} />
                  </button>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
} 