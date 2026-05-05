// src/app/shared/models/reporte/s3/indicador-proyecto.model.ts
export interface IndicadorProyectoRequest {
  numProyecto: number;
  numIndicador: number;
  descripcion: string;
}
export interface IndicadorProyectoResponse extends IndicadorProyectoRequest {
  id: number;
  proyectoId: number;
}