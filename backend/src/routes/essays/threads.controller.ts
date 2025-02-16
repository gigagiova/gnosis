import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, Res, Headers, HttpCode } from '@nestjs/common'
import { Response } from 'express'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { Thread, CreateThreadDto, CreateMessageDto } from '@gnosis/models'
import { MessageService } from '../../services/message.service'
import { Prisma } from '@prisma/client'

@Controller('essays/:essayId/threads')
export class ThreadsController {
  constructor(
    private prisma: PrismaService,
    private messageService: MessageService
  ) {}

  @Get()
  async findAll(@Param('essayId') essayId: string): Promise<Thread[]> {
    const threads = await this.prisma.thread.findMany({
      where: { essay_id: essayId },
      include: { messages: true }
    })
    return threads as Thread[]
  }

  @Post()
  async create(
    @Param('essayId') essayId: string,
    @Body() data: CreateThreadDto
  ): Promise<Thread> {
    const thread = await this.prisma.thread.create({
      data: { ...data, essay_id: essayId } as Prisma.ThreadUncheckedCreateInput,
      include: { messages: true }
    })
    return thread as Thread
  }

  @Get(':threadId')
  async findOne(
    @Param('essayId') essayId: string,
    @Param('threadId') threadId: string
  ): Promise<Thread> {
    const thread = await this.prisma.thread.findFirst({
      where: { 
        id: threadId,
        essay_id: essayId
      },
      include: { messages: true }
    })
    
    if (!thread) throw new HttpException('Thread not found', HttpStatus.NOT_FOUND)
    
    return thread as Thread
  }

  @Post(':threadId/messages')
  @HttpCode(200)
  async createMessage(
    @Param('essayId') essayId: string,
    @Param('threadId') threadId: string,
    @Body() data: CreateMessageDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('accept') accept: string
  ) {
    // Check if client accepts SSE
    if (accept !== 'text/event-stream') {
      throw new HttpException('Client must accept text/event-stream', HttpStatus.BAD_REQUEST)
    }

    // Verify thread exists and belongs to essay
    const thread = await this.prisma.thread.findFirst({
      where: { 
        id: threadId,
        essay_id: essayId
      }
    })
    if (!thread) throw new HttpException('Thread not found', HttpStatus.NOT_FOUND)
    
    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    
    // Create message with thread context
    await this.messageService.createAndStreamMessage({
      content: data.content,
      essay_id: essayId,
      thread_id: threadId,
      res
    })
  }
} 