// src/app/shared/models/reporte/s3/publicacion.model.ts
export type FasePublicacion = 'P' | 'A' | 'R';

export interface PublicacionRequest {
  numPublicacion: number;
  titulo: string;
  revista: string;
  fase: FasePublicacion;
  anio: number;
}
export interface PublicacionResponse extends PublicacionRequest {
  id: number;
  reporteId: number;
}