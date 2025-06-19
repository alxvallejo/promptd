import React from 'react'
import { WeeklyGallery } from './WeeklyGallery'
import type { User } from '@supabase/supabase-js'

interface PastPicsProps {
  currentUser?: User | null
  onDeletePick?: (pickId: string) => void
  onToggleFullscreen?: () => void
  isFullscreen?: boolean
}

export const PastPics: React.FC<PastPicsProps> = ({ 
  currentUser, 
  onDeletePick, 
  onToggleFullscreen, 
  isFullscreen 
}) => {
  return (
    <WeeklyGallery
      currentUser={currentUser}
      onDeletePick={onDeletePick}
      onToggleFullscreen={onToggleFullscreen}
      isFullscreen={isFullscreen}
    />
  )
} 