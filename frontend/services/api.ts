import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
})

export interface Essay {
  id: string
  title: string
  contents: string
  created_at: string
  updated_at: string
}

export const essayService = {
  getAll: async (): Promise<Essay[]> => {
    const { data } = await api.get('/essays')
    return data
  },

  getOne: async (id: string): Promise<Essay> => {
    const { data } = await api.get(`/essays/${id}`)
    if (!data) throw new Error('Essay not found')
    return data
  },

  create: async (title: string): Promise<Essay> => {
    const { data } = await api.post('/essays', {
      title,
      contents: `# ${title}\n\nStart writing your essay here...`
    })
    return data
  },

  update: async (id: string, contents: string): Promise<Essay> => {
    const { data } = await api.put(`/essays/${id}`, { contents })
    return data
  }
}

export default api 