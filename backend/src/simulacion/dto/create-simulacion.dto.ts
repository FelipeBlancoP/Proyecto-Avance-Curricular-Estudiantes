import { IsString, IsArray, IsNumber, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class CursoSimuladoDto {
  @IsString()
  codigo: string;
}

class SemestreDto {
  @IsNumber()
  id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CursoSimuladoDto)
  cursos: CursoSimuladoDto[];
}

export class CreateSimulacionDto {
  @IsString()
  nombre: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SemestreDto)
  semestres: SemestreDto[];
}