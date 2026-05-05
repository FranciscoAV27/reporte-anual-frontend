// src/app/shared/models/s7/distribucion-tiempo.model.ts
export interface DistribucionTiempoRequest {
  actividadAcademica: string;
  orden: number;
  horasCicloOi: number;
  horasCicloPv: number;
  horasVerano: number;
}

export interface DistribucionTiempoResponse extends DistribucionTiempoRequest {
  id: number;
  reporteId: number;
}

// Filas predefinidas del formato oficial
export const FILAS_DISTRIBUCION = [
  { orden: 1.1, actividadAcademica: '1.1 Clases frente a grupo' },
  { orden: 1.2, actividadAcademica: '1.2 Apoyo docente: asesoría, elaboración de material didáctico, preparación de clases, etc.' },
  { orden: 2.1, actividadAcademica: '2.1 Tutorías' },
  { orden: 2.2, actividadAcademica: '2.2 Dirección de tesis' },
  { orden: 3.0, actividadAcademica: '3. Investigación y/o promoción al desarrollo' },
  { orden: 4.0, actividadAcademica: '4. Gestión académica (comisiones, puestos, etc.)' },
  { orden: 5.0, actividadAcademica: '5. Difusión' },
];