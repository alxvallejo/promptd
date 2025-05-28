import React from 'react'
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

export const Auth: React.FC = () => {
  const { isDark } = useTheme()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Prompt.d
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your personal prompt journal
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-100 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-200 p-8">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: isDark ? 'rgba(129, 140, 248, 0.8)' : 'rgba(99, 102, 241, 0.8)',
                    brandAccent: isDark ? 'rgba(129, 140, 248, 0.9)' : 'rgba(99, 102, 241, 0.9)',
                    brandButtonText: 'white',
                    defaultButtonBackground: isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(241, 245, 249, 0.9)',
                    defaultButtonBackgroundHover: isDark ? 'rgba(71, 85, 105, 0.9)' : 'rgba(226, 232, 240, 0.9)',
                    defaultButtonBorder: isDark ? 'rgba(71, 85, 105, 0.9)' : 'rgba(203, 213, 225, 0.9)',
                    defaultButtonText: isDark ? 'rgba(241, 245, 249, 1)' : 'rgba(51, 65, 85, 1)',
                    dividerBackground: isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.5)',
                    inputBackground: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(248, 250, 252, 0.8)',
                    inputBorder: isDark ? 'rgba(71, 85, 105, 0.9)' : 'rgba(203, 213, 225, 0.9)',
                    inputBorderHover: isDark ? 'rgba(129, 140, 248, 0.6)' : 'rgba(99, 102, 241, 0.6)',
                    inputBorderFocus: isDark ? 'rgba(129, 140, 248, 0.8)' : 'rgba(99, 102, 241, 0.8)',
                    inputText: isDark ? 'rgba(241, 245, 249, 1)' : 'rgba(51, 65, 85, 1)',
                    inputLabelText: isDark ? 'rgba(203, 213, 225, 1)' : 'rgba(71, 85, 105, 1)',
                    inputPlaceholder: isDark ? 'rgba(148, 163, 184, 1)' : 'rgba(148, 163, 184, 1)',
                    messageText: isDark ? 'rgba(241, 245, 249, 1)' : 'rgba(51, 65, 85, 1)',
                    messageTextDanger: isDark ? 'rgba(248, 113, 113, 1)' : 'rgba(239, 68, 68, 1)',
                    anchorTextColor: isDark ? 'rgba(129, 140, 248, 0.8)' : 'rgba(99, 102, 241, 0.8)',
                    anchorTextHoverColor: isDark ? 'rgba(129, 140, 248, 0.9)' : 'rgba(99, 102, 241, 0.9)',
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