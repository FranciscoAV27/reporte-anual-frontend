// src/app/core/services/auth.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, AuthResponse } from '../../shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly TOKEN_KEY = 'auth_token';
  private readonly ROL_KEY = 'auth_rol';

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => this.guardarSesion(response))
      );
  }

  private guardarSesion(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.ROL_KEY, response.rol);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRol(): string | null {
    return localStorage.getItem(this.ROL_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROL_KEY);
    this.router.navigate(['/auth/login']);
  }

  redirigirSegunRol(): void {
    const rutas: Record<string, string> = {
      PROFESOR: '/profesor/dashboard',
      SECRETARIA: '/secretaria/dashboard',
      JEFE_CARRERA: '/jefe-carrera/panel',
      ADMIN: '/admin/dashboard',
    };
    const rol = this.getRol() ?? '';
    const destino = rutas[rol] ?? '/auth/login';
    this.router.navigate([destino]);
  }
}