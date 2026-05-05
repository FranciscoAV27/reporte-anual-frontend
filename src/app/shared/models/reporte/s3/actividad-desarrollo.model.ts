// src/app/shared/models/reporte/s3/actividad-desarrollo.model.ts
export interface ActividadDesarrolloRequest {
  numActividad: number;
  actividad: string;
  institucionSolicitante: string;
  horasRequeridas: number;
  producto?: string;
}
export interface ActividadDesarrolloResponse extends ActividadDesarrolloRequest {
  id: number;
  reporteId: number;
}