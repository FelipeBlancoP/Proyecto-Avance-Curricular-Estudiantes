import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MallaModule } from './malla/malla.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EstudianteModule } from './estudiante/estudiante.module';
import { AvanceModule } from './avance/avance.module';
import { AuthModule } from './auth/auth.module';
import { SimulacionModule } from './simulacion/simulacion.module';

@Module({
  imports: [EstudianteModule, ConfigModule.forRoot({ isGlobal: true }), MallaModule, AuthModule, AvanceModule, SimulacionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }


