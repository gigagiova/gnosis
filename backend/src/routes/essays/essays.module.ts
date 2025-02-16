import { Module } from '@nestjs/common'
import { EssaysController } from './essays.controller'
import { ThreadsController } from './threads.controller'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { MessageService } from '../../services/message.service'
import { AIModule } from '../../ai/ai.module'
import { AIService } from '../../services/ai.service'

@Module({
  imports: [AIModule],
  controllers: [EssaysController, ThreadsController],
  providers: [PrismaService, MessageService, AIService],
  exports: [PrismaService, MessageService]
})
export class EssaysModule {} 