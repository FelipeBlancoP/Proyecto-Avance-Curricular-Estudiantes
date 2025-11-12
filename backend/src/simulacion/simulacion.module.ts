import { Module } from '@nestjs/common';
import { SimulacionService } from './simulacion.service';
import { SimulacionController } from './simulacion.controller';
import { MallaModule } from '../malla/malla.module';
import { AvanceModule } from '../avance/avance.module';

@Module({
    imports: [MallaModule, AvanceModule],
    providers: [SimulacionService],
    controllers: [SimulacionController],
})
export class SimulacionModule { }
