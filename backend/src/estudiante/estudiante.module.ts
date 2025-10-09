import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EstudianteService } from './estudiante.service';
import { EstudianteController } from './estudiante.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      baseURL: 'https://puclaro.ucn.cl/eross/avance/',
    }),
  ],
  controllers: [EstudianteController],
  providers: [EstudianteService],
  exports: [EstudianteService,]
})
export class EstudianteModule {}
