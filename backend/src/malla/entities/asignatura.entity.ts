import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { SimulacionDetalle } from '../../simulacion/entities/simulacion-detalle.entity';

@Entity('asignatura')
export class Asignatura {
  @PrimaryColumn()
  codigo: string; // PK: "INF-101"

  @Column()
  nombre: string; // Guardamos el nombre para mostrarlo directo

  @Column()
  creditos: number; // Guardamos los créditos para sumarlos en el front

  @Column({ name: 'nivel_malla' })
  nivelMalla: number; // Guardamos el nivel original (semestre 1, 2, etc.)

  // Relación con el detalle
  @OneToMany(() => SimulacionDetalle, (detalle) => detalle.asignatura)
  detallesSimulacion: SimulacionDetalle[];
}