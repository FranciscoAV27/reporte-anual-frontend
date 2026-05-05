// src/app/shared/models/reporte/s3/proyecto-investigacion.model.ts
export type ResponsabilidadProyecto = 'D' | 'C' | 'O';
export type FaseAprobacion         = 'PEU' | 'PEE';
export type InstanciaProyecto      = 'C' | 'P' | 'O';

export interface ProyectoInvestigacionRequest {
  numProyecto: number;
  titulo: string;
  responsabilidad: ResponsabilidadProyecto;
  faseAprobacion: FaseAprobacion;
  instancia: InstanciaProyecto;
  fechaInicio?: string;
  fechaTerminacion?: string;
  fechaReprog?: string;
  avancePorcentaje: number;
}
export interface ProyectoInvestigacionResponse extends ProyectoInvestigacionRequest {
  id: number;
  reporteId: number;
}