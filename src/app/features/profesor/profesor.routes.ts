// src/app/features/profesor/profesor.routes.ts
import { Routes } from '@angular/router';

export const PROFESOR_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/profesor-dashboard.component').then(c => c.ProfesorDashboardComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];