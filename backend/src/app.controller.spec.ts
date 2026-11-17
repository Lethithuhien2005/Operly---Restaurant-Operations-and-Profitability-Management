import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockPrismaService = {
      $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Operly Backend is running!"', () => {
      expect(appController.getHello()).toBe('Operly Backend is running!');
    });
  });

  describe('checkDatabase', () => {
    it('should return connected status', async () => {
      const result = await appController.checkDatabase();
      expect(result).toEqual({ database: 'connected' });
    });
  });
});
