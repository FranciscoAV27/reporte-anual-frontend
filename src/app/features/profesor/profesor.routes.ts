// src/app/features/profesor/profesor.routes.ts
// import { Routes } from '@angular/router';

// export const PROFESOR_ROUTES: Routes = [
//   {
//     path: 'dashboard',
//     loadComponent: () =>
//       import('./dashboard/profesor-dashboard.component').then(c => c.ProfesorDashboardComponent)
//   },
//   { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
// ];

// src/app/features/profesor/profesor.routes.ts

import { Routes } from '@angular/router';

export const PROFESOR_ROUTES: Routes = [
  {
    path: 'reporte',
    loadComponent: () =>
      import('./reporte/reporte-form/reporte-form.component').then(c => c.ReporteFormComponent)
  },
  // El dashboard temporal redirige al reporte
  { path: 'dashboard', redirectTo: 'reporte', pathMatch: 'full' },
  { path: '', redirectTo: 'reporte', pathMatch: 'full' }
];