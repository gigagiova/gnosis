import { Injectable, Inject } from '@nestjs/common'
import { PrismaService } from '../shared/prisma/prisma.service'
import { ChatGPT } from '../ai/models/chatgpt'
import { Prompt, UserMessage, AssistantMessage } from '../ai/models/prompt'
import { Message, MessageRole } from '@prisma/client'

@Injectable()
export class AIService {
  constructor(
    private prisma: PrismaService,
    @Inject('gpt4o') private gpt4o: ChatGPT
  ) {}

  /**
   * Creates a prompt from a conversation history
   */
  private async createPromptFromHistory(essay_id: string, thread_id?: string): Promise<Prompt> {
    // Fetch all messages in the conversation
    const messages = await this.prisma.message.findMany({
      where: { essay_id, thread_id },
      orderBy: { created_at: 'asc' }
    })

    // Convert DB messages to Prompt messages
    const promptMessages = messages.map(msg => {
      switch (msg.role) {
        case MessageRole.assistant:
          return new AssistantMessage(msg.content)
        case MessageRole.user:
          return new UserMessage(msg.content)
      }
    })

    return new Prompt(promptMessages)
  }

  /**
   * Streams an AI response for a conversation
   */
  async streamResponse(message: Message) {
    // Create prompt from conversation history
    const prompt = await this.createPromptFromHistory(
      message.essay_id,
      message.thread_id
    )

    // Add the new message to the prompt
    prompt.addMessage(new UserMessage(message.content))

    // Return the stream from GPT-4
    return this.gpt4o.stream(prompt)
  }
} 