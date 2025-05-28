import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { ColorSchemeDemo } from './ColorSchemeDemo'

export const AppearanceSettings: React.FC = () => {
  const { fontFamily, setFontFamily } = useTheme()

  const fontOptions = [
    { value: 'font-inter', label: 'Inter' },
    { value: 'font-poppins', label: 'Poppins' },
    { value: 'font-space-grotesk', label: 'Space Grotesk' },
    { value: 'font-dm-sans', label: 'DM Sans' },
  ]

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full max-w-4xl p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            Appearance Settings
          </h2>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Customize your Prompt.d experience
          </p>
        </div>

        {/* Color Scheme Demo */}
        <ColorSchemeDemo />

        {/* Font Family Setting */}
        <div className="mt-8 pt-6 max-w-md mx-auto" style={{ borderTop: '1px solid var(--color-border)' }}>
          <label className="text-lg font-medium mb-4 block text-center" style={{ color: 'var(--color-text)' }}>
            Font Family
          </label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="input-field w-full text-base"
          >
            {fontOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Changes are saved automatically and will persist across sessions
          </p>
        </div>
      </div>
    </div>
  )
} 