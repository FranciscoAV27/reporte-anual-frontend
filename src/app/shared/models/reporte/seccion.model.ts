// src/app/shared/models/reporte/seccion.model.ts
export interface SeccionInfo {
  numero: number;
  label: string;
  labelCorto: string;
}

export const SECCIONES: SeccionInfo[] = [
  { numero: 1, label: 'Docencia',                              labelCorto: '1. Docencia' },
  { numero: 2, label: 'Formación de Recursos Humanos',         labelCorto: '2. RR.HH.' },
  { numero: 3, label: 'Investigación',                         labelCorto: '3. Investigación' },
  { numero: 4, label: 'Gestión Académica',                     labelCorto: '4. Gestión' },
  { numero: 5, label: 'Difusión',                              labelCorto: '5. Difusión' },
  { numero: 6, label: 'Comentarios Generales',                 labelCorto: '6. Comentarios' },
  { numero: 7, label: 'Distribución de Tiempo',                labelCorto: '7. Distribución' },
];