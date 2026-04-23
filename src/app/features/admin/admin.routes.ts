// src/app/features/admin/admin.routes.ts
import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];