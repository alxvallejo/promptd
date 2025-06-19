import React, { useState } from 'react'
import { Bookmark, X, Smartphone, Monitor, Chrome, Globe } from 'lucide-react'

interface BookmarkButtonProps {
  className?: string
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({ className = '' }) => {
  const [showModal, setShowModal] = useState(false)

  const detectBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('chrome')) return 'chrome'
    if (userAgent.includes('firefox')) return 'firefox'
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari'
    if (userAgent.includes('edge')) return 'edge'
    return 'other'
  }

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  const browser = detectBrowser()
  const mobile = isMobile()

  const getInstructions = () => {
    if (mobile) {
      return {
        title: "Add to Home Screen",
        steps: [
          "Tap the Share button in your browser",
          "Select 'Add to Home Screen'",
          "Tap 'Add' to confirm"
        ],
        icon: <Smartphone size={24} />
      }
    }

    switch (browser) {
      case 'chrome':
        return {
          title: "Bookmark in Chrome",
          steps: [
            "Press Ctrl+D (or Cmd+D on Mac)",
            "Or click the star icon in the address bar",
            "Choose your bookmark folder and click 'Done'"
          ],
          icon: <Chrome size={24} />
        }
      case 'firefox':
        return {
          title: "Bookmark in Firefox",
          steps: [
            "Press Ctrl+D (or Cmd+D on Mac)",
            "Or click the star icon in the address bar",
            "Edit the name and choose a folder if desired"
          ],
          icon: <Globe size={24} />
        }
      case 'safari':
        return {
          title: "Bookmark in Safari",
          steps: [
            "Press Cmd+D",
            "Or go to Bookmarks > Add Bookmark",
            "Choose where to save and click 'Add'"
          ],
          icon: <Globe size={24} />
        }
      default:
        return {
          title: "Bookmark This Site",
          steps: [
            "Press Ctrl+D (or Cmd+D on Mac)",
            "Or look for a star icon in your browser",
            "Save to your bookmarks or favorites"
          ],
          icon: <Monitor size={24} />
        }
    }
  }

  const instructions = getInstructions()

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${className}`}
        style={{
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
          e.currentTarget.style.color = 'var(--color-text)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-bg)'
          e.currentTarget.style.color = 'var(--color-text-secondary)'
        }}
        title="Bookmark this site"
      >
        <Bookmark size={16} />
        <span className="text-sm">Bookmark</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="max-w-md w-full p-6 rounded-xl shadow-xl"
            style={{ backgroundColor: 'var(--color-bg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {instructions.icon}
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                  {instructions.title}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-text)'
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-muted)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {instructions.steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div 
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ 
                      backgroundColor: 'var(--color-accent)',
                      color: 'white'
                    }}
                  >
                    {index + 1}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>

            {mobile && (
              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  💡 <strong>Tip:</strong> Adding to your home screen makes Prompt-D feel like a native app!
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white'
                }}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 