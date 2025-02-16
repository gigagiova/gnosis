import { z } from 'zod'

export enum MessageRole {
  user = 'user',
  assistant = 'assistant'
}

export interface Message {
  id: string
  essay_id: string
  thread_id?: string | null
  content: string
  role: MessageRole
  created_at: Date
}

export const createMessageSchema = z.object({
  essay_id: z.string(),
  thread_id: z.string().optional().nullable(),
  content: z.string(),
  role: z.nativeEnum(MessageRole)
})

export type CreateMessageDto = z.infer<typeof createMessageSchema> 