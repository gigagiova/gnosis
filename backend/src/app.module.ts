import { Module } from '@nestjs/common'
import { EssaysController } from './routes/essays/essays.controller'
import { PrismaService } from './shared/prisma/prisma.service'

@Module({
  imports: [],
  controllers: [EssaysController],
  providers: [PrismaService]
})
export class AppModule {} 