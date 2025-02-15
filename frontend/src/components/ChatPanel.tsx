'use client'

import React, { useState } from 'react'

export default function ChatPanel() {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle message submission
    setMessage('')
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Example messages - replace with your actual messages */}
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-gray-300">Example message 1</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <p className="text-gray-300">Example message 2</p>
        </div>
      </div>

      {/* Message input area - fixed at bottom */}
      <div className="p-4 bg-gray-900">
        <form onSubmit={handleSubmit}>
          <div className="relative flex items-center">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message Gnosis..."
              className="w-full resize-none rounded-2xl border border-gray-700 bg-gray-800 pl-4 pr-12 py-3 text-gray-100 placeholder:text-gray-400 focus:border-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600"
              rows={1}
              style={{
                minHeight: '52px',
                maxHeight: '200px'
              }}
            />
            <button
              type="submit"
              className="absolute right-2 p-1.5 rounded-full bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-40 disabled:hover:bg-gray-600 transition-colors"
              disabled={!message.trim()}
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 20 20"
                className="h-5 w-5 rotate-90"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 