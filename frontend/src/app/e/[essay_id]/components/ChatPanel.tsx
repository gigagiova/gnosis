'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { ArrowUpIcon } from 'lucide-react'
import { Message, MessageRole } from '@gnosis/models'
import { messageService } from '@/services/messageService'
import { essayService } from '@/services/essayService'
import { RenderMessageContent } from './DiffRenderer'

interface ChatPanelProps {
  essayId: string
  setEssay: React.Dispatch<React.SetStateAction<string>>
}

export default function ChatPanel({ essayId, setEssay }: ChatPanelProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messageCountRef = useRef(0) // Tracks the message count to detect new messages
  const lastScrollPositionRef = useRef(0) // Track last scroll position

  // #region useEffect

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const essay = await essayService.getOne(essayId)
        // Only load messages that don't belong to threads
        setMessages(essay.messages || [])
      } catch (error) {
        console.error('Error loading messages:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [essayId])

  // Initialize textarea height
  useEffect(() => {
    if (!textareaRef.current) return
    
    // Reset height to minimum before calculating the scroll height
    textareaRef.current.style.height = '44px'
    
    // Add a small buffer (2px) to prevent scrollbar from appearing
    const scrollHeight = textareaRef.current.scrollHeight
    textareaRef.current.style.height = `${scrollHeight + 2}px`
  }, [message])

  // Reset user scroll state when a completely new message is added
  useEffect(() => {
    // If we have more messages than before, this is a new message (not just an update)
    if (messages.length > messageCountRef.current) {
      setUserHasScrolledUp(false)
      messageCountRef.current = messages.length
    }
  }, [messages])

  // Detect when user manually scrolls up
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current
    if (!messagesContainer) return
    
    // Initialize the last position
    lastScrollPositionRef.current = messagesContainer.scrollTop
    
    // Set flag when user scrolls up during streaming
    const handleScroll = () => {
      if (isStreaming) {
        const currentScrollTop = messagesContainer.scrollTop
        
        // If current position is less than last position, user scrolled UP
        if (currentScrollTop < lastScrollPositionRef.current) setUserHasScrolledUp(true)

        // Update last position for next comparison
        lastScrollPositionRef.current = currentScrollTop
      }
    }
    
    messagesContainer.addEventListener('scroll', handleScroll)
    return () => messagesContainer.removeEventListener('scroll', handleScroll)
  }, [isStreaming])

  // Scroll to bottom when messages update - but respect user scrolling during streaming
  useEffect(() => {
    console.log('userHasScrolledUp', userHasScrolledUp)
    if (!userHasScrolledUp) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, userHasScrolledUp])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || isStreaming) return

    try {
      setIsStreaming(true)
      // Reset the scroll state when submitting a new message
      setUserHasScrolledUp(false)
      setMessage('') // Clear input early

      // Start streaming response with callback
      await messageService.create({
        essayId,
        content: message.trim(),
        setMessages,
        setEssay
      })
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsStreaming(false)
    }
  }

  // #endregion useEffect

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check if it's Enter key and not Shift/Ctrl/Cmd + Enter
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault() // Prevent default newline
      handleSubmit(e)
    }
    // Allow new line with Ctrl/Cmd + Enter
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      setMessage(prev => prev + '\n')
    }
  }

  const isSubmitDisabled = useMemo(() => !message.trim() || isStreaming, [message, isStreaming])

  return (
    <div className="h-full w-full flex flex-col">
      {/* Messages area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 space-y-4"
      >
        <div className="max-w-[600px] mx-auto w-full space-y-4 py-4">
          {isLoading ? (
            <div className="text-center text-neutral-500">Loading messages...</div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`${
                  msg.role === MessageRole.user ? 'ml-auto text-right ml-8' : 'text-left mr-8'
                } ${ index === messages.length - 1 ? 'pb-[100%]' : ''}`}
              >
                <p 
                  className={`text-sm inline-block px-4 py-2 rounded-lg ${
                    msg.role === MessageRole.user ? 'bg-neutral-800 text-neutral-200' : ''
                  }`}
                >
                  {msg.role === MessageRole.assistant ? (
                    <RenderMessageContent content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
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
              onKeyDown={handleKeyDown}
              placeholder="Reach Gnosis..."
              className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-800 pl-4 pr-11 py-3 
              text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:outline-none focus:ring-0
              h-[44px] min-h-[44px] max-h-[200px] leading-[1.5] text-[13px] overflow-hidden"
              disabled={isStreaming}
            />
            <button
              type="submit"
              className="absolute right-2 top-[8px] flex items-center justify-center h-7 w-7 rounded-md 
              bg-neutral-100 disabled:opacity-30 disabled:hover:bg-neutral-700
              transition-all duration-150 group"
              disabled={isSubmitDisabled}
              onClick={handleSubmit}
            >
              <ArrowUpIcon 
                size={15} 
                className="text-neutral-900 transition-colors"
                strokeWidth={2.5}
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 