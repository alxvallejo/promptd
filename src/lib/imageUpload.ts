import { supabase } from './supabase'
import imageCompression from 'browser-image-compression'
import exifr from 'exifr'

export interface ImageUploadResult {
  url: string
  path: string
  error?: string
}

export interface ExifData {
  dateTaken?: Date
  location?: {
    latitude: number
    longitude: number
    altitude?: number
  }
  camera?: {
    make?: string
    model?: string
  }
  settings?: {
    iso?: number
    fNumber?: number
    exposureTime?: string
    focalLength?: number
  }
}

export interface ImagePreview {
  url: string
  title: string
  description: string
  image: string
  loading: boolean
  isImage: true
  originalFile?: File
  compressedFile?: File
  userTitle?: string
  userComment?: string
  exifData?: ExifData
}

// Extract EXIF data from image file
const extractExifData = async (file: File): Promise<ExifData | null> => {
  try {
    const exifData = await exifr.parse(file, {
      gps: true,
      pick: [
        'DateTimeOriginal',
        'CreateDate', 
        'DateTime',
        'GPSLatitude',
        'GPSLongitude', 
        'GPSAltitude',
        'Make',
        'Model',
        'ISO',
        'FNumber',
        'ExposureTime',
        'FocalLength'
      ]
    })

    if (!exifData) return null

    const result: ExifData = {}

    // Extract date taken
    const dateTaken = exifData.DateTimeOriginal || exifData.CreateDate || exifData.DateTime
    if (dateTaken) {
      result.dateTaken = new Date(dateTaken)
    }

    // Extract GPS location
    if (exifData.GPSLatitude && exifData.GPSLongitude) {
      result.location = {
        latitude: exifData.GPSLatitude,
        longitude: exifData.GPSLongitude,
        altitude: exifData.GPSAltitude
      }
    }

    // Extract camera info
    if (exifData.Make || exifData.Model) {
      result.camera = {
        make: exifData.Make,
        model: exifData.Model
      }
    }

    // Extract camera settings
    if (exifData.ISO || exifData.FNumber || exifData.ExposureTime || exifData.FocalLength) {
      result.settings = {
        iso: exifData.ISO,
        fNumber: exifData.FNumber,
        exposureTime: exifData.ExposureTime ? `1/${Math.round(1 / exifData.ExposureTime)}s` : undefined,
        focalLength: exifData.FocalLength
      }
    }

    return Object.keys(result).length > 0 ? result : null
  } catch (error) {
    console.log('Could not extract EXIF data:', error)
    return null
  }
}

// Format location for display
const formatLocation = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Use reverse geocoding to get readable location
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
    if (response.ok) {
      const data = await response.json()
      if (data.city && data.countryName) {
        return `${data.city}, ${data.countryName}`
      } else if (data.locality && data.countryName) {
        return `${data.locality}, ${data.countryName}`
      } else if (data.countryName) {
        return data.countryName
      }
    }
  } catch (error) {
    console.log('Could not reverse geocode location:', error)
  }
  
  // Fallback to coordinates
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
}

// Compress image to ensure it's under 2MB
const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 2, // Maximum file size in MB
    maxWidthOrHeight: 1920, // Maximum width or height
    useWebWorker: true,
    fileType: 'image/jpeg' as const, // Convert to JPEG for better compression
    initialQuality: 0.8 // Initial quality (0.1 to 1)
  }

  try {
    // If file is already under 2MB and is a supported format, return as-is
    if (file.size <= 2 * 1024 * 1024 && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')) {
      return file
    }

    const compressedFile = await imageCompression(file, options)
    
    // If compression didn't reduce the size enough, try with lower quality
    if (compressedFile.size > 2 * 1024 * 1024) {
      const aggressiveOptions = {
        ...options,
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1440,
        initialQuality: 0.6
      }
      return await imageCompression(file, aggressiveOptions)
    }
    
    return compressedFile
  } catch (error) {
    console.error('Error compressing image:', error)
    throw new Error('Failed to compress image')
  }
}

// Upload image to Supabase Storage
export const uploadImage = async (file: File, userId: string): Promise<ImageUploadResult> => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Compress image before upload
    const compressedFile = await compressImage(file)

    // Generate unique filename with .jpg extension since we convert to JPEG
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`
    const filePath = `picks/${userId}/${fileName}`

    // Upload compressed file
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg'
      })

    if (error) {
      console.error('Upload error:', error)
      throw new Error(error.message)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path)

    return {
      url: urlData.publicUrl,
      path: data.path
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Failed to upload image'
    }
  }
}

// Delete image from Supabase Storage
export const deleteImage = async (path: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting image:', error)
    return false
  }
}

// Create image preview object with EXIF data
export const createImagePreview = async (file: File, url: string): Promise<ImagePreview> => {
  try {
    // Compress the image for preview
    const compressedFile = await compressImage(file)
    
    // Extract EXIF data
    const exifData = await extractExifData(file) || undefined
    
    // Build description with EXIF info
    let description = `Image • ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`
    
    if (exifData?.dateTaken) {
      description += ` • ${exifData.dateTaken.toLocaleDateString()}`
    }
    
    if (exifData?.location) {
      const locationStr = await formatLocation(exifData.location.latitude, exifData.location.longitude)
      description += ` • ${locationStr}`
    }
    
    return {
      url,
      title: file.name,
      description,
      image: url,
      loading: false,
      isImage: true,
      originalFile: file,
      compressedFile,
      exifData
    }
  } catch (error) {
    // Fallback to original file if compression fails
    return {
      url,
      title: file.name,
      description: `Image • ${formatFileSize(file.size)}`,
      image: url,
      loading: false,
      isImage: true,
      originalFile: file
    }
  }
}

// Update image preview with user inputs
export const updateImagePreview = (preview: ImagePreview, userTitle: string, userComment: string): ImagePreview => {
  return {
    ...preview,
    userTitle: userTitle.trim() || undefined,
    userComment: userComment.trim() || undefined,
    title: userTitle.trim() || preview.originalFile?.name || 'Image'
  }
}

// Format file size helper
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Validate dropped files
export const validateDroppedFiles = (files: File[]): { valid: File[], errors: string[] } => {
  const valid: File[] = []
  const errors: string[] = []

  files.forEach(file => {
    if (!file.type.startsWith('image/')) {
      errors.push(`${file.name} is not an image file`)
      return
    }

    // Allow larger original files since we'll compress them
    const maxSize = 50 * 1024 * 1024 // 50MB original file limit
    if (file.size > maxSize) {
      errors.push(`${file.name} is too large (max 50MB before compression)`)
      return
    }

    valid.push(file)
  })

  return { valid, errors }
} 