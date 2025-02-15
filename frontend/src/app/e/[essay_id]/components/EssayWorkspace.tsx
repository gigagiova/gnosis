'use client'

import React, { useCallback, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from './Header'
import EssayEditor from './EssayEditor'
import ChatPanel from '@components/ChatPanel'

// Types for the saving status
type SavingStatus = 'saved' | 'saving' | 'unsaved'

// Props interface for the component
interface EssayWorkspaceProps {
  initialContent: string
  initialTitle: string
  onSave: (content: string, title: string) => Promise<void>
}

export const EssayWorkspace: React.FC<EssayWorkspaceProps> = ({ 
  initialContent, 
  initialTitle, 
  onSave 
}) => {
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
      <div className="flex-1 max-w-3xl h-screen overflow-y-auto mr-1 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-500/40 [&::-webkit-scrollbar-thumb:hover]:bg-gray-500/60 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:m-1">
        <Header 
          status={savingStatus} 
          title={title}
          content={content}
          onTitleChange={handleTitleChange}
        />
        <div className="p-12 pt-0">
          <EssayEditor 
            initialContent={content}
            onChange={handleContentChange}
          />
        </div>
      </div>
      <div className="w-1/3 min-w-[400px] border-l border-gray-700 h-screen">
        <ChatPanel />
      </div>
    </div>
  )
} 