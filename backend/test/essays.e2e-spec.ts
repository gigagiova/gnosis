import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/shared/prisma/prisma.service'

describe('EssaysController (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication() as INestApplication
    prisma = app.get<PrismaService>(PrismaService)
    await app.init()
  })

  beforeEach(async () => {
    // Clean the database before each test
    await prisma.essay.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await app.close()
  })

  it('/essays (POST) should create an essay', () => {
    const testEssay = {
      title: 'Test Essay',
      contents: 'This is a test essay'
    }

    return request(app.getHttpServer())
      .post('/essays')
      .send(testEssay)
      .expect(201)
      .expect(res => {
        expect(res.body).toHaveProperty('id')
        expect(res.body.title).toBe(testEssay.title)
        expect(res.body.contents).toBe(testEssay.contents)
      })
  })

  it('/essays (GET) should return all essays', async () => {
    // Create test essay
    const testEssay = await prisma.essay.create({
      data: {
        title: 'Test Essay',
        contents: 'Test content'
      }
    })

    return request(app.getHttpServer())
      .get('/essays')
      .expect(200)
      .expect(res => {
        expect(Array.isArray(res.body)).toBe(true)
        expect(res.body.length).toBe(1)
        expect(res.body[0].id).toBe(testEssay.id)
      })
  })

  it('/essays/:id (GET) should return one essay', async () => {
    const testEssay = await prisma.essay.create({
      data: {
        title: 'Test Essay',
        contents: 'Test content'
      }
    })

    return request(app.getHttpServer())
      .get(`/essays/${testEssay.id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.id).toBe(testEssay.id)
        expect(res.body.title).toBe(testEssay.title)
      })
  })

  it('/essays/:id (PUT) should update an essay', async () => {
    const testEssay = await prisma.essay.create({
      data: {
        title: 'Original Title',
        contents: 'Original content'
      }
    })

    const updateData = {
      title: 'Updated Title',
      contents: 'Updated content'
    }

    return request(app.getHttpServer())
      .put(`/essays/${testEssay.id}`)
      .send(updateData)
      .expect(200)
      .expect(res => {
        expect(res.body.title).toBe(updateData.title)
        expect(res.body.contents).toBe(updateData.contents)
      })
  })
}) 