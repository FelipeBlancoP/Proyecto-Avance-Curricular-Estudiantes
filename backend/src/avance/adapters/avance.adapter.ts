import { Avance as AvanceAPI } from '../dto/avance-api.interface';
import { Avance } from '../domain/avance.model';

export function toAvanceDomain(apiData: AvanceAPI): Avance {
  return {
    nrc: apiData.nrc,
    period: apiData.period,
    student: apiData.student,
    course: apiData.course,         
    excluded: apiData.excluded,     
    inscriptionType: apiData.inscriptionType,
    status: apiData.status
  };
}

export function toAvancesDomain(apiData: AvanceAPI[]): Avance[] {
  return apiData.map(toAvanceDomain);
}