import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { ColorSchemeDemo } from './ColorSchemeDemo'

export const AppearanceSettings: React.FC = () => {
  const { fontFamily, setFontFamily } = useTheme()

  const fontOptions = [
    { value: 'font-inter', label: 'Inter', description: 'Clean and modern' },
    { value: 'font-poppins', label: 'Poppins', description: 'Friendly and geometric' },
    { value: 'font-space-grotesk', label: 'Space Grotesk', description: 'Futuristic and bold' },
    { value: 'font-lexend-deca', label: 'Lexend Deca', description: 'Optimized for enhanced readability' },
  ]

  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
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
            <div className="relative">
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="input-field w-full text-base appearance-none cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {fontOptions.map((option) => (
                  <option 
                    key={option.value} 
                    value={option.value}
                    className={option.value}
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      padding: '8px',
                    }}
                  >
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Font Preview */}
            <div className="mt-4 p-4 rounded-lg" style={{ 
              backgroundColor: 'var(--color-bg)', 
              border: '1px solid var(--color-border)' 
            }}>
              <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Preview:
              </p>
              <div className={`${fontFamily} text-lg`} style={{ color: 'var(--color-text)' }}>
                The quick brown fox jumps over the lazy dog
              </div>
              <div className={`${fontFamily} text-sm mt-2`} style={{ color: 'var(--color-text-secondary)' }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz<br />
                0123456789 !@#$%^&*()
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Changes are saved automatically and will persist across sessions
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 