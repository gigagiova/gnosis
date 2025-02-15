// Header component for the essay workspace
'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'

// Types for the saving status
type SavingStatus = 'saved' | 'saving' | 'unsaved'

// Props interface for the component
interface HeaderProps {
  status: SavingStatus
  title: string
  content: string
  onTitleChange: (newTitle: string) => void
}

export const Header: React.FC<HeaderProps> = ({ 
  status, 
  title, 
  content, 
  onTitleChange 
}) => {
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')

  // Function to handle copying content to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopyStatus('copied')
      // Reset status after 2 seconds
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...'
      case 'unsaved':
        return 'Unsaved changes'
      default:
        return ''
    }
  }

  return (
    <div className="flex flex-col">
      {/* Navigation row */}
      <div className="h-10 flex items-center justify-between px-2 py-6 text-xs text-neutral-400">
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="hover:bg-neutral-700/50 p-2 rounded transition-colors flex items-center gap-1.5 text-sm group"
          >
            <svg 
              className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-neutral-300 group-hover:text-white transition-colors font-medium">Essays</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {getStatusText() && (
            <span className="text-xs py-1 px-2 rounded bg-neutral-800/40">
              {getStatusText()}
            </span>
          )}
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="hover:bg-neutral-700/50 p-2 rounded transition-colors flex items-center gap-1.5 text-sm group"
            title="Copy markdown content"
          >
            <svg
              className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <span className="text-neutral-300 group-hover:text-white transition-colors font-medium">
              {copyStatus === 'copied' ? 'Copied!' : 'Copy'}
            </span>
          </button>
        </div>
      </div>

      {/* Title row */}
      <div className="pl-12 py-4">
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          placeholder="Untitled"
          className="text-neutral-100 text-5xl font-bold font-playfair bg-transparent outline-none placeholder-neutral-500 w-full"
        />
      </div>
    </div>
  )
} 