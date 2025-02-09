import axios from 'axios'
import { Essay, CreateEssayDto, UpdateEssayDto } from '@gnosis/models'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
})

// Add timestamp to URLs to prevent caching
const addTimestamp = (url: string) => {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}t=${Date.now()}`
}

export type { Essay }

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
    const { data } = await api.get<RawEssayResponse[]>(addTimestamp('/essays'))
    return data.map(transformEssay)
  },

  getOne: async (id: string): Promise<Essay> => {
    const { data } = await api.get<RawEssayResponse>(addTimestamp(`/essays/${id}`))
    if (!data) throw new Error('Essay not found')
    return transformEssay(data)
  },

  create: async (title: string): Promise<Essay> => {
    const essayData: CreateEssayDto = {
      title,
      contents: ''
    }
    const { data } = await api.post<RawEssayResponse>(addTimestamp('/essays'), essayData)
    return transformEssay(data)
  },

  update: async (id: string, contents: string, title: string): Promise<Essay> => {
    const updateData: UpdateEssayDto = {
      title,
      contents
    }
    const { data } = await api.put<RawEssayResponse>(addTimestamp(`/essays/${id}`), updateData)
    return transformEssay(data)
  }
}

export default api 