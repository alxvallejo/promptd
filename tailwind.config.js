/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'dm-sans': ['DM Sans', 'sans-serif'],
        'crimson-text': ['Crimson Text', 'serif'],
        'libre-baskerville': ['Libre Baskerville', 'serif'],
        'cormorant': ['Cormorant Garamond', 'serif'],
      },
      colors: {
        // GitHub-inspired theme
        github: {
          light: {
            bg: '#ffffff',
            'bg-secondary': '#f6f8fa',
            'bg-tertiary': '#f1f3f4',
            text: '#24292f',
            'text-secondary': '#656d76',
            'text-muted': '#8b949e',
            border: '#d0d7de',
            'border-muted': '#e1e4e8',
            accent: '#0969da',
            'accent-hover': '#0860ca',
            'accent-bg': '#dbeafe',
            success: '#1a7f37',
            warning: '#d1242f',
          },
          dark: {
            bg: '#0d1117',
            'bg-secondary': '#161b22',
            'bg-tertiary': '#21262d',
            text: '#f0f6fc',
            'text-secondary': '#8b949e',
            'text-muted': '#6e7681',
            border: '#30363d',
            'border-muted': '#21262d',
            accent: '#2f81f7',
            'accent-hover': '#388bfd',
            'accent-bg': '#1f2937',
            success: '#3fb950',
            warning: '#f85149',
          }
        },
        // VS Code-inspired theme
        vscode: {
          light: {
            bg: '#ffffff',
            'bg-secondary': '#f3f3f3',
            'bg-tertiary': '#ebebeb',
            text: '#333333',
            'text-secondary': '#616161',
            'text-muted': '#8e8e8e',
            border: '#e5e5e5',
            'border-muted': '#f0f0f0',
            accent: '#007acc',
            'accent-hover': '#005a9e',
            'accent-bg': '#e7f3ff',
            success: '#28a745',
            warning: '#dc3545',
          },
          dark: {
            bg: '#1e1e1e',
            'bg-secondary': '#252526',
            'bg-tertiary': '#2d2d30',
            text: '#cccccc',
            'text-secondary': '#9d9d9d',
            'text-muted': '#6a6a6a',
            border: '#3e3e42',
            'border-muted': '#2d2d30',
            accent: '#0e639c',
            'accent-hover': '#1177bb',
            'accent-bg': '#094771',
            success: '#89d185',
            warning: '#f48771',
          }
        },
        // Desert minimal theme
        minimal: {
          light: {
            bg: '#fefcf7',
            'bg-secondary': '#f7f3ed',
            'bg-tertiary': '#f0eae0',
            text: '#3d2914',
            'text-secondary': '#8b6f47',
            'text-muted': '#a68961',
            border: '#e6d7c3',
            'border-muted': '#f0e6d6',
            accent: '#c19a6b',
            'accent-hover': '#a67c52',
            'accent-bg': '#f5efe6',
            success: '#8fb069',
            warning: '#d4a574',
          },
          dark: {
            bg: '#1a1612',
            'bg-secondary': '#2a241f',
            'bg-tertiary': '#3a332c',
            text: '#f7f1e8',
            'text-secondary': '#d4c4a8',
            'text-muted': '#a89980',
            border: '#4a3f36',
            'border-muted': '#2a241f',
            accent: '#d4a574',
            'accent-hover': '#e8b886',
            'accent-bg': '#3d2f1f',
            success: '#a3c47a',
            warning: '#e8b886',
          }
        }
      }
    },
  },
  plugins: [],
}