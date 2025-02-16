import { Thread, CreateThreadDto } from '@gnosis/models'
import { api } from './api'

export const threadService = {
  getByEssay: async (essayId: string): Promise<Thread[]> => {
    const { data } = await api.get<Thread[]>(`/essays/${essayId}/threads`)
    return data
  },

  create: async (essayId: string, startIndex: number, endIndex: number): Promise<Thread> => {
    const { data } = await api.post<Thread>(`/essays/${essayId}/threads`, {
      essay_id: essayId,
      start_index: startIndex,
      end_index: endIndex
    } as CreateThreadDto)
    return data
  },

  get: async (essayId: string, threadId: string): Promise<Thread> => {
    const { data } = await api.get<Thread>(`/essays/${essayId}/threads/${threadId}`)
    return data
  }
} 