import { Test, TestingModule } from '@nestjs/testing'
import { EssaysController } from './essays.controller'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { MessageService } from '../../services/message.service'

describe('EssaysController', () => {
  let controller: EssaysController

  const mockPrismaService = {
    essay: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  }

  const mockMessageService = {
    createAndStreamMessage: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EssaysController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: MessageService,
          useValue: mockMessageService
        }
      ]
    }).compile()

    controller = module.get<EssaysController>(EssaysController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
}) 