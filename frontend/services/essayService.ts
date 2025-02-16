import { Essay, CreateEssayDto, UpdateEssayDto } from '@gnosis/models'
import { api } from './api'

/**
 * Raw essay data as received from the API before date transformation
 */
interface RawEssayResponse {
  id: string
  title: string
  contents: string
  created_at: string
  updated_at: string
}

/**
 * Transforms raw API response to Essay type with proper Date objects
 */
const transformEssay = (data: RawEssayResponse): Essay => ({
  ...data,
  created_at: new Date(data.created_at),
  updated_at: new Date(data.updated_at)
})

export const essayService = {
  getAll: async (): Promise<Essay[]> => {
    const { data } = await api.get<Essay[]>('/essays')
    return data
  },

  getOne: async (id: string): Promise<Essay> => {
    const { data } = await api.get<Essay>(`/essays/${id}`)
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