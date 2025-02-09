'use client'

import React, { useState } from 'react'

interface EssayEditorProps {
  initialContent: string
  onSave: (content: string) => Promise<void>
}

const EssayEditor: React.FC<EssayEditorProps> = ({ initialContent, onSave }) => {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(content)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <textarea
        className="w-full h-96 p-4 bg-gray-900 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          const target = e.currentTarget as HTMLTextAreaElement
          setContent(target.value)
        }}
        placeholder="Write your essay in markdown..."
      />
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default EssayEditor 