import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';
import { MallaModule } from '../malla/malla.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      baseURL: 'https://puclaro.ucn.cl/eross/avance/',
    }), MallaModule,
  ],
  controllers: [EstudianteController],
  providers: [EstudianteService],
  exports: [EstudianteService,]
})
export class EstudianteModule { }
