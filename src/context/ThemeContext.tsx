import React, { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  fontFamily: string
  setFontFamily: (font: string) => void
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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem('fontFamily') || 'font-inter'
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
    root.classList.remove('font-inter', 'font-poppins', 'font-space-grotesk', 'font-dm-sans')
    // Add the selected font class
    root.classList.add(fontFamily)
    localStorage.setItem('fontFamily', fontFamily)
  }, [fontFamily])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const value = {
    isDark,
    toggleTheme,
    fontFamily,
    setFontFamily,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}