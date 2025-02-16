import { z } from 'zod'
import { Message } from './message.model'

export interface Thread {
  id: string
  essay_id: string
  start_index: number
  end_index: number
  created_at: Date
  closed_at: Date | null
  messages: Message[]
}

export const createThreadSchema = z.object({
  essay_id: z.string(),
  start_index: z.number().int(),
  end_index: z.number().int()
})

export type CreateThreadDto = z.infer<typeof createThreadSchema>
