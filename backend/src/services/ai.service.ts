import { Injectable, Inject, Logger } from '@nestjs/common'
import { PrismaService } from '../shared/prisma/prisma.service'
import { ChatGPT } from '../ai/models/chatgpt'
import { UserMessage, AssistantMessage, SystemMessage, ChatMessage, Prompt } from '../ai/models/prompt'
import { Message, MessageRole } from '@prisma/client'
import { SectionedMarkdown } from '../utils/markdown/sectioner'
import { writingAssistantPrompt } from '../ai/prompts/writing-assistant.prompt'

/**
 * Service that handles AI interactions for essay writing assistance
 * Focuses on the master thread flow (thread_id: null)
 */
@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name)

  constructor(
    private prisma: PrismaService,
    @Inject('gpt4o') private gpt4o: ChatGPT
  ) {}

  /**
   * Creates a prompt from a conversation history
   */
  private async createPromptFromHistory(essay_id: string, thread_id?: string): Promise<ChatMessage[]> {
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

    return promptMessages
  }

  /**
   * Streams an AI response for a conversation
   */
  async streamResponse(message: Message) {

    // Fetches prompt from conversation history
    const messages = await this.createPromptFromHistory(message.essay_id, message.thread_id)

      // Fetch the essay content
      const essay = await this.prisma.essay.findUnique({
        where: { id: message.essay_id },
        select: { contents: true }
      })

      if (!essay) this.logger.warn(`Essay with ID ${message.essay_id} not found, proceeding without essay content`)

      // Create sectioned markdown with delimiters
      const sectionedMarkdown = new SectionedMarkdown(essay.contents)
      const documentsWithDelimiters = sectionedMarkdown.getMarkdownWithDelimiters()
      
      // Add the new message to the prompt
      const user = new UserMessage(message.content)
      const system = new SystemMessage(writingAssistantPrompt)
      const prompt = new Prompt([system, ...messages, user])
      
      // Get the stream from GPT-4
      const originalStream = this.gpt4o.stream(prompt, { documentsWithDelimiters })
      
      // For thread messages or when no essay is available, return the original stream
      return originalStream
  }


}
