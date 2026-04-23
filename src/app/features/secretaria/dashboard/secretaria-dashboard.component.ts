// src/app/features/secretaria/dashboard/secretaria-dashboard.component.ts

import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-secretaria-dashboard',
  standalone: true,
  template: `
    <div style="padding: 40px; font-family: sans-serif;">
      <h1>Bienvenido, {{ rol }}</h1>
      <button (click)="logout()">Cerrar sesión</button>
    </div>
  `,
})
export class SecretariaDashboardComponent {
  private authService = inject(AuthService);
  rol = this.authService.getRol();
  logout() { this.authService.logout(); }
}