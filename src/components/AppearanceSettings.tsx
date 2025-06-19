import React from 'react'
import { useTheme, type GradientOption } from '../context/ThemeContext'
import { ColorSchemeDemo } from './ColorSchemeDemo'
import { Palette, Check } from 'lucide-react'

export const AppearanceSettings: React.FC = () => {
  const { fontFamily, setFontFamily, isDark, customGradient, setCustomGradient } = useTheme()

  const fontOptions = [
    { value: 'font-inter', label: 'Inter', description: 'Clean and modern' },
    { value: 'font-poppins', label: 'Poppins', description: 'Friendly and geometric' },
    { value: 'font-space-grotesk', label: 'Space Grotesk', description: 'Futuristic and bold' },
    { value: 'font-lexend-deca', label: 'Lexend Deca', description: 'Optimized for enhanced readability' },
  ]

  const gradientOptions: GradientOption[] = [
    {
      id: 'ocean',
      name: 'Ocean Breeze',
      description: 'Calming blue to turquoise gradient (Default)',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      darkGradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      textColor: '#ffffff',
      darkTextColor: '#e2e8f0',
      accentColor: '#3b82f6'
    },
    {
      id: 'aurora',
      name: 'Aurora Borealis',
      description: 'Mystical green to blue gradient',
      gradient: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
      darkGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      textColor: '#ffffff',
      darkTextColor: '#f1f5f9',
      accentColor: '#06b6d4'
    },
    {
      id: 'forest',
      name: 'Light Green Meadow',
      description: 'Fresh light green gradient with natural tones',
      gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 25%, #a7f3d0 75%, #6ee7b7 100%)',
      darkGradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 25%, #047857 75%, #059669 100%)',
      textColor: '#ffffff',
      darkTextColor: '#ecfdf5',
      accentColor: '#10b981'
    },
    {
      id: 'sunset',
      name: 'Sunset Glow',
      description: 'Warm orange to pink gradient',
      gradient: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
      darkGradient: 'linear-gradient(135deg, #be185d 0%, #e11d48 100%)',
      textColor: '#ffffff',
      darkTextColor: '#f8fafc',
      accentColor: '#f97316'
    },
    {
      id: 'emerald',
      name: 'Emerald Garden',
      description: 'Deep emerald to mint green gradient',
      gradient: 'linear-gradient(135deg, #50c878 0%, #98fb98 50%, #90ee90 100%)',
      darkGradient: 'linear-gradient(135deg, #1f2937 0%, #047857 50%, #065f46 100%)',
      textColor: '#ffffff',
      darkTextColor: '#ecfdf5',
      accentColor: '#059669'
    },
    {
      id: 'cosmic',
      name: 'Cosmic Purple',
      description: 'Deep purple to violet gradient',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      darkGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      textColor: '#ffffff',
      darkTextColor: '#e0e7ff',
      accentColor: '#8b5cf6'
    },
    {
      id: 'rose',
      name: 'Rose Garden',
      description: 'Soft pink to lavender gradient',
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      darkGradient: 'linear-gradient(135deg, #881337 0%, #be185d 100%)',
      textColor: '#7c2d12',
      darkTextColor: '#fce7f3',
      accentColor: '#ec4899'
    },
    {
      id: 'cyber',
      name: 'Cyber Neon',
      description: 'Futuristic cyan to electric blue',
      gradient: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
      darkGradient: 'linear-gradient(135deg, #0c4a6e 0%, #075985 100%)',
      textColor: '#ffffff',
      darkTextColor: '#f0f9ff',
      accentColor: '#0891b2'
    },
    {
      id: 'fire',
      name: 'Phoenix Fire',
      description: 'Intense red to orange gradient',
      gradient: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
      darkGradient: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
      textColor: '#ffffff',
      darkTextColor: '#fef2f2',
      accentColor: '#dc2626'
    }
  ]

  const handleGradientSelect = (gradient: GradientOption) => {
    setCustomGradient(gradient)
  }

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

          {/* Gradient Color Selection */}
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Palette size={24} style={{ color: 'var(--color-accent)' }} />
                <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                  Background Gradients
                </h3>
              </div>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Choose a beautiful gradient background or stick with the default theme colors
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
                Each gradient includes a matching primary color for buttons and highlights
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {gradientOptions.map((option) => (
                <div
                  key={option.id}
                  className={`relative cursor-pointer rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                    customGradient?.id === option.id ? 'ring-2 ring-opacity-50' : ''
                  }`}
                  style={{
                    borderColor: customGradient?.id === option.id ? 'var(--color-accent)' : 'var(--color-border)',
                  }}
                  onClick={() => handleGradientSelect(option)}
                >
                  {/* Gradient Preview */}
                  <div 
                    className="h-24 rounded-t-lg flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: isDark && option.darkGradient 
                        ? option.darkGradient 
                        : option.gradient
                    }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                    
                    {/* Sample content */}
                    <div className="flex flex-col items-center space-y-2">
                      <div 
                        className="w-8 h-2 rounded opacity-80"
                        style={{ 
                          backgroundColor: isDark && option.darkTextColor 
                            ? option.darkTextColor 
                            : option.textColor 
                        }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white/50"
                        style={{ backgroundColor: option.accentColor }}
                        title={`Primary color: ${option.accentColor}`}
                      />
                      <div className="text-xs font-medium text-white/80">
                        Primary
                      </div>
                    </div>

                    {/* Selected indicator */}
                    {customGradient?.id === option.id && (
                      <div className="absolute top-2 right-2">
                        <div 
                          className="flex items-center justify-center w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm"
                        >
                          <Check size={14} style={{ color: 'var(--color-accent)' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3" style={{ 
                    backgroundColor: 'var(--color-bg)',
                    borderTop: '1px solid var(--color-border)'
                  }}>
                    <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                      {option.name}
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-4">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Gradients adapt to light and dark modes automatically
              </p>
            </div>
          </div>

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