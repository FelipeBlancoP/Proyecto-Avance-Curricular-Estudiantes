import { Module } from '@nestjs/common';
import { MallaService } from './malla.service';
import { MallaController } from './malla.controller';
import { ConfigModule } from '@nestjs/config';
import { AvanceModule } from '../avance/avance.module';

@Module({
  imports: [ConfigModule, AvanceModule],
  providers: [MallaService],
  controllers: [MallaController],
})
export class MallaModule { }
