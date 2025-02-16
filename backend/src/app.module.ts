import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EssaysModule } from './routes/essays/essays.module'

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true, envFilePath: '.env'}),
    EssaysModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {} 