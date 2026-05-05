// src/app/shared/models/reporte/s2/tutoria.model.ts
export interface TutoriaRequest {
  nombreAlumno: string;
  carrera: string;
  semestre: number;
  fechaRegistro: string;
}
export interface TutoriaResponse extends TutoriaRequest {
  id: number;
  reporteId: number;
}