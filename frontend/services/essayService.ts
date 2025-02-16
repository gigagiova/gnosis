import { Essay, CreateEssayDto, UpdateEssayDto, FullEssay } from '@gnosis/models'
import { api } from './api'

export const essayService = {
  getAll: async (): Promise<Essay[]> => {
    const { data } = await api.get<Essay[]>('/essays')
    return data
  },

  getOne: async (id: string): Promise<FullEssay> => {
    const { data } = await api.get<FullEssay>(`/essays/${id}`)
    if (!data) throw new Error('Essay not found')
    return data
  },

  create: async (title: string): Promise<Essay> => {
    const essayData: CreateEssayDto = {
      title,
      contents: ''
    }
    const { data } = await api.post<Essay>('/essays', essayData)
    return data
  },

  update: async (id: string, contents: string, title: string): Promise<Essay> => {
    const updateData: UpdateEssayDto = {
      title,
      contents
    }
    const { data } = await api.put<Essay>(`/essays/${id}`, updateData)
    return data
  }
} 