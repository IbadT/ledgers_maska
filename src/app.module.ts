import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MaskaController } from './maska/maska.controller';
import { MaskaService } from './maska/maska.service';
import { GeneratorsService } from './generators/generators.service';
import { ContractorsService } from './contractors/contractors.service';
import { TemplatesService } from './templates/templates.service';

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
          queue: 'matematika.to.maska',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [AppController, MaskaController],
  providers: [MaskaService, GeneratorsService, ContractorsService, TemplatesService],
})
export class AppModule {}
