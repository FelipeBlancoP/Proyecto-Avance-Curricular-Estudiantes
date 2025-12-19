import { Module } from '@nestjs/common';
import { SimulacionService } from './simulacion.service';
import { SimulacionController } from './simulacion.controller';
import { MallaModule } from '../malla/malla.module';
import { AvanceModule } from '../avance/avance.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Simulacion } from './entities/simulacion.entity';
import { SimulacionDetalle } from './entities/simulacion-detalle.entity';

@Module({
    imports: [
        MallaModule, 
        AvanceModule,
        TypeOrmModule.forFeature([Simulacion, SimulacionDetalle])
    ],
    providers: [SimulacionService],
    controllers: [SimulacionController],
})
export class SimulacionModule { }
