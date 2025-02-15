'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ArrowUpIcon } from 'lucide-react'

export default function ChatPanel() {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle message submission
    setMessage('')
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        <div className="max-w-[600px] mx-auto w-full space-y-4">
        </div>
      </div>

      {/* Message input area - fixed at bottom */}
      <div className="px-2 py-1">
        <form onSubmit={handleSubmit}>
          <div className="relative max-w-[600px] mx-auto">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message Gnosis..."
              className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-800 pl-4 pr-11 py-3 
              text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:outline-none focus:ring-0
              h-[44px] min-h-[44px] max-h-[200px] leading-[1.5] text-[13px]"
            />
            <button
              type="submit"
              className="absolute right-2 top-[8px] flex items-center justify-center h-7 w-7 rounded-md 
              bg-neutral-700 hover:bg-neutral-600 disabled:opacity-30 disabled:hover:bg-neutral-700
              transition-all duration-150 group"
              disabled={!message.trim()}
            >
              <ArrowUpIcon 
                size={15} 
                className="text-neutral-400 group-hover:text-neutral-200 transition-colors"
                strokeWidth={2.5}
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 