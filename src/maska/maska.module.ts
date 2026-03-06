import { Module } from '@nestjs/common';
import { MaskaService } from './maska.service';
import { MaskaController } from './maska.controller';
import { GeneratorsService } from 'src/generators/generators.service';
import { ContractorsService } from 'src/contractors/contractors.service';
import { TemplatesService } from 'src/templates/templates.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATHEMATIKA_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
          ],
          exchange: 'matematika.exchange',
          exchangeType: 'topic',
          queue: 'maska.to.matematika',
          queueOptions: {
            durable: true,
          },
          routingKey: 'statement.response',
        },
      },
    ]),
  ],
  controllers: [MaskaController],
  providers: [MaskaService, GeneratorsService, ContractorsService, TemplatesService],
})
export class MaskaModule {}
