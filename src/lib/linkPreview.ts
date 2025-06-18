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
    
    // Add Steam support
    if (url.includes('store.steampowered.com')) {
      return await fetchSteamPreview(url)
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

const fetchSteamPreview = async (url: string): Promise<LinkPreviewData> => {
  try {
    // Extract Steam app ID and game name from URL
    const appIdMatch = url.match(/\/app\/(\d+)\/([^\/]+)/)
    
    if (appIdMatch) {
      const appId = appIdMatch[1]
      const gameSlug = appIdMatch[2]
      
      // Convert slug to readable name
      const gameName = gameSlug
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      // Try using a CORS proxy for Steam API
      try {
        const corsProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://store.steampowered.com/api/appdetails?appids=${appId}&format=json`)}`
        
        const response = await fetch(corsProxyUrl)
        if (response.ok) {
          const proxyData = await response.json()
          const steamData = JSON.parse(proxyData.contents)
          const appData = steamData[appId]
          
          if (appData && appData.success && appData.data) {
            const gameData = appData.data
            return {
              url,
              title: gameData.name || gameName,
              description: gameData.short_description || `${gameData.genres?.map((g: any) => g.description).join(', ') || 'Game'} on Steam`,
              image: gameData.header_image || `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
            }
          }
        }
      } catch (apiError) {
        console.log('Steam API via proxy failed, using enhanced fallback:', apiError)
      }
      
      // Enhanced fallback with game name and proper Steam image
      return {
        url,
        title: gameName,
        description: `Available on Steam`,
        image: `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
      }
    }
    
    // Basic fallback for Steam links without proper format
    return {
      url,
      title: 'Steam Game',
      description: 'Available on Steam',
      image: 'https://via.placeholder.com/300x200/1b2838/ffffff?text=Steam'
    }
  } catch (error) {
    console.error('Error fetching Steam preview:', error)
    return {
      url,
      title: 'Steam Game',
      description: 'Available on Steam',
      image: 'https://via.placeholder.com/300x200/1b2838/ffffff?text=Steam'
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