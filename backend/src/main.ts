import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure Global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configure Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Operly API')
    .setDescription(
      'Operly – Restaurant Operations and Profitability Management API (v2.1 Enterprise with AI Modules)',
    )
    .setVersion('2.1.0')
    .addTag('System & Health', 'Health checks and server runtime status')
    .addTag('Auth & RBAC', 'Authentication, user management, and access control')
    .addTag('Restaurant Setup', 'Dining tables, categories, and menu items')
    .addTag('Dining Sessions & Orders', 'Table bookings, dining sessions, and kitchen orders')
    .addTag('Inventory & BOM', 'Inventory ingredients, recipes, stock receipts, and movements')
    .addTag('Billing & Payments', 'Invoices, split payments, promotions, and refunds')
    .addTag('HR & Scheduling', 'Shifts, staff assignments, GPS attendances, and audit logs')
    .addTag('AI Analytics & Insights', 'Dish profitability, ML forecasting, recommendations, and anomaly detection')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT Bearer token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`[Operly] Backend server running at: http://localhost:${port}`);
  console.log(`[Operly] Swagger documentation available at: http://localhost:${port}/api/docs`);
}

await bootstrap();
