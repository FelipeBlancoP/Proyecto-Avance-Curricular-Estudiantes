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
      username: 'admin_malla',    
      password: 'password123',    
      database: 'malla_db',       
      entities: [__dirname + '/**/*.entity{.ts,.js}'], 
      synchronize: true, 
    }),
    EstudianteModule, ConfigModule.forRoot({ isGlobal: true }), MallaModule, AuthModule, AvanceModule, SimulacionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }


