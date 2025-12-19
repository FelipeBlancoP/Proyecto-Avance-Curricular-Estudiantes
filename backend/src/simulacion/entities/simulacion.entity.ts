import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Estudiante } from '../../estudiante/entities/estudiante.entity';
import { SimulacionDetalle } from './simulacion-detalle.entity';

@Entity('simulacion')
export class Simulacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rut_estudiante' })
  rutEstudiante: string;

  @Column()
  nombre: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @ManyToOne(() => Estudiante, (estudiante) => estudiante.simulaciones)
  @JoinColumn({ name: 'rut_estudiante' })
  estudiante: Estudiante;

  @OneToMany(() => SimulacionDetalle, (detalle) => detalle.simulacion, { cascade: true })
  detalles: SimulacionDetalle[];
}