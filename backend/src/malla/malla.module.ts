import { Module } from '@nestjs/common';
import { MallaService } from './malla.service';
import { MallaController } from './malla.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MallaService],
  controllers: [MallaController]
})
export class MallaModule {}