import React from 'react'
import { WeeklyGallery } from './WeeklyGallery'
import type { User } from '@supabase/supabase-js'

interface PastPicsProps {
  currentUser?: User | null
  onDeletePick?: (pickId: string) => void
}

export const PastPics: React.FC<PastPicsProps> = ({ currentUser, onDeletePick }) => {

  return (
    <WeeklyGallery
      currentUser={currentUser}
      onDeletePick={onDeletePick}
    />
  )
} 