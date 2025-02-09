'use client'

import React, { useCallback, useState, useEffect, useRef } from 'react'
import EssayEditor from '@/src/app/e/[essay_id]/EssayEditor'
import ChatPanel from '@components/ChatPanel'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Types for the saving status
type SavingStatus = 'saved' | 'saving' | 'unsaved'

// Props interface for the component
interface EssayWorkspaceProps {
  initialContent: string
  initialTitle: string
  onSave: (content: string, title: string) => Promise<void>
}

// Header component with back button and save status
const Header: React.FC<{ 
  status: SavingStatus
  title: string
  onTitleChange: (newTitle: string) => void 
}> = ({ status, title, onTitleChange }) => {
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)

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
      <div className="h-10 flex items-center justify-between px-2 py-6 text-xs text-gray-400">
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="hover:bg-gray-700/50 p-2 rounded transition-colors flex items-center gap-1.5 text-sm group"
          >
            <svg 
              className="w-4 h-4 text-gray-400 group-hover:text-gray-200 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-gray-300 group-hover:text-white transition-colors font-medium">Essays</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {getStatusText() && (
            <span className="text-xs py-1 px-2 rounded bg-gray-800/40">
              {getStatusText()}
            </span>
          )}
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
          className="text-gray-100 text-5xl font-bold font-playfair bg-transparent outline-none placeholder-gray-500 w-full"
        />
      </div>
    </div>
  )
}

export default function EssayWorkspace({ initialContent, initialTitle, onSave }: EssayWorkspaceProps) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent)
  const [title, setTitle] = useState(initialTitle)
  const [savingStatus, setSavingStatus] = useState<SavingStatus>('saved')
  const contentTimeoutRef = useRef<NodeJS.Timeout>()
  const titleTimeoutRef = useRef<NodeJS.Timeout>()
  const isSavingRef = useRef(false)

  // Save function that ensures we don't have concurrent saves
  const saveChanges = useCallback(async (newContent: string, newTitle: string) => {
    if (isSavingRef.current) return
    
    isSavingRef.current = true
    setSavingStatus('saving')
    
    try {
      await onSave(newContent, newTitle)
      setSavingStatus('saved')
      // Force a refresh of the page data
      router.refresh()
    } catch (error) {
      console.error('Failed to save:', error)
      setSavingStatus('unsaved')
    } finally {
      isSavingRef.current = false
    }
  }, [onSave, router])

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
    setSavingStatus('unsaved')
    
    if (contentTimeoutRef.current) {
      clearTimeout(contentTimeoutRef.current)
    }

    contentTimeoutRef.current = setTimeout(() => {
      saveChanges(newContent, title)
    }, 500)
  }, [title, saveChanges])

  // Handle title changes
  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle)
    setSavingStatus('unsaved')
    
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current)
    }

    titleTimeoutRef.current = setTimeout(() => {
      saveChanges(content, newTitle)
    }, 500)
  }, [content, saveChanges])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (contentTimeoutRef.current) {
        clearTimeout(contentTimeoutRef.current)
      }
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen flex" style={{ background: '#121212', color: '#FFFFFF' }}>
      <div className="flex-1 max-w-3xl flex flex-col">
        <Header 
          status={savingStatus} 
          title={title}
          onTitleChange={handleTitleChange}
        />
        <div className="flex-1 p-12 pt-0">
          <EssayEditor 
            initialContent={content}
            onChange={handleContentChange}
          />
        </div>
      </div>
      <div className="w-1/3 min-w-[300px] border-l border-gray-700">
        <ChatPanel />
      </div>
    </div>
  )
} 