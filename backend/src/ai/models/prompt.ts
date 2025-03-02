import { ChatCompletionMessageParam } from 'openai/resources/chat/completions'


/**
 * Base message type for all message variants
 */
export abstract class BaseMessage {
  abstract role: 'system' | 'user' | 'assistant'
  
  constructor(public content: string) {}

  compile(params: Record<string, string | number | boolean> = {}): ChatCompletionMessageParam {
    // Replace any template variables in content
    let compiledContent = this.content
    for (const [key, value] of Object.entries(params)) {
      compiledContent = compiledContent.replace(`${key}`, String(value))
    }
    return { role: this.role, content: compiledContent }
  }
}

/**
 * System message implementation
 */
export class SystemMessage extends BaseMessage {
  role = 'system' as const
}

/**
 * User message implementation
 */
export class UserMessage extends BaseMessage {
  role = 'user' as const
}

/**
 * Assistant message implementation
 */
export class AssistantMessage extends BaseMessage {
  role = 'assistant' as const
}

/**
 * Union type representing either a user or assistant message
 * Used for handling conversation messages that aren't system messages
 */
export type ChatMessage = UserMessage | AssistantMessage


/**
 * Prompt class that manages a sequence of messages
 */
export class Prompt {
  private messages: BaseMessage[] = []

  constructor(messages: BaseMessage[], backupSystem = '') {
    // Initialize with backup system message if provided
    if (backupSystem) this.messages = [new SystemMessage(backupSystem)]
    this.messages.push(...messages)
  }

  /**
   * Compiles all messages in the prompt
   */
  compile(params: Record<string, string | number | boolean> = {}): ChatCompletionMessageParam[] {
    return this.messages.map(message => message.compile(params))
  }

  /**
   * Adds multiple messages to the prompt
   */
  addMessages(messages: BaseMessage[]) {
    this.messages.push(...messages)
  }

  /**
   * Adds a single message to the prompt
   */
  addMessage(message: BaseMessage) {
    this.messages.push(message)
  }
} 