import { Injectable, Logger } from '@nestjs/common'
import { Response } from 'express'
import { PrismaService } from '../shared/prisma/prisma.service'
import { MessageRole } from '@gnosis/models'
import { AIService } from './ai.service'
import { DiffParser } from '../utils/markdown/diff-parser'
import { SectionedMarkdown } from '../utils/markdown/sectioner'

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
      this.logger.debug(`Starting message stream for essay ${essay_id} in thread ${thread_id}...`)
      
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
      const stream = await this.aiService.streamResponse(userMessage)
      let fullContent = ''

      // Create a promise that resolves when the stream completes
      await new Promise<void>((resolve, reject) => {
        
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
          complete: async () => {
            this.logger.debug('Stream completed successfully')
            
            if (thread_id) this.logger.debug('Stream completed successfully for thread:', thread_id)

            // Process diffs when the stream completes (only for main thread)
            else {
              
              // Try to extract and apply diffs
              const diffs = DiffParser.parseDiffs(fullContent)

              // If there are diffs, apply them to the essay content
              if (diffs.length > 0) {

                // Fetch the essay content
                const essay = await this.prisma.essay.findUnique({where: { id: essay_id }})

                // Apply diffs to the essay content
                const updatedContent = new SectionedMarkdown(essay.contents).applyDiffs(diffs)
                
                // After having processed the diffs, update the essay in the database
                await this.prisma.essay.update({where: { id: essay_id }, data: { contents: updatedContent }})

                // Send the updated essay to the client
                res.write(`data: ${JSON.stringify({type: 'essay', essay: updatedContent})}\n\n`)
              }
              
              this.logger.debug(`Updated essay ${essay_id} with modified content`)
            }
            
            // Send completion message
            res.write(`data: ${JSON.stringify({type: 'done', finalContent: fullContent})}\n\n`)
            res.end()
            resolve()
          }
        })
      })

    } catch (error) {
      this.logger.error('Error in createAndStreamMessage for essay_id:', essay_id, error)
      throw error
    }
  }
} 