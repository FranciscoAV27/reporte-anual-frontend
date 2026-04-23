// src/app/features/jefe-carrera/jefe-carrera.routes.ts
import { Routes } from '@angular/router';

export const JEFE_ROUTES: Routes = [
  {
    path: 'panel',
    loadComponent: () =>
      import('./panel/jefe-carrera-panel.component').then(c => c.JefeCarreraPanelComponent)
  },
  { path: '', redirectTo: 'panel', pathMatch: 'full' }
];