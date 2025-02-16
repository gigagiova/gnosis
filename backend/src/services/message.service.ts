import { Injectable, Logger } from '@nestjs/common'
import { Response } from 'express'
import { PrismaService } from '../shared/prisma/prisma.service'
import { MessageRole } from '@gnosis/models'
import { AIService } from './ai.service'

interface StreamMessageParams {
  content: string
  essay_id: string
  thread_id?: string
  res: Response
}

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name)

  constructor(
    private prisma: PrismaService,
    private aiService: AIService
  ) {}

  async createAndStreamMessage({
    content,
    essay_id,
    thread_id,
    res
  }: StreamMessageParams) {
    try {
      this.logger.debug('Starting message stream...')
      
      // Check if client accepts SSE
      if (!res.getHeader('Content-Type')) {
        // Set up SSE headers if not already set
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
      }

      // Create user message in the database
      this.logger.debug('Creating user message...')
      const userMessage = await this.prisma.message.create({
        data: {
          thread_id,
          essay_id,
          content,
          role: MessageRole.user
        }
      })

      // Create pending assistant message
      this.logger.debug('Creating assistant message...')
      const assistantMessage = await this.prisma.message.create({
        data: {
          role: MessageRole.assistant,
          essay_id,
          thread_id,
          content: ''
        }
      })

      // Send initial messages to client
      this.logger.debug('Sending initial messages...')
      res.write(`data: ${JSON.stringify({type: 'message', message: userMessage})}\n\n`)
      res.write(`data: ${JSON.stringify({type: 'message', message: assistantMessage})}\n\n`)

      // Get the AI response stream
      this.logger.debug('Getting AI response stream...')
      const stream = await this.aiService.streamResponse(userMessage)
      let fullContent = ''

      // Create a promise that resolves when the stream completes
      await new Promise<void>((resolve, reject) => {
        this.logger.debug('Subscribing to AI stream...')
        stream.subscribe({
          next: async (chunk) => {
            
            // Send chunk to client
            res.write(`data: ${JSON.stringify({type: 'chunk', content: chunk})}\n\n`)

            // Update message content in database
            fullContent += chunk
            await this.prisma.message.update({
              where: { id: assistantMessage.id },
              data: { content: fullContent }
            })
          },
          error: (error) => {
            this.logger.error('Stream error in createAndStreamMessage for essay_id:', essay_id, error)
            // Send error to client
            res.write(`data: ${JSON.stringify({type: 'error', message: error.message})}\n\n`)
            res.end()
            reject(error)
          },
          complete: () => {
            this.logger.debug('Stream completed successfully')
            // Send completion message
            res.write(`data: ${JSON.stringify({type: 'done', finalContent: fullContent})}\n\n`)
            res.end()
            resolve()
          }
        })
      })

      this.logger.debug('Message stream completed successfully')
    } catch (error) {
      this.logger.error('Error in createAndStreamMessage for essay_id:', essay_id, error)
      throw error
    }
  }
} 