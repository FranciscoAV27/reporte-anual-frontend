// src/app/shared/models/s4/actividad-gestion.model.ts
export interface ActividadGestionRequest {
  numActividad: number;
  nombre: string;
  comisionOPuesto: string;
  periodoInicio?: string;
  periodoFin?: string;
}
export interface ActividadGestionResponse extends ActividadGestionRequest {
  id: number;
  reporteId: number;
}