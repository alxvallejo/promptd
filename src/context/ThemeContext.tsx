import React, { createContext, useContext, useEffect, useState } from 'react'

export type ColorScheme = 'github' | 'vscode' | 'minimal'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  fontFamily: string
  setFontFamily: (font: string) => void
  colorScheme: ColorScheme
  setColorScheme: (scheme: ColorScheme) => void
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
  'font-dm-sans',
  'font-jetbrains-mono',
  'font-fira-code',
  'font-source-serif',
  'font-playfair',
  'font-merriweather',
  'font-lato',
  'font-montserrat',
  'font-roboto-slab'
]

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem('fontFamily') || 'font-inter'
  })

  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem('colorScheme') as ColorScheme
    return saved || 'github'
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
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}