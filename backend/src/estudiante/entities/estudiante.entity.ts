import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Simulacion } from '../../simulacion/entities/simulacion.entity';

@Entity('estudiante')
export class Estudiante {
  @PrimaryColumn()
  rut: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'nombre_completo', nullable: true })
  nombreCompleto: string;

  @OneToMany(() => Simulacion, (simulacion) => simulacion.estudiante)
  simulaciones: Simulacion[];
}