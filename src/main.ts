import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Создаем микросервис для RabbitMQ с wildcard pattern
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
      ],

      // ✅ Exchange должен совпадать с Go
      exchange: 'matematika.exchange',
      exchangeType: 'topic',

      // ✅ Queue
      queue: 'matematika.to.maska',
      queueOptions: {
        durable: true,
        // DLQ опционально
        // deadLetterExchange: 'maska.dlx',
      },

      // ✅ Routing key для binding (НЕ для pattern!)
      routingKey: 'statement.generate',

      // Важные настройки
      prefetchCount: 1,
      noAck: false, // Ручное подтверждение
    },
  });

  app.useGlobalPipes(new ValidationPipe());
  // app.useGlobalFilters(new ExceptionFilter());

  await app.listen();

  console.log('🐰 RabbitMQ microservice started and listening for messages...');
  console.log('🎭 Maska microservice started');
  console.log('📡 Exchange: matematika.exchange');
  console.log('👂 Queue: matematika.to.maska');
  console.log('🔑 Binding: statement.generate');
}
bootstrap();
