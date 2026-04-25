// src/app/shared/models/reporte/s1/asignatura-afinidad.model.ts

export interface AsignaturaAfinidadRequest {
  numAsignatura: number;
  carrera: string;
  asignatura: string;
  semestre: number;
}

export interface AsignaturaAfinidadResponse extends AsignaturaAfinidadRequest {
  id: number;
  reporteId: number;
}