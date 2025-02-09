import React from 'react'
import EssayEditor from '@components/EssayEditor'
import ChatPanel from '@components/ChatPanel'
import { essayService } from '@services/api'

async function getEssay(id: string) {
  return essayService.getOne(id)
}

async function updateEssay(id: string, contents: string) {
  'use server'
  return essayService.update(id, contents)
}

export default async function EssayPage({ params }: { params: { essay_id: string } }) {
  const essay = await getEssay(params.essay_id)

  return (
    <div className="min-h-screen flex" style={{ background: '#121212', color: '#FFFFFF' }}>
      <div className="w-1/4 border-r border-gray-700 p-4">
        <ChatPanel />
      </div>
      <div className="flex-1 p-4">
        <EssayEditor 
          initialContent={essay.contents}
          onSave={async (contents: string) => {
            'use server'
            await updateEssay(params.essay_id, contents)
          }}
        />
      </div>
    </div>
  )
} 