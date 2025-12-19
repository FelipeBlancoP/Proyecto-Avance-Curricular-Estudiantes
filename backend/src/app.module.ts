import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MallaModule } from './malla/malla.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EstudianteModule } from './estudiante/estudiante.module';
import { AvanceModule } from './avance/avance.module';
import { AuthModule } from './auth/auth.module';
import { SimulacionModule } from './simulacion/simulacion.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'admin_malla',    // Mismo del docker-compose
      password: 'password123',    // Mismo del docker-compose
      database: 'malla_db',       // Mismo del docker-compose
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Carga automática de entidades
      synchronize: true, // IMPORTANTE: Crea las tablas automáticamente (solo para dev)
    }),
    EstudianteModule, ConfigModule.forRoot({ isGlobal: true }), MallaModule, AuthModule, AvanceModule, SimulacionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }


