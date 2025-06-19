import React from 'react'

interface LogoIconProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

export const LogoIcon: React.FC<LogoIconProps> = ({ size = 40, className = '', style }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Frog main body - circular */}
      <circle
        cx="50"
        cy="50"
        r="25"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Spots on body */}
      <circle cx="45" cy="45" r="2" fill="currentColor" />
      <circle cx="55" cy="42" r="1.5" fill="currentColor" />
      <circle cx="42" cy="55" r="1.5" fill="currentColor" />
      <circle cx="58" cy="55" r="2" fill="currentColor" />
      <circle cx="50" cy="60" r="1.5" fill="currentColor" />
      
      {/* Front legs */}
      <path
        d="M30 65 L20 70 L15 75"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      <path
        d="M35 70 L25 75 L20 80"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Back legs */}
      <path
        d="M70 65 L80 70 L85 75"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      <path
        d="M65 70 L75 75 L80 80"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Dragonfly/Fly */}
      <g transform="translate(80, 20)">
        {/* Fly body */}
        <ellipse 
          cx="0" 
          cy="0" 
          rx="1.5" 
          ry="4" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        />
        
        {/* Fly wings */}
        <ellipse 
          cx="-3" 
          cy="-1" 
          rx="2.5" 
          ry="1" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1"
        />
        <ellipse 
          cx="3" 
          cy="-1" 
          rx="2.5" 
          ry="1" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1"
        />
        <ellipse 
          cx="-2.5" 
          cy="1" 
          rx="2" 
          ry="0.8" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1"
        />
        <ellipse 
          cx="2.5" 
          cy="1" 
          rx="2" 
          ry="0.8" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1"
        />
        
        {/* Fly head */}
        <circle 
          cx="0" 
          cy="-5" 
          r="1.5" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
        />
      </g>
    </svg>
  )
} 