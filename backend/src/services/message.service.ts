import { Injectable } from '@nestjs/common'
import { Response } from 'express'
import { PrismaService } from '../shared/prisma/prisma.service'
import { MessageRole } from '@gnosis/models'

interface StreamMessageParams {
  content: string
  essay_id: string
  thread_id?: string
  res: Response
}

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async createAndStreamMessage({
    content,
    essay_id,
    thread_id,
    res
  }: StreamMessageParams) {
    // Check if client accepts SSE
    if (!res.getHeader('Content-Type')) {
      // Set up SSE headers if not already set
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
    }

    // Create user message in the database
    const userMessage = await this.prisma.message.create({
      data: {
        thread_id,
        essay_id,
        content,
        role: MessageRole.user
      }
    })

    // Create pending assistant message
    const assistantMessage = await this.prisma.message.create({
      data: {
        role: MessageRole.assistant,
        essay_id,
        thread_id,
        content: ''
      }
    })

    // Send initial messages to client
    res.write(`data: ${JSON.stringify({type: 'message', message: userMessage})}\n\n`)
    res.write(`data: ${JSON.stringify({type: 'message', message: assistantMessage})}\n\n`)

    // TODO: Replace with actual AI integration
    const chunks = ['Hello', ' world', '! How', ' can', ' I', ' help', ' you', ' today', '?']
    let fullContent = ''

    for (const chunk of chunks) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      fullContent += chunk
      
      // Send chunk to client
      res.write(`data: ${JSON.stringify({type: 'chunk', content: chunk})}\n\n`)

      // Update message content in database
      await this.prisma.message.update({
        where: { id: assistantMessage.id },
        data: { content: fullContent }
      })
    }

    // Send completion message
    res.write(`data: ${JSON.stringify({type: 'done', finalContent: fullContent})}\n\n`)
    res.end()
  }
} 