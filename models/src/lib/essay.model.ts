import { Message } from './message.model'
import { Thread } from './thread.model'

/**
 * Represents an essay in the system
 */
export interface Essay {
  /** Unique identifier for the essay */
  id: string
  /** Title of the essay */
  title: string
  /** Contents of the essay in markdown format */
  contents: string
  /** When the essay was created */
  created_at: Date
  /** When the essay was last updated */
  updated_at: Date
  /** Messages associated with the essay that don't belong to any thread */
  messages?: Message[]
  /** Threads associated with the essay */
  threads?: Thread[]
}

/**
 * Full essay data with required messages and threads
 */
export interface FullEssay extends Essay {
  messages: Message[]
  threads: (Thread & { messages: Message[] })[]
}

/**
 * Data transfer object for creating a new essay
 */
export interface CreateEssayDto {
  /** Title of the essay */
  title: string
  /** Contents of the essay in markdown format */
  contents: string
}

/**
 * Data transfer object for updating an existing essay
 */
export interface UpdateEssayDto {
  /** Title of the essay */
  title: string
  /** Contents of the essay in markdown format */
  contents: string
} 