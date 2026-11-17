import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return 'Operly Backend is running!';
  }

  @Get('health/database')
  checkDatabase(): Promise<{ database: string }> {
    return this.appService.checkDatabase();
  }
}