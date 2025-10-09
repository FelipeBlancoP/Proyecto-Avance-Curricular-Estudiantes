import { Module } from '@nestjs/common';
import { AvanceService } from './avance.service';
import { AvanceController } from './avance.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      baseURL: 'https://puclaro.ucn.cl/eross/avance/',
    }),
  ],
  controllers: [AvanceController],
  providers: [AvanceService],
})
export class AvanceModule {}
