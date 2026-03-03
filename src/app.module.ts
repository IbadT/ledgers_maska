import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MaskaModule } from './maska/maska.module';

@Module({
  imports: [
    MaskaModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
