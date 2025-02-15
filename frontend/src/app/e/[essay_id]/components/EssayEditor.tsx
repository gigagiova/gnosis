'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TurndownService from 'turndown'
import { marked } from 'marked'

// Initialize turndown service for markdown conversion
const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
})

// Props interface for the component
interface EssayEditorProps {
  initialContent: string
  onChange?: (content: string) => void
  onSave?: (content: string) => Promise<void>
}

const EssayEditor: React.FC<EssayEditorProps> = ({ 
  initialContent, 
  onChange,
  onSave 
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Placeholder.configure({
        placeholder: 'Start writing...'
      })
    ],
    content: marked(initialContent),
    editorProps: {
      attributes: {
        class: 'focus:outline-none text-gray-200'
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const markdown = turndown.turndown(html)
      onChange?.(markdown)
    },
    immediatelyRender: false
  })

  return (
    <div className="h-full overflow-hidden">
      <EditorContent 
        editor={editor} 
        className="h-full overflow-y-auto px-1 [&_.ProseMirror]:h-full [&_.ProseMirror]:px-0 [&_.ProseMirror]:leading-relaxed
          [&_.ProseMirror>p]:my-2
          [&_.ProseMirror>h1]:text-3xl [&_.ProseMirror>h1]:font-bold [&_.ProseMirror>h1]:mt-6 [&_.ProseMirror>h1]:mb-3 [&_.ProseMirror>h1]:font-playfair
          [&_.ProseMirror>h2]:text-2xl [&_.ProseMirror>h2]:font-bold [&_.ProseMirror>h2]:mt-5 [&_.ProseMirror>h2]:mb-3 [&_.ProseMirror>h2]:font-playfair
          [&_.ProseMirror>h3]:text-xl [&_.ProseMirror>h3]:font-bold [&_.ProseMirror>h3]:mt-4 [&_.ProseMirror>h3]:mb-2 [&_.ProseMirror>h3]:font-playfair
          [&_.ProseMirror>ul]:list-disc [&_.ProseMirror>ul]:pl-5 [&_.ProseMirror>ul]:my-3 [&_.ProseMirror>ul>li]:my-1
          [&_.ProseMirror>ol]:list-decimal [&_.ProseMirror>ol]:pl-5 [&_.ProseMirror>ol]:my-3 [&_.ProseMirror>ol>li]:my-1"
      />
    </div>
  )
}

export default EssayEditor 