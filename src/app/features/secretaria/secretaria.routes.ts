// src/app/features/secretaria/secretaria.routes.ts
// import { Routes } from '@angular/router';

// export const SECRETARIA_ROUTES: Routes = [
//   {
//     path: 'dashboard',
//     loadComponent: () =>
//       import('./dashboard/secretaria-dashboard.component').then(c => c.SecretariaDashboardComponent)
//   },
//   { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
// ];

import { Routes } from '@angular/router';
import { SecretariaDashboardComponent } from './dashboard/secretaria-dashboard.component';

export const SECRETARIA_ROUTES: Routes = [
  { path: 'dashboard', component: SecretariaDashboardComponent }
];