import { Module } from '@nestjs/common'
import { EssaysModule } from './routes/essays/essays.module'

@Module({
  imports: [EssaysModule],
  controllers: [],
  providers: []
})
export class AppModule {} 