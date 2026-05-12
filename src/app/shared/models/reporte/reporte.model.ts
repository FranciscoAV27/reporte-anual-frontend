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

  // ── Secciones concluidas ──
  seccion1Concluida: boolean;
  seccion2Concluida: boolean;
  seccion3Concluida: boolean;
  seccion4Concluida: boolean;
  seccion5Concluida: boolean;
  seccion6Concluida: boolean;
  seccion7Concluida: boolean;
}