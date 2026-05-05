// src/app/shared/models/reporte/s2/direccion-tesis.model.ts
export type GradoTesis = 'L' | 'M';

export interface DireccionTesisRequest {
  titulo: string;
  nombreAlumno: string;
  grado: GradoTesis;
  avancePorcentaje: number;
  fechaRegistro?: string;
  fechaProgTerm?: string;
  fechaReprogTerm?: string;
}
export interface DireccionTesisResponse extends DireccionTesisRequest {
  id: number;
  reporteId: number;
}