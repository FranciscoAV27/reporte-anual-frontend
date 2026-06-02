// src/app/shared/models/periodo.model.ts
export type EstadoPeriodo = 'ACTIVO' | 'CERRADO';

export interface PeriodoResponse {
  id:            number;
  anio:          number;
  nombre:        string;
  fechaApertura: string;
  fechaLimite:   string;
  estado:        EstadoPeriodo;
  instrucciones: string | null;
  creadoEn:      string;
  cerradoEn:     string | null;
  
  creadoPorNombre:     string | null;
  creadoPorApellidos:  string | null;
}

export interface PeriodoRequest {
  fechaApertura: string;
  fechaLimite:   string;
  instrucciones: string | null;
}