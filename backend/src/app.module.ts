import { Module } from '@nestjs/common'
import { EssaysController } from './essays/essays.controller'
import { PrismaService } from './prisma/prisma.service'

@Module({
  imports: [],
  controllers: [EssaysController],
  providers: [PrismaService]
})
export class AppModule {} 