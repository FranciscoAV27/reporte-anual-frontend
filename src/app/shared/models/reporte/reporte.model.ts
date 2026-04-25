// src/app/shared/models/reporte/reporte.model.ts

export type EstadoReporte = 'BORRADOR' | 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';

export interface ReporteRequest {
  anio: number;
  problemasDocencia?: string;
  oportunidadesDocencia?: string;
  problemasInvestigacion?: string;
  oportunidadesInvestigacion?: string;
  comentariosGenerales?: string;
}

export interface ReporteResponse {
  id: number;
  profesorId: number;
  profesorNombre: string;
  anio: number;
  estado: EstadoReporte;
  comentariosAdmin?: string;
  problemasDocencia?: string;
  oportunidadesDocencia?: string;
  problemasInvestigacion?: string;
  oportunidadesInvestigacion?: string;
  comentariosGenerales?: string;
  creadoEn: string;
  actualizadoEn: string;
  enviadoEn?: string;
  aprobadoEn?: string;
}