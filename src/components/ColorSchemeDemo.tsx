import React from 'react'
import { useTheme, type ColorScheme } from '../context/ThemeContext'
import { Palette, Check } from 'lucide-react'

export const ColorSchemeDemo: React.FC = () => {
  const { colorScheme, setColorScheme, isDark } = useTheme()

  const schemes: Array<{
    value: ColorScheme
    name: string
    description: string
    preview: {
      bg: string
      bgSecondary: string
      text: string
      accent: string
      border: string
    }
  }> = [
    {
      value: 'github',
      name: 'GitHub',
      description: 'Clean and professional, inspired by GitHub\'s interface',
      preview: {
        bg: isDark ? '#0d1117' : '#ffffff',
        bgSecondary: isDark ? '#161b22' : '#f6f8fa',
        text: isDark ? '#f0f6fc' : '#24292f',
        accent: isDark ? '#2f81f7' : '#0969da',
        border: isDark ? '#30363d' : '#d0d7de',
      }
    },
    {
      value: 'vscode',
      name: 'Bubble Glass',
      description: 'Iridescent bubble-like glass with subtle gradients and reflections',
      preview: {
        bg: isDark ? 'linear-gradient(135deg, #0a0612 0%, #1a0f2e 100%)' : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 245, 255, 0.8) 100%)',
        bgSecondary: isDark ? 'linear-gradient(135deg, #0f0a1a 0%, #1f1435 100%)' : 'linear-gradient(135deg, rgba(240, 248, 255, 0.85) 0%, rgba(245, 240, 255, 0.75) 100%)',
        text: isDark ? '#e2e8f0' : '#2d1b69',
        accent: isDark ? '#a78bfa' : '#8b5cf6',
        border: isDark ? 'rgba(124, 58, 237, 0.3)' : 'rgba(139, 92, 246, 0.3)',
      }
    },
    {
      value: 'minimal',
      name: 'Desert',
      description: 'Warm desert tones with peaceful, indie vibes',
      preview: {
        bg: isDark ? '#1a1612' : '#fefcf7',
        bgSecondary: isDark ? '#2a241f' : '#f7f3ed',
        text: isDark ? '#f7f1e8' : '#3d2914',
        accent: isDark ? '#d4a574' : '#c19a6b',
        border: isDark ? '#4a3f36' : '#e6d7c3',
      }
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Palette size={24} style={{ color: 'var(--color-accent)' }} />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            Choose Your Color Scheme
          </h2>
        </div>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Select a color scheme that matches your preference and improves readability
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {schemes.map((scheme) => (
          <div
            key={scheme.value}
            className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 ${
              colorScheme === scheme.value ? 'ring-2' : ''
            }`}
            style={{
              borderColor: colorScheme === scheme.value ? scheme.preview.accent : scheme.preview.border,
            } as React.CSSProperties}
            onClick={() => setColorScheme(scheme.value)}
          >
            {/* Preview */}
            <div className="p-4 rounded-t-lg" style={{ backgroundColor: scheme.preview.bg }}>
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="h-3 w-20 rounded" style={{ backgroundColor: scheme.preview.text }} />
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: scheme.preview.accent }} />
                </div>
                
                {/* Content */}
                <div className="space-y-2">
                  <div className="h-2 w-full rounded" style={{ backgroundColor: scheme.preview.bgSecondary }} />
                  <div className="h-2 w-3/4 rounded" style={{ backgroundColor: scheme.preview.bgSecondary }} />
                  <div className="h-2 w-1/2 rounded" style={{ backgroundColor: scheme.preview.bgSecondary }} />
                </div>
                
                {/* Button */}
                <div className="flex justify-end">
                  <div 
                    className="h-6 w-16 rounded text-xs flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: scheme.preview.accent }}
                  >
                    Button
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 border-t" style={{ 
              backgroundColor: 'var(--color-bg)',
              borderColor: 'var(--color-border)'
            }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                    {scheme.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {scheme.description}
                  </p>
                </div>
                {colorScheme === scheme.value && (
                  <div 
                    className="flex items-center justify-center w-6 h-6 rounded-full"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  >
                    <Check size={16} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          You can change the color scheme anytime from the sidebar settings
        </p>
      </div>
    </div>
  )
} 