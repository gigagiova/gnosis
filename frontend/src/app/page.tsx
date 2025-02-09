import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { essayService, Essay } from '@services/api'

// Since this is a Server Component, we need to fetch data server-side
async function getEssays(): Promise<Essay[]> {
  return essayService.getAll()
}

async function createEssay(formData: FormData) {
  'use server'
  
  const title = formData.get('title') as string
  if (!title) throw new Error('Title is required')
  
  const essay = await essayService.create(title)
  redirect(`/e/${essay.id}`)
}

export default async function HomePage() {
  const essays = await getEssays()

  return (
    <div className="min-h-screen p-8" style={{ background: '#121212', color: '#FFFFFF' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Essays</h1>
        
        <div className="mb-8">
          <form action={createEssay} className="flex gap-4">
            <input
              type="text"
              name="title"
              required
              className="flex-1 p-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter essay title..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Create Essay
            </button>
          </form>
        </div>
        
        <div className="grid gap-4">
          {essays.map((essay: Essay) => (
            <Link 
              key={essay.id} 
              href={`/e/${essay.id}`}
              className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">{essay.title}</h2>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Created: {new Date(essay.created_at).toLocaleDateString()}</span>
                <span>Updated: {new Date(essay.updated_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 