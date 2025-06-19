import React from 'react'

interface FrogIconProps {
  size?: number
  className?: string
}

export const FrogIcon: React.FC<FrogIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Large frog head with horizontal tongue */}
      <defs>
        <linearGradient id="frogGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'var(--color-accent-dark)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'var(--color-accent)', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Main head - larger, more frog-like */}
      <ellipse 
        cx="18" 
        cy="16" 
        rx="10" 
        ry="8" 
        fill="none" 
        stroke="url(#frogGradient)" 
        strokeWidth="2.5"
      />
      
      {/* Left protruding eye - smaller and more realistic */}
      <circle 
        cx="14" 
        cy="10" 
        r="2.5" 
        fill="none" 
        stroke="url(#frogGradient)" 
        strokeWidth="2"
      />
      
      {/* Right protruding eye - smaller and more realistic */}
      <circle 
        cx="22" 
        cy="10" 
        r="2.5" 
        fill="none" 
        stroke="url(#frogGradient)" 
        strokeWidth="2"
      />
      
      {/* Left eye pupil - smaller */}
      <circle 
        cx="13.5" 
        cy="9.5" 
        r="1" 
        fill="url(#frogGradient)"
      />
      
      {/* Right eye pupil - smaller */}
      <circle 
        cx="21.5" 
        cy="9.5" 
        r="1" 
        fill="url(#frogGradient)"
      />
      
      {/* Eye highlights */}
      <circle 
        cx="14" 
        cy="9" 
        r="0.5" 
        fill="var(--color-bg)"
        opacity="0.9"
      />
      <circle 
        cx="22" 
        cy="9" 
        r="0.5" 
        fill="var(--color-bg)"
        opacity="0.9"
      />
      
      {/* Tongue - extending horizontally to the left */}
      <path 
        d="M 8 16 L 2 16" 
        fill="none" 
        stroke="url(#frogGradient)" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      
      {/* Tongue tip - circular end */}
      <circle 
        cx="2" 
        cy="16" 
        r="1" 
        fill="none" 
        stroke="url(#frogGradient)" 
        strokeWidth="2"
      />
      
      {/* Fly - positioned at tongue tip */}
      <circle 
        cx="1" 
        cy="16" 
        r="0.8" 
        fill="url(#frogGradient)"
      />
      <path 
        d="M 0.2 15.5 L 1.8 15.5 M 0.2 16.5 L 1.8 16.5" 
        stroke="url(#frogGradient)" 
        strokeWidth="0.6" 
        strokeLinecap="round"
        opacity="0.8"
      />
      
      {/* Nostrils - two dots */}
      <circle cx="12" cy="14" r="0.5" fill="url(#frogGradient)" />
      <circle cx="14" cy="14" r="0.5" fill="url(#frogGradient)" />
      
      {/* Mouth opening - where tongue comes from */}
      <path 
        d="M 8 16 C 9 17 11 17 12 16" 
        fill="none" 
        stroke="url(#frogGradient)" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      
      {/* Additional head contour for depth */}
      <path 
        d="M 26 13 C 28 14 29 16 28 18" 
        fill="none" 
        stroke="url(#frogGradient)" 
        strokeWidth="1.5" 
        strokeLinecap="round"
        opacity="0.6"
      />
      
      {/* Chin/jaw line */}
      <path 
        d="M 10 20 C 15 22 20 22 26 20" 
        fill="none" 
        stroke="url(#frogGradient)" 
        strokeWidth="1.5" 
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
} 