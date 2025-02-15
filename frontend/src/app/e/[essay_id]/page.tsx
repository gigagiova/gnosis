import React from 'react'
import { essayService } from '@services/api'
import { EssayWorkspace } from './components/EssayWorkspace'
import { revalidatePath } from 'next/cache'

// Disable all data caching
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Function to fetch essay data
async function getEssay(id: string) {
  const timestamp = Date.now()
  const response = await fetch(`${API_URL}/essays/${id}?t=${timestamp}`, {
    next: { tags: ['essay'] },
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
  if (!response.ok) throw new Error('Essay not found')
  const data = await response.json()
  return data
}

// Function to update essay data
async function updateEssay(id: string, contents: string, title: string) {
  'use server'
  await essayService.update(id, contents, title)
  // Force a full page refresh after update
  revalidatePath(`/e/${id}`)
}

// Main page component
export default async function EssayPage({ 
  params,
  searchParams 
}: { 
  params: { essay_id: string }
  searchParams: { t?: string }
}) {
  const essay = await getEssay(params.essay_id)

  return (
    <EssayWorkspace 
      initialContent={essay.contents}
      initialTitle={essay.title}
      onSave={async (contents: string, title: string) => {
        'use server'
        await updateEssay(params.essay_id, contents, title)
      }}
    />
  )
} 