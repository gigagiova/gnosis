'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { ArrowUpIcon } from 'lucide-react'
import { Message, MessageRole } from '@gnosis/models'
import { messageService } from '@/services/messageService'
import { essayService } from '@/services/essayService'

interface ChatPanelProps {
  essayId: string
}

export default function ChatPanel({ essayId }: ChatPanelProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    textareaRef.current.style.height = '44px'
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
  }, [message])

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || isStreaming) return

    try {
      setIsStreaming(true)
      const userContent = message.trim()
      setMessage('') // Clear input early

      // Start streaming response with callback
      await messageService.create({
        essayId,
        content: userContent,
        onMessageUpdate: (updatedMessages) => setMessages(updatedMessages)
      })
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsStreaming(false)
    }
  }

  // #endregion useEffect

  const isSubmitDisabled = useMemo(() => !message.trim() || isStreaming, [message, isStreaming])

  return (
    <div className="h-full w-full flex flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        <div className="max-w-[600px] mx-auto w-full space-y-4 py-4">
          {isLoading ? (
            <div className="text-center text-neutral-500">Loading messages...</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-lg ${
                  msg.role === MessageRole.user
                    ? 'bg-neutral-800 ml-auto'
                    : 'bg-neutral-900'
                } ${msg.role === MessageRole.user ? 'ml-12' : 'mr-12'}`}
              >
                <p className="text-sm text-neutral-200">{msg.content}</p>
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
              placeholder="Message Gnosis..."
              className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-800 pl-4 pr-11 py-3 
              text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:outline-none focus:ring-0
              h-[44px] min-h-[44px] max-h-[200px] leading-[1.5] text-[13px]"
              disabled={isStreaming}
            />
            <button
              type="submit"
              className="absolute right-2 top-[8px] flex items-center justify-center h-7 w-7 rounded-md 
              bg-neutral-700 hover:bg-neutral-600 disabled:opacity-30 disabled:hover:bg-neutral-700
              transition-all duration-150 group"
              disabled={isSubmitDisabled}
              onClick={handleSubmit}
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