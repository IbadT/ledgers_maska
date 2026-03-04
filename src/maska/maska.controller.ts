import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { MaskaService } from './maska.service';
import { MatematikaPayloadDto } from './dto/matematika-payload.dto';

@Controller()
export class MaskaController {
  private readonly logger = new Logger(MaskaController.name);

  constructor(private readonly maskaService: MaskaService) {}

  /**
   * === ЕДИНСТВЕННЫЙ МЕТОД ПОЛУЧЕНИЯ ДАННЫХ ===
   *
   * Слушает очередь matematika.to.maska
   * Обрабатывает данные от Matematika (Golang)
   */

  @EventPattern('statement.generate')
  async handleStatementGeneration(
    @Payload() payload: MatematikaPayloadDto,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    // Получаем RabbitMQ channel и message для ручного ACK/NACK
    const channel = context.getChannelRef();
    const rabbitMessage = context.getMessage();

    this.logger.log('========================================');
    this.logger.log('📥 RECEIVED FROM MATEMATIKA (Golang)');
    this.logger.log('========================================');
    this.logger.log('Full message:', JSON.stringify(payload, null, 2));
    this.logger.log(`Job ID:     ${payload.jobId}`);
    this.logger.log(`Transactions count: ${payload.transactions?.length || 0}`);

    try {
      // === ОСНОВНАЯ ОБРАБОТКА ===
      await this.maskaService.processFinancialData(payload);

      // === УСПЕХ - подтверждаем сообщение ===
      channel.ack(rabbitMessage);

      this.logger.log('✅ Message acknowledged (ACK)');
      this.logger.log('========================================');

      // TODO: добавить логику отправки в следующий микросервис
      
    } catch (error) {
      this.logger.error('❌ ERROR processing message:', error.message);
      this.logger.error('Stack:', error.stack);

      // === ОШИБКА - отклоняем сообщение ===
      // requeue = false → отправляем в DLQ (Dead Letter Queue)
      channel.nack(rabbitMessage, false, false);

      this.logger.log('❌ Message rejected (NACK) → sent to DLQ');
      this.logger.log('========================================');
    }
  }
}
