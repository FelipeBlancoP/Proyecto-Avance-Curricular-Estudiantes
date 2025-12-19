import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Simulacion } from './simulacion.entity';
import { Asignatura } from '../../malla/entities/asignatura.entity';

@Entity('simulacion_detalle')
export class SimulacionDetalle {
  
  // PK Compuesta Parte 1
  @PrimaryColumn({ name: 'id_simulacion' })
  idSimulacion: number;

  // PK Compuesta Parte 2
  @PrimaryColumn({ name: 'codigo_asignatura' })
  codigoAsignatura: string;

  // El dato clave: ¿En qué semestre lo puso?
  @Column({ name: 'semestre_simulado' })
  semestreSimulado: number;

  // Relaciones
  @ManyToOne(() => Simulacion, (simulacion) => simulacion.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_simulacion' })
  simulacion: Simulacion;

  @ManyToOne(() => Asignatura, (asignatura) => asignatura.detallesSimulacion)
  @JoinColumn({ name: 'codigo_asignatura' })
  asignatura: Asignatura;
}