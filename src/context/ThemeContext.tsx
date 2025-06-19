import React, { createContext, useContext, useEffect, useState } from 'react'

export type ColorScheme = 'github' | 'vscode' | 'minimal'

export interface GradientOption {
  id: string
  name: string
  description: string
  gradient: string
  darkGradient?: string
  textColor: string
  darkTextColor?: string
  accentColor: string
}

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  fontFamily: string
  setFontFamily: (font: string) => void
  colorScheme: ColorScheme
  setColorScheme: (scheme: ColorScheme) => void
  customGradient: GradientOption | null
  setCustomGradient: (gradient: GradientOption | null) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

const fontClasses = [
  'font-inter',
  'font-poppins', 
  'font-space-grotesk',
  'font-lexend-deca'
]

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem('fontFamily') || 'font-lexend-deca'
  })

  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem('colorScheme') as ColorScheme
    return saved || 'github'
  })

  const [customGradient, setCustomGradient] = useState<GradientOption | null>(() => {
    const saved = localStorage.getItem('customGradient')
    try {
      if (saved) {
        return JSON.parse(saved)
      } else {
        // Set Light Green Meadow as default gradient
        return {
          id: 'forest',
          name: 'Light Green Meadow',
          description: 'Fresh light green gradient with natural tones',
          gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 25%, #a7f3d0 75%, #6ee7b7 100%)',
          darkGradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 25%, #047857 75%, #059669 100%)',
          textColor: '#ffffff',
          darkTextColor: '#ecfdf5',
          accentColor: '#10b981'
        }
      }
    } catch {
      // Fallback to Light Green Meadow if parsing fails
      return {
        id: 'forest',
        name: 'Light Green Meadow',
        description: 'Fresh light green gradient with natural tones',
        gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 25%, #a7f3d0 75%, #6ee7b7 100%)',
        darkGradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 25%, #047857 75%, #059669 100%)',
        textColor: '#ffffff',
        darkTextColor: '#ecfdf5',
        accentColor: '#10b981'
      }
    }
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    const root = window.document.documentElement
    // Remove all font classes
    fontClasses.forEach(fontClass => {
      root.classList.remove(fontClass)
    })
    // Add the selected font class
    root.classList.add(fontFamily)
    localStorage.setItem('fontFamily', fontFamily)
  }, [fontFamily])

  useEffect(() => {
    // Remove all color scheme classes
    const root = window.document.documentElement
    root.classList.remove('theme-github', 'theme-vscode', 'theme-minimal')
    // Add the selected color scheme class
    root.classList.add(`theme-${colorScheme}`)
    localStorage.setItem('colorScheme', colorScheme)
  }, [colorScheme])

  useEffect(() => {
    if (customGradient) {
      localStorage.setItem('customGradient', JSON.stringify(customGradient))
      
      // Apply custom gradient to body background
      if (customGradient.gradient !== 'none') {
        const gradient = isDark && customGradient.darkGradient 
          ? customGradient.darkGradient 
          : customGradient.gradient
        
        document.body.style.background = gradient
        document.body.style.backgroundAttachment = 'fixed'
        
        // Update CSS custom properties for text colors if provided
        const root = document.documentElement
        if (customGradient.textColor) {
          const textColor = isDark && customGradient.darkTextColor 
            ? customGradient.darkTextColor 
            : customGradient.textColor
          root.style.setProperty('--gradient-text-color', textColor)
        }
        
        // Update accent colors to match the gradient
        if (customGradient.accentColor) {
          root.style.setProperty('--color-accent', customGradient.accentColor)
          
          // Generate complementary accent colors based on the main accent color
          const accentColor = customGradient.accentColor
          
          // Create hover and dark variants
          if (accentColor.startsWith('#')) {
            // Convert hex to RGB for manipulation
            const hex = accentColor.slice(1)
            const r = parseInt(hex.substr(0, 2), 16)
            const g = parseInt(hex.substr(2, 2), 16)
            const b = parseInt(hex.substr(4, 2), 16)
            
            // Create darker version for hover (reduce brightness by 20%)
            const hoverR = Math.max(0, Math.floor(r * 0.8))
            const hoverG = Math.max(0, Math.floor(g * 0.8))
            const hoverB = Math.max(0, Math.floor(b * 0.8))
            const hoverColor = `#${hoverR.toString(16).padStart(2, '0')}${hoverG.toString(16).padStart(2, '0')}${hoverB.toString(16).padStart(2, '0')}`
            
            // Create even darker version for accent-dark (reduce brightness by 40%)
            const darkR = Math.max(0, Math.floor(r * 0.6))
            const darkG = Math.max(0, Math.floor(g * 0.6))
            const darkB = Math.max(0, Math.floor(b * 0.6))
            const darkColor = `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`
            
            // Create light background version (very light with transparency)
            const bgColor = `rgba(${r}, ${g}, ${b}, 0.15)`
            
            // Apply the generated colors
            root.style.setProperty('--color-accent-hover', hoverColor)
            root.style.setProperty('--color-accent-dark', darkColor)
            root.style.setProperty('--color-accent-bg', bgColor)
            
            // Update RGB versions for transparency calculations
            root.style.setProperty('--color-accent-rgb', `${r}, ${g}, ${b}`)
            root.style.setProperty('--color-accent-hover-rgb', `${hoverR}, ${hoverG}, ${hoverB}`)
            root.style.setProperty('--color-accent-dark-rgb', `${darkR}, ${darkG}, ${darkB}`)
          }
        }
      } else {
        // "Default" option selected - reset to theme defaults
        document.body.style.background = ''
        document.body.style.backgroundAttachment = ''
        const root = document.documentElement
        root.style.removeProperty('--gradient-text-color')
        root.style.removeProperty('--color-accent')
        root.style.removeProperty('--color-accent-hover')
        root.style.removeProperty('--color-accent-dark')
        root.style.removeProperty('--color-accent-bg')
        root.style.removeProperty('--color-accent-rgb')
        root.style.removeProperty('--color-accent-hover-rgb')
        root.style.removeProperty('--color-accent-dark-rgb')
      }
    } else {
      // No gradient selected - reset everything to defaults
      localStorage.removeItem('customGradient')
      document.body.style.background = ''
      document.body.style.backgroundAttachment = ''
      const root = document.documentElement
      root.style.removeProperty('--gradient-text-color')
      root.style.removeProperty('--color-accent')
      root.style.removeProperty('--color-accent-hover')
      root.style.removeProperty('--color-accent-dark')
      root.style.removeProperty('--color-accent-bg')
      root.style.removeProperty('--color-accent-rgb')
      root.style.removeProperty('--color-accent-hover-rgb')
      root.style.removeProperty('--color-accent-dark-rgb')
    }
  }, [customGradient, isDark])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const value = {
    isDark,
    toggleTheme,
    fontFamily,
    setFontFamily,
    colorScheme,
    setColorScheme,
    customGradient,
    setCustomGradient,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}