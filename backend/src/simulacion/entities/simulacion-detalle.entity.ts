import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Simulacion } from './simulacion.entity';
import { Asignatura } from '../../malla/entities/asignatura.entity';

@Entity('simulacion_detalle')
export class SimulacionDetalle {
  
  @PrimaryColumn({ name: 'id_simulacion' })
  idSimulacion: number;

  @PrimaryColumn({ name: 'codigo_asignatura' })
  codigoAsignatura: string;

  @Column({ name: 'semestre_simulado' })
  semestreSimulado: number;

  @ManyToOne(() => Simulacion, (simulacion) => simulacion.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_simulacion' })
  simulacion: Simulacion;

  @ManyToOne(() => Asignatura, (asignatura) => asignatura.detallesSimulacion)
  @JoinColumn({ name: 'codigo_asignatura' })
  asignatura: Asignatura;
}