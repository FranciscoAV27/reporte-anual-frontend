// src/app/shared/models/s1/curso-impartido.model.ts

export interface CursoImpartidoRequest {
  numeroCurso: number;
  carrera: string;
  asignatura: string;
  semestre: number;
  cicloEscolar: string;
  horasSemana: number;
  numAlumnos: number;
}

export interface CursoImpartidoResponse extends CursoImpartidoRequest {
  id: number;
  reporteId: number;
}