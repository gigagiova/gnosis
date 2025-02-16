import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Observable } from 'rxjs'
import OpenAI from 'openai'
import { BaseLLM, LLMParams } from './llm'
import { Prompt } from './prompt'
import { Logger } from '@nestjs/common'


/**
 * ChatGPT implementation of the LLM interface
 * Handles both Azure OpenAI and standard OpenAI APIs
 */
@Injectable()
export class ChatGPT extends BaseLLM {
  private readonly logger = new Logger(ChatGPT.name)
  private client: OpenAI

  constructor(modelName: string, private configService: ConfigService, includeSystem = true) {
    super(modelName, includeSystem)
    this.initializeClient()
  }

  /**
   * Initializes the OpenAI client based on available configuration
   */
  private initializeClient() {
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY')

    if (openaiKey) this.client = new OpenAI({apiKey: openaiKey})
    else throw new Error('No OpenAI API configuration found')
  }

  /**
   * Makes a prediction using the OpenAI API
   */
  async predict(prompt: Prompt, params: LLMParams = {}): Promise<string> {
    const messages = prompt.compile(params)

    // Remove the system message if it's not supported by the model
    if (!this.includeSystem) messages.shift()

    // Retry the API call up to 8 times
    for (let attempt = 0; attempt <= 8; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          temperature: params.temperature ?? 0,
          model: this.modelName,
          messages
        })

        return response.choices[0].message.content || ''
      } catch (error) {
        // If we've exhausted all retries, log and throw the error
        if (attempt === 8) {
          this.logger.error(`OpenAI API error after ${8} retries: ${error.message}`)
          throw error
        }

        // Log retry attempt
        this.logger.warn(`OpenAI API error (attempt ${attempt + 1}/${8}): ${error.message}`)
        
        // Add exponential backoff delay
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  /**
   * Streams predictions from the OpenAI API
   */
  stream(prompt: Prompt, params: LLMParams = {}): Observable<string> {
    return new Observable(subscriber => {
      const messages = prompt.compile(params)

      // Remove the system message if it's not supported by the model
      if (!this.includeSystem) messages.shift()

      const streamResponse = async () => {
        try {
          // Request the stream response from the OpenAI API
          const stream = await this.client.chat.completions.create({
            model: this.modelName,
            messages,
            temperature: params.temperature ?? 0,
            stream: true
          })

          // Stream the response chunk by chunk
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) subscriber.next(content)
          }

          // Complete the stream
          subscriber.complete()
        } catch (error) {
          this.logger.error(`OpenAI streaming error: ${error.message}`)
          subscriber.error(error)
        }
      }

      streamResponse()
    })
  }
} 