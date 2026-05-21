// src/app/shared/models/catalogo.model.ts
export interface CarreraResponse {
  id: number;
  nombre: string;
  clave: string;
}

export interface AsignaturaResponse {
  id: number;
  carreraId: number;
  semestre: number;
  nombre: string;
}