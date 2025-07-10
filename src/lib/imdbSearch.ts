interface IMDBSearchResult {
  Title: string
  Year: string
  imdbID: string
  Type: string
  Poster: string
  Plot?: string
  imdbRating?: string
  Genre?: string
  Director?: string
  Actors?: string
}

interface IMDBLinkPreview {
  url: string
  title: string
  description: string
  image: string
  loading: boolean
  imdbData?: IMDBSearchResult
}

// OMDB API key - read from environment variables
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY

export const createIMDBLinkPreview = (imdbData: IMDBSearchResult): IMDBLinkPreview => {
  const imdbUrl = `https://www.imdb.com/title/${imdbData.imdbID}/`
  
  let description = ''
  if (imdbData.Plot && imdbData.Plot !== 'N/A') {
    description = imdbData.Plot
  } else if (imdbData.Genre && imdbData.Genre !== 'N/A') {
    description = `Genre: ${imdbData.Genre}`
  }
  
  if (imdbData.imdbRating && imdbData.imdbRating !== 'N/A') {
    description += description ? ` • IMDb: ${imdbData.imdbRating}/10` : `IMDb: ${imdbData.imdbRating}/10`
  }
  
  return {
    url: imdbUrl,
    title: `${imdbData.Title} (${imdbData.Year}) - IMDb`,
    description: description || `${imdbData.Type === 'movie' ? 'Movie' : 'TV Series'} from ${imdbData.Year}`,
    image: imdbData.Poster && imdbData.Poster !== 'N/A' ? imdbData.Poster : 'https://via.placeholder.com/300x400/1a1a1a/ffffff?text=No+Poster',
    loading: false,
    imdbData
  }
}

export const extractIMDBId = (url: string): string | null => {
  // Match various IMDB URL formats:
  // https://www.imdb.com/title/tt1234567/
  // https://imdb.com/title/tt1234567
  // https://m.imdb.com/title/tt1234567/
  const imdbRegex = /imdb\.com\/title\/(tt\d+)/i
  const match = url.match(imdbRegex)
  return match ? match[1] : null
}

export const searchIMDBById = async (imdbId: string): Promise<IMDBSearchResult | null> => {
  try {
    const params = new URLSearchParams({
      apikey: OMDB_API_KEY,
      i: imdbId,
      plot: 'short'
    })
    
    const response = await fetch(`https://www.omdbapi.com/?${params}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.Response === 'True') {
      return data as IMDBSearchResult
    } else {
      console.log('IMDB ID search failed:', data.Error)
      return null
    }
  } catch (error) {
    console.error('Error searching IMDB by ID:', error)
    return null
  }
} 