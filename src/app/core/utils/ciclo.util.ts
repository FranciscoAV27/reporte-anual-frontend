// src/app/core/utils/ciclo.util.ts
export function calcularAnioCiclo(fecha = new Date()): number {
  return fecha.getMonth() >= 9 // octubre = mes 9 (0-indexed)
    ? fecha.getFullYear() + 1
    : fecha.getFullYear();
}

export function nombreCiclo(anio: number): string {
  return `${anio - 1}-${anio}`;
}