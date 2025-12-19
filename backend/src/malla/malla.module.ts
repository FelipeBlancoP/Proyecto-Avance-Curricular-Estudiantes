import { Module } from '@nestjs/common';
import { MallaService } from './malla.service';
import { MallaController } from './malla.controller';
import { ConfigModule } from '@nestjs/config';
import { AvanceModule } from '../avance/avance.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asignatura } from './entities/asignatura.entity';

@Module({
  imports: [ConfigModule, AvanceModule, TypeOrmModule.forFeature([Asignatura])],
  providers: [MallaService],
  controllers: [MallaController],
  exports: [MallaService],
})
export class MallaModule { }
