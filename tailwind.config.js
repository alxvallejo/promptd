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
        // Modern minimal theme
        minimal: {
          light: {
            bg: '#fefefe',
            'bg-secondary': '#f8f9fa',
            'bg-tertiary': '#f1f3f4',
            text: '#1a1a1a',
            'text-secondary': '#4a5568',
            'text-muted': '#718096',
            border: '#e2e8f0',
            'border-muted': '#edf2f7',
            accent: '#667eea',
            'accent-hover': '#5a67d8',
            'accent-bg': '#eef2ff',
            success: '#48bb78',
            warning: '#ed8936',
          },
          dark: {
            bg: '#0f0f0f',
            'bg-secondary': '#1a1a1a',
            'bg-tertiary': '#262626',
            text: '#f7fafc',
            'text-secondary': '#a0aec0',
            'text-muted': '#718096',
            border: '#2d3748',
            'border-muted': '#1a202c',
            accent: '#7c3aed',
            'accent-hover': '#8b5cf6',
            'accent-bg': '#2d1b69',
            success: '#68d391',
            warning: '#f6ad55',
          }
        }
      }
    },
  },
  plugins: [],
}