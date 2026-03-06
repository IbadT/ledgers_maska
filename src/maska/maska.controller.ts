import { Controller, Logger, Post, HttpCode, Body } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
// import { ClientProxy } from '@nestjs/microservices';
import { MaskaService } from './maska.service';
import { MatematikaPayloadDto } from './dto/matematika-payload.dto';
import { MaskaResponseDto } from './dto/matematika-response.dto';

@Controller()
export class MaskaController {
  private readonly logger = new Logger(MaskaController.name);

  constructor(
    private readonly maskaService: MaskaService,
    // @Inject('MATHEMATIKA_SERVICE') private readonly matematikaClient: ClientProxy,
  ) {}

  /**
   * === ЕДИНСТВЕННЫЙ МЕТОД ПОЛУЧЕНИЯ ДАННЫХ ===
   *
   * Слушает очередь matematika.to.maska
   * Обрабатывает данные от Matematika (Golang)
   */

  @MessagePattern('statement.generate')
  async handleStatementGeneration(@Payload() payload: MatematikaPayloadDto, @Ctx() context: RmqContext) {
    // Время начала выполнения
    const start = Date.now();
    this.logger.debug(`🔵 started ${start}`);

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
      const result = await this.maskaService.processFinancialData(payload);

      // === УСПЕХ - подтверждаем сообщение ===
      channel.ack(rabbitMessage);

      this.logger.log('✅ Message acknowledged (ACK)');
      this.logger.log('========================================');

      // Время завершения выполнения
      const duration = Date.now() - start;
      this.logger.debug(`🚀 sorted transactions: ${JSON.stringify(result, null, 2)}`);
      this.logger.log(`🟢 completed in ${duration}ms`);

      // Отправить запрос в Share
      // return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error('❌ ERROR processing message:', errorMessage);
      this.logger.error('Stack:', errorStack);

      // === ОШИБКА - отклоняем сообщение ===
      // requeue = false → отправляем в DLQ (Dead Letter Queue)
      channel.nack(rabbitMessage, false, false);

      this.logger.log('❌ Message rejected (NACK) → sent to DLQ');
      this.logger.log('========================================');

      // Пробрасываем ошибку, чтобы клиент получил ответ об ошибке
      throw error;
    }
  }

  @Post('api/maska/process')
  @HttpCode(200)
  async processViaRest(@Body() payload: MatematikaPayloadDto): Promise<MaskaResponseDto> {
    const start = Date.now();
    this.logger.log('========================================');
    this.logger.log('📥 REST API REQUEST');
    this.logger.log('========================================');
    this.logger.log(`Job ID: ${payload.jobId}`);
    this.logger.log(`Transactions: ${payload.transactions?.length || 0}`);

    try {
      const result = await this.maskaService.processFinancialData(payload);

      const duration = Date.now() - start;
      this.logger.log(`✅ REST processing completed in ${duration}ms`);
      this.logger.log('========================================');

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error('❌ REST API ERROR:', errorMessage);
      this.logger.error('Stack:', errorStack);
      throw error;
    }
  }
}
