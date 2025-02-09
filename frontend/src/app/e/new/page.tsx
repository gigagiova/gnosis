import React from 'react'
import { redirect } from 'next/navigation'
import { essayService } from '@services/api'

async function createEssay(formData: FormData) {
  'use server'
  
  const title = formData.get('title') as string
  if (!title) throw new Error('Title is required')
  
  const essay = await essayService.create(title)
  redirect(`/e/${essay.id}`)
}

export default function NewEssayPage() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      <form action={createEssay}>
        <input
          type="text"
          name="title"
          autoFocus
          required
          className="w-full text-4xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50"
          placeholder="Untitled Essay"
        />
        <p className="mt-4 text-muted-foreground text-sm">
          Press Enter to create your essay and start writing
        </p>
      </form>
    </main>
  )
} 