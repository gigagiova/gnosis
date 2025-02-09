import { Controller, Get, Post, Put, Body, Param, HttpException, HttpStatus } from '@nestjs/common'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { CreateEssayDto, UpdateEssayDto } from './dto/essay.dto'

@Controller('essays')
export class EssaysController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll() {
    return this.prisma.essay.findMany({
      orderBy: { created_at: 'desc' }
    })
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const essay = await this.prisma.essay.findUnique({
      where: { id }
    })
    
    if (!essay) {
      throw new HttpException('Essay not found', HttpStatus.NOT_FOUND)
    }
    
    return essay
  }

  @Post()
  async create(@Body() data: CreateEssayDto) {
    return this.prisma.essay.create({
      data: {
        title: data.title,
        contents: data.contents
      }
    })
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateEssayDto) {
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