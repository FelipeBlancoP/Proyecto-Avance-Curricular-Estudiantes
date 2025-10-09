import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MallaModule } from './malla/malla.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), MallaModule],
})
export class AppModule {}


