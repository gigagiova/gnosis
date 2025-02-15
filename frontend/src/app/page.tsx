import React from 'react'
import { redirect } from 'next/navigation'
import { essayService } from '@services/api'
import type { Essay } from '@gnosis/models'
import { EssayCard, CreateNewCard } from '@/src/components/EssayCard'

// Since this is a Server Component, we need to fetch data server-side
async function getEssays(): Promise<Essay[]> {
  return essayService.getAll()
}

async function createEssay() {
  'use server'
  const essay = await essayService.create('')
  redirect(`/e/${essay.id}`)
}

export default async function HomePage() {
  const essays = await getEssays()

  return (
    <main className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Essays Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CreateNewCard onCreate={createEssay} />
          {essays.map((essay: Essay) => (
            <EssayCard key={essay.id} essay={essay} />
          ))}
        </div>
      </div>
    </main>
  )
} 