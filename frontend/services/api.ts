import axios from 'axios'
import { Essay, CreateEssayDto, UpdateEssayDto } from '@gnosis/models'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
})

export type { Essay }

/**
 * Transforms raw API response to Essay type with proper Date objects
 */
const transformEssay = (data: any): Essay => ({
  ...data,
  created_at: new Date(data.created_at),
  updated_at: new Date(data.updated_at)
})

export const essayService = {
  getAll: async (): Promise<Essay[]> => {
    const { data } = await api.get('/essays')
    return data.map(transformEssay)
  },

  getOne: async (id: string): Promise<Essay> => {
    const { data } = await api.get(`/essays/${id}`)
    if (!data) throw new Error('Essay not found')
    return transformEssay(data)
  },

  create: async (title: string): Promise<Essay> => {
    const essayData: CreateEssayDto = {
      title,
      contents: `# ${title}\n\nStart writing your essay here...`
    }
    const { data } = await api.post('/essays', essayData)
    return transformEssay(data)
  },

  update: async (id: string, contents: string): Promise<Essay> => {
    const updateData: UpdateEssayDto = {
      title: contents.split('\n')[0].replace('# ', ''),
      contents
    }
    const { data } = await api.put(`/essays/${id}`, updateData)
    return transformEssay(data)
  }
}

export default api 