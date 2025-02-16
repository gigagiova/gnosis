import { CreateMessageDto, Message, MessageRole } from '@gnosis/models'
import { api } from './api'

interface CreateMessageParams {
  essayId: string
  content: string
  threadId?: string
  setMessages?: React.Dispatch<React.SetStateAction<Message[]>>
}

// Types for the different SSE events we can receive
type MessageEvent = {
  type: 'message'
  message: Message
} | {
  type: 'chunk'
  content: string
} | {
  type: 'done'
  finalContent: string
}

export const messageService = {
  create: async ({ 
    essayId, 
    content, 
    threadId = undefined,
    setMessages 
  }: CreateMessageParams): Promise<void> => {
    // Build the URL based on whether it's a thread message or essay message
    const url = threadId 
      ? `${api.defaults.baseURL}/essays/${essayId}/threads/${threadId}/messages`
      : `${api.defaults.baseURL}/essays/${essayId}/messages`

    // Using fetch instead of axios for SSE support
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({ content } as CreateMessageDto)
    })

    if (!response.ok) throw new Error('Failed to create message')

    // Set up SSE parsing
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) throw new Error('No reader available')

    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const events = chunk.split('\n\n').filter(Boolean)

        for (const event of events) {
          try {
            const data = JSON.parse(event.replace('data: ', '')) as MessageEvent

            switch (data.type) {
              case 'message':
                // Add user message and prepare for assistant's response
                if (setMessages) setMessages(currentMessages => [...currentMessages, data.message])
                break

              case 'chunk':
                // Update the assistant's message with new content
                if (setMessages) setMessages(currentMessages => 
                  currentMessages.map((message, index) => 
                    // Only update the last message if it's from the assistant
                    index === currentMessages.length - 1 && message.role === MessageRole.assistant
                      ? { ...message, content: message.content + data.content }
                      : message
                  )
                )
                break

              case 'done':
                // Ensure final content is set by updating the last assistant message
                if (setMessages) setMessages(currentMessages => {
                  const updatedMessages = [...currentMessages]
                  const lastMessage = updatedMessages[updatedMessages.length - 1]
                  
                  if (lastMessage?.role === MessageRole.assistant) {
                    // Create a new message object for the final content
                    updatedMessages[updatedMessages.length - 1] = {
                      ...lastMessage,
                      content: data.finalContent
                    }
                  }
                  
                  return updatedMessages
                })
                break
            }
          } catch (error) {
            console.error('Error parsing SSE event:', error)
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
} 