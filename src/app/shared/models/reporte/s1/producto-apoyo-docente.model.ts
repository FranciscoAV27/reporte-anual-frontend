// src/app/shared/models/reporte/s1/producto-apoyo-docente.model.ts

export interface ProductoApoyoDocenteRequest {
  numeroCurso: number;
  descripcion: string;
  enlace?: string;
}

export interface ProductoApoyoDocenteResponse extends ProductoApoyoDocenteRequest {
  id: number;
  reporteId: number;
}