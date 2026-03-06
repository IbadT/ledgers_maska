// ==========================================
// src/main.ts (обновленный - гибридный подход)
// ==========================================

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // === СОЗДАЕМ ГИБРИДНОЕ ПРИЛОЖЕНИЕ ===
  // Обычное HTTP приложение + микросервис
  const app = await NestFactory.create(AppModule);

  // Подключаем RabbitMQ микросервис
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
      ],
      exchange: 'matematika.exchange',
      exchangeType: 'topic',
      queue: 'matematika.to.maska',
      queueOptions: {
        durable: true,
      },
      routingKey: 'statement.generate',
      prefetchCount: 1,
      noAck: false,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Maska API')
    .setDescription('Bank statement masking service')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Запускаем HTTP сервер
  const httpPort = process.env.PORT || 3002;
  await app.startAllMicroservices();
  await app.listen(httpPort);

  console.log('🚀 Hybrid application started');
  console.log('📡 HTTP REST API: http://localhost:' + httpPort);
  console.log('🐰 RabbitMQ microservice listening');
  console.log('🔑 REST endpoint: POST http://localhost:' + httpPort + '/api/maska/process');
  console.log('👂 RabbitMQ queue: matematika.to.maska');
}

void bootstrap();
