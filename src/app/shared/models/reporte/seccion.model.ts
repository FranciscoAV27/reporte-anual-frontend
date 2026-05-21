// src/app/shared/models/reporte/seccion.model.ts
export interface SeccionInfo {
  numero: number;
  label: string;
  labelCorto: string;
  descripcion: string;
}

export const SECCIONES: SeccionInfo[] = [
  { numero: 1, label: 'Docencia',                       labelCorto: '1. Docencia',      descripcion: 'Registra los cursos que impartiste, productos de apoyo docente y asignaturas de mayor afinidad.' },
  { numero: 2, label: 'Formación de Recursos Humanos',  labelCorto: '2. RR.HH.',        descripcion: 'Registra las tutorías atendidas y las tesis que diriges o co-diriges.' },
  { numero: 3, label: 'Investigación',                  labelCorto: '3. Investigación', descripcion: 'Registra tus proyectos de investigación activos, publicaciones y actividades de promoción al desarrollo.' },
  { numero: 4, label: 'Gestión Académica',              labelCorto: '4. Gestión',       descripcion: 'Registra las comisiones, cargos o actividades de gestión académica que realizaste.' },
  { numero: 5, label: 'Difusión',                       labelCorto: '5. Difusión',      descripcion: 'Registra las actividades de difusión del conocimiento que llevaste a cabo.' },
  { numero: 6, label: 'Comentarios Generales',          labelCorto: '6. Comentarios',   descripcion: 'Añade un resumen general de tus actividades y cualquier comentario relevante para el coordinador.' },
  { numero: 7, label: 'Distribución de Tiempo',         labelCorto: '7. Distribución',  descripcion: 'Distribuye el promedio de horas semanales que dedicaste a cada actividad académica en los tres periodos.' },
];