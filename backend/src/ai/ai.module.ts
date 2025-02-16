import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ChatGPT } from './models/chatgpt'

/**
 * Pre-configured model instances
 */
const models = [
  {
    provide: 'gpt4o',
    useFactory: (configService: ConfigService) => new ChatGPT('gpt-4o', configService),
    inject: [ConfigService]
  },
  {
    provide: 'gpt4o-mini',
    useFactory: (configService: ConfigService) => new ChatGPT('gpt-4o-mini', configService),
    inject: [ConfigService]
  }
]

@Module({
  imports: [ConfigModule],
  providers: models,
  exports: models
})
export class AIModule {} 