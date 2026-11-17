import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async checkDatabase(): Promise<{ database: string }> {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      database: 'connected',
    };
  }
}