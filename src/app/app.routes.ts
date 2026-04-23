// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(r => r.AUTH_ROUTES)
  },
  {
    path: 'profesor',
    canActivate: [authGuard],
    loadChildren: () => import('./features/profesor/profesor.routes').then(r => r.PROFESOR_ROUTES)
  },
  {
    path: 'secretaria',
    canActivate: [authGuard],
    loadChildren: () => import('./features/secretaria/secretaria.routes').then(r => r.SECRETARIA_ROUTES)
  },
  {
    path: 'jefe-carrera',
    canActivate: [authGuard],
    loadChildren: () => import('./features/jefe-carrera/jefe-carrera.routes').then(r => r.JEFE_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(r => r.ADMIN_ROUTES)
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];