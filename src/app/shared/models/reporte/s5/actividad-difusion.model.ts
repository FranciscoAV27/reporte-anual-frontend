// src/app/shared/models/s5/actividad-difusion.model.ts
export interface ActividadDifusionRequest {
  numActividad: number;
  nombre: string;
  periodoInicio?: string;
  periodoFin?: string;
}
export interface ActividadDifusionResponse extends ActividadDifusionRequest {
  id: number;
  reporteId: number;
}