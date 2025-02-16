import { CreateMessageDto, Message, MessageRole } from '@gnosis/models'
import { api } from './api'

interface CreateMessageParams {
  essayId: string
  content: string
  threadId?: string
  onMessageUpdate?: (messages: Message[]) => void
}

// Types for the different SSE events we can receive
type MessageEvent = {
  type: 'messages'
  userMessage: Message
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
    onMessageUpdate 
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

    // Keep track of messages locally
    let currentMessages: Message[] = []

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
              case 'messages':
                // Add user message and prepare for assistant's response
                currentMessages = [...currentMessages, data.userMessage]
                if (onMessageUpdate) onMessageUpdate(currentMessages)
                break

              case 'chunk':
                // Update the assistant's message with new content
                const updatedMessages = [...currentMessages]
                const lastMessage = updatedMessages[updatedMessages.length - 1]
                
                if (lastMessage?.role === MessageRole.assistant) {
                  lastMessage.content += data.content
                } else {
                  // Create new assistant message if it doesn't exist
                  updatedMessages.push({
                    role: MessageRole.assistant,
                    content: data.content
                  } as Message)
                }
                
                currentMessages = updatedMessages
                if (onMessageUpdate) onMessageUpdate(currentMessages)
                break

              case 'done':
                // Ensure final content is set
                const finalMessages = [...currentMessages]
                const finalLastMessage = finalMessages[finalMessages.length - 1]
                
                if (finalLastMessage?.role === MessageRole.assistant) {
                  finalLastMessage.content = data.finalContent
                }
                
                currentMessages = finalMessages
                if (onMessageUpdate) onMessageUpdate(currentMessages)
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