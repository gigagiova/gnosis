import { Controller, Get, Post, Put, Body, Param, HttpException, HttpStatus, Header } from '@nestjs/common'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { Essay, CreateEssayDto, UpdateEssayDto } from '@gnosis/models'

@Controller('essays')
export class EssaysController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async findAll(): Promise<Essay[]> {
    return this.prisma.essay.findMany({
      orderBy: { created_at: 'desc' }
    })
  }

  @Get(':id')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async findOne(@Param('id') id: string): Promise<Essay> {
    const essay = await this.prisma.essay.findUnique({
      where: { id }
    })
    
    if (!essay) {
      throw new HttpException('Essay not found', HttpStatus.NOT_FOUND)
    }
    
    return essay
  }

  @Post()
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async create(@Body() data: CreateEssayDto): Promise<Essay> {
    return this.prisma.essay.create({
      data: {
        title: data.title,
        contents: data.contents
      }
    })
  }

  @Put(':id')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async update(@Param('id') id: string, @Body() data: UpdateEssayDto): Promise<Essay> {
    try {
      return await this.prisma.essay.update({
        where: { id },
        data: {
          title: data.title,
          contents: data.contents
        }
      })
    } catch {
      throw new HttpException('Essay not found', HttpStatus.NOT_FOUND)
    }
  }
} 