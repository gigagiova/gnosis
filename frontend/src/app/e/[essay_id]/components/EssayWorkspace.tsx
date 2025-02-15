'use client'

import React, { useCallback, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from './Header'
import EssayEditor from './EssayEditor'
import ChatPanel from './ChatPanel'

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
  const [editorWidth, setEditorWidth] = useState(65)
  const isDraggingRef = useRef(false)

  // Handle mouse down on the resizer
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRef.current = true
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Handle mouse move while dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return

    const container = document.getElementById('workspace-container')
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

    // Constrain the width between 20% and 80%
    const constrainedWidth = Math.min(Math.max(newWidth, 20), 80)
    setEditorWidth(constrainedWidth)
  }, [])

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove])

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      if (contentTimeoutRef.current) {
        clearTimeout(contentTimeoutRef.current)
      }
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current)
      }
    }
  }, [handleMouseMove, handleMouseUp])

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

  return (
    <div id="workspace-container" className="min-h-screen flex w-full select-none neutral-900">
      <div 
        className="h-screen overflow-y-auto mr-0 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-500/40 [&::-webkit-scrollbar-thumb:hover]:bg-gray-500/60 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:m-1"
        style={{ width: `${editorWidth}%` }}
      >
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

      {/* Draggable resizer */}
      <div
        className="w-[4px] bg-transparent hover:bg-blue-500 cursor-col-resize transition-all duration-150"
        onMouseDown={handleMouseDown}
      />

      <div 
        className="border-l border-neutral-700 h-screen"
        style={{ width: `${100 - editorWidth}%` }}
      >
        <ChatPanel />
      </div>
    </div>
  )
} 