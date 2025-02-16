import { Controller, Get, Post, Put, Body, Param, HttpException, HttpStatus, Res, Headers, HttpCode } from '@nestjs/common'
import { Response } from 'express'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { Essay, CreateEssayDto, UpdateEssayDto, CreateMessageDto, MessageRole, FullEssay } from '@gnosis/models'
import { MessageService } from '../../services/message.service'

@Controller('essays')
export class EssaysController {
  constructor(
    private prisma: PrismaService,
    private messageService: MessageService
  ) {}

  @Get()
  async findAll(): Promise<Essay[]> {
    return this.prisma.essay.findMany({
      orderBy: { created_at: 'desc' }
    })
  }

  @Get(':essayId')
  async findOne(@Param('essayId') essayId: string): Promise<FullEssay> {
    
    const essay = await this.prisma.essay.findUnique({
      where: { id: essayId },
      include: {
        messages: {
          where: { thread_id: null },
          orderBy: { created_at: 'asc' }
        },
        threads: {
          include: {
            messages: {
              orderBy: { created_at: 'asc' }
            }
          }
        }
      }
    })
    
    if (!essay) throw new HttpException('Essay not found', HttpStatus.NOT_FOUND)
    
    const mappedEssay = {
      ...essay,
      messages: essay.messages.map(msg => ({ ...msg, role: msg.role as MessageRole })),
      threads: essay.threads.map(thread => ({
        ...thread,
        messages: thread.messages.map(msg => ({ ...msg, role: msg.role as MessageRole }))
      }))
    } as FullEssay
    
    return mappedEssay
  }

  @Post()
  async create(@Body() data: CreateEssayDto): Promise<Essay> {
    return this.prisma.essay.create({data})
  }

  @Put(':essayId')
  async update(@Param('essayId') essayId: string, @Body() data: UpdateEssayDto): Promise<Essay> {
    try {
      return await this.prisma.essay.update({where: { id: essayId }, data})
    } catch {
      throw new HttpException('Essay not found', HttpStatus.NOT_FOUND)
    }
  }

  @Post(':essayId/messages')
  @HttpCode(200)
  async createMessage(
    @Param('essayId') essayId: string,
    @Body() data: CreateMessageDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('accept') accept: string
  ) {
    // Check if client accepts SSE
    if (accept !== 'text/event-stream') {
      throw new HttpException('Client must accept text/event-stream', HttpStatus.BAD_REQUEST)
    }

    // Verify essay exists
    const essay = await this.prisma.essay.findUnique({where: { id: essayId }})
    if (!essay) throw new HttpException('Essay not found', HttpStatus.NOT_FOUND)
    
    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    
    // Create message at essay level (no thread_id)
    await this.messageService.createAndStreamMessage({
      content: data.content,
      essay_id: essayId,
      res
    })
  }
} 