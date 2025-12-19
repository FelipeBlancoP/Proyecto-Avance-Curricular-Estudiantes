import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { SimulacionDetalle } from '../../simulacion/entities/simulacion-detalle.entity';

@Entity('asignatura')
export class Asignatura {
  @PrimaryColumn()
  codigo: string;

  @Column()
  nombre: string;

  @Column()
  creditos: number;

  @Column({ name: 'nivel_malla' })
  nivelMalla: number;

  @OneToMany(() => SimulacionDetalle, (detalle) => detalle.asignatura)
  detallesSimulacion: SimulacionDetalle[];
}