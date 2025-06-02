interface LinkPreviewData {
  url: string
  title?: string
  description?: string
  image?: string
}

// For general link previews, we'll use a simple meta tag scraper
// In production, you might want to use a service like linkpreview.net or implement server-side scraping
export const fetchGeneralLinkPreview = async (url: string): Promise<LinkPreviewData> => {
  try {
    // First, try to extract basic info from common video/social platforms
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return await fetchYouTubePreview(url)
    }
    
    if (url.includes('netflix.com')) {
      return {
        url,
        title: 'Netflix Content',
        description: 'Watch on Netflix',
        image: 'https://via.placeholder.com/300x200/e50914/ffffff?text=Netflix'
      }
    }
    
    // For other URLs, we'll create a basic preview
    // In a real app, you'd use a proper link preview service
    const domain = new URL(url).hostname.replace('www.', '')
    
    return {
      url,
      title: `Link Preview - ${domain}`,
      description: `Content from ${domain}`,
      image: `https://via.placeholder.com/300x200/6366f1/ffffff?text=${encodeURIComponent(domain)}`
    }
  } catch (error) {
    console.error('Error fetching general link preview:', error)
    return {
      url,
      title: 'Link Preview',
      description: 'Unable to load preview',
      image: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Link'
    }
  }
}

const fetchYouTubePreview = async (url: string): Promise<LinkPreviewData> => {
  try {
    // Extract video ID from various YouTube URL formats
    const videoId = extractYouTubeVideoId(url)
    
    if (videoId) {
      // Use YouTube's oembed API for basic info
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      
      const response = await fetch(oembedUrl)
      if (response.ok) {
        const data = await response.json()
        return {
          url,
          title: data.title || 'YouTube Video',
          description: `By ${data.author_name || 'Unknown'} on YouTube`,
          image: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        }
      }
    }
    
    return {
      url,
      title: 'YouTube Video',
      description: 'Watch on YouTube',
      image: 'https://via.placeholder.com/300x200/ff0000/ffffff?text=YouTube'
    }
  } catch (error) {
    console.error('Error fetching YouTube preview:', error)
    return {
      url,
      title: 'YouTube Video',
      description: 'Watch on YouTube',
      image: 'https://via.placeholder.com/300x200/ff0000/ffffff?text=YouTube'
    }
  }
}

const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
} 