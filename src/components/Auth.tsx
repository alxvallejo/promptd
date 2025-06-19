import React from 'react'
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'


export const Auth: React.FC = () => {
  const { isDark } = useTheme()

  // Get CSS custom property values
  const getCustomProperty = (property: string) => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(property).trim()
    }
    return ''
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mb-6">
            <img 
              src="/logo_transparent.png" 
              alt="Prompt-D Logo" 
              className="mx-auto w-24 h-24 object-contain mb-4"
            />
            <h1 className="text-4xl font-bold gradient-text">
              Prompt.d
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Your personal prompt journal
          </p>
        </div>
        
        <div className="card rounded-2xl shadow-lg p-8">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: getCustomProperty('--color-accent') || (isDark ? 'rgba(129, 140, 248, 0.8)' : 'rgba(99, 102, 241, 0.8)'),
                    brandAccent: getCustomProperty('--color-accent-hover') || (isDark ? 'rgba(129, 140, 248, 0.9)' : 'rgba(99, 102, 241, 0.9)'),
                    brandButtonText: 'white',
                    defaultButtonBackground: getCustomProperty('--color-bg-secondary') || (isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(241, 245, 249, 0.9)'),
                    defaultButtonBackgroundHover: getCustomProperty('--color-bg-tertiary') || (isDark ? 'rgba(71, 85, 105, 0.9)' : 'rgba(226, 232, 240, 0.9)'),
                    defaultButtonBorder: getCustomProperty('--color-border') || (isDark ? 'rgba(71, 85, 105, 0.9)' : 'rgba(203, 213, 225, 0.9)'),
                    defaultButtonText: getCustomProperty('--color-text') || (isDark ? 'rgba(241, 245, 249, 1)' : 'rgba(51, 65, 85, 1)'),
                    dividerBackground: getCustomProperty('--color-border-muted') || (isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.5)'),
                    inputBackground: getCustomProperty('--color-bg') || (isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(248, 250, 252, 0.8)'),
                    inputBorder: getCustomProperty('--color-border') || (isDark ? 'rgba(71, 85, 105, 0.9)' : 'rgba(203, 213, 225, 0.9)'),
                    inputBorderHover: getCustomProperty('--color-accent') || (isDark ? 'rgba(129, 140, 248, 0.6)' : 'rgba(99, 102, 241, 0.6)'),
                    inputBorderFocus: getCustomProperty('--color-accent') || (isDark ? 'rgba(129, 140, 248, 0.8)' : 'rgba(99, 102, 241, 0.8)'),
                    inputText: getCustomProperty('--color-text') || (isDark ? 'rgba(241, 245, 249, 1)' : 'rgba(51, 65, 85, 1)'),
                    inputLabelText: getCustomProperty('--color-text-secondary') || (isDark ? 'rgba(203, 213, 225, 1)' : 'rgba(71, 85, 105, 1)'),
                    inputPlaceholder: getCustomProperty('--color-text-muted') || (isDark ? 'rgba(148, 163, 184, 1)' : 'rgba(148, 163, 184, 1)'),
                    messageText: getCustomProperty('--color-text') || (isDark ? 'rgba(241, 245, 249, 1)' : 'rgba(51, 65, 85, 1)'),
                    messageTextDanger: getCustomProperty('--color-warning') || (isDark ? 'rgba(248, 113, 113, 1)' : 'rgba(239, 68, 68, 1)'),
                    anchorTextColor: getCustomProperty('--color-accent') || (isDark ? 'rgba(129, 140, 248, 0.8)' : 'rgba(99, 102, 241, 0.8)'),
                    anchorTextHoverColor: getCustomProperty('--color-accent-hover') || (isDark ? 'rgba(129, 140, 248, 0.9)' : 'rgba(99, 102, 241, 0.9)'),
                  },
                  space: {
                    spaceSmall: '4px',
                    spaceMedium: '8px',
                    spaceLarge: '16px',
                    labelBottomMargin: '8px',
                    anchorBottomMargin: '4px',
                    emailInputSpacing: '4px',
                    socialAuthSpacing: '4px',
                    buttonPadding: '10px 15px',
                    inputPadding: '10px 15px',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '14px',
                    baseLabelSize: '14px',
                    baseButtonSize: '14px',
                  },
                  fonts: {
                    bodyFontFamily: `'Inter', sans-serif`,
                    buttonFontFamily: `'Inter', sans-serif`,
                    inputFontFamily: `'Inter', sans-serif`,
                    labelFontFamily: `'Inter', sans-serif`,
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    buttonBorderRadius: '8px',
                    inputBorderRadius: '8px',
                  },
                },
              },
              className: {
                container: 'space-y-4',
                button: 'transition-all duration-200',
                input: 'transition-all duration-200',
              }
            }}
            providers={['google']}
            redirectTo={window.location.origin}
            onlyThirdPartyProviders
          />
        </div>
      </div>
    </div>
  )
}