import { Module } from '@nestjs/common'
import { EssaysController } from './essays.controller'
import { ThreadsController } from './threads.controller'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { MessageService } from '../../services/message.service'

@Module({
  controllers: [EssaysController, ThreadsController],
  providers: [PrismaService, MessageService],
  exports: [PrismaService, MessageService]
})
export class EssaysModule {} 