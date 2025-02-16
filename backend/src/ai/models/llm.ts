import { Observable } from 'rxjs'
import { Prompt } from './prompt'

/**
 * Type for LLM parameters that can be passed to predict and stream methods
 */
export interface LLMParams {
  temperature?: number
  [key: string]: string | number | undefined
}

/**
 * Base interface for Language Model implementations
 */
export interface ILLM {
  predict(prompt: Prompt, params?: LLMParams): Promise<string>
  stream(prompt: Prompt, params?: LLMParams): Observable<string>
}

/**
 * Abstract base class for Language Model implementations
 * Provides common functionality and enforces interface implementation
 */
export abstract class BaseLLM implements ILLM {
  protected modelName: string
  protected includeSystem: boolean

  constructor(modelName: string, includeSystem = true) {
    this.modelName = modelName
    this.includeSystem = includeSystem
  }

  /**
   * Predicts completion for a given prompt
   */
  abstract predict(prompt: Prompt, params?: LLMParams): Promise<string>

  /**
   * Streams completion tokens for a given prompt
   */
  abstract stream(prompt: Prompt, params?: LLMParams): Observable<string>
} 