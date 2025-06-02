import { supabase } from './supabase'
import imageCompression from 'browser-image-compression'

export interface ImageUploadResult {
  url: string
  path: string
  error?: string
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

// Create image preview object
export const createImagePreview = async (file: File, url: string): Promise<ImagePreview> => {
  try {
    // Compress the image for preview
    const compressedFile = await compressImage(file)
    
    return {
      url,
      title: file.name,
      description: `Image • ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`,
      image: url,
      loading: false,
      isImage: true,
      originalFile: file,
      compressedFile
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