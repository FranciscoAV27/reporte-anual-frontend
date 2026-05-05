// src/app/features/profesor/services/gestion-difusion.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ActividadGestionRequest, ActividadGestionResponse } from '../../../shared/models/reporte/s4/actividad-gestion.model';
import { ActividadDifusionRequest, ActividadDifusionResponse } from '../../../shared/models/reporte/s5/actividad-difusion.model';

@Injectable({ providedIn: 'root' })
export class GestionDifusionService {
  private readonly http = inject(HttpClient);
  private readonly base = (rId: number) => `${environment.apiUrl}/reportes/${rId}`;

  // ── Gestión Académica ──────────────────────────────────────
  crearGestion(rId: number, dto: ActividadGestionRequest): Observable<ActividadGestionResponse> {
    return this.http.post<ActividadGestionResponse>(`${this.base(rId)}/gestion`, dto);
  }
  obtenerGestion(rId: number): Observable<ActividadGestionResponse[]> {
    return this.http.get<ActividadGestionResponse[]>(`${this.base(rId)}/gestion`);
  }
  actualizarGestion(rId: number, id: number, dto: ActividadGestionRequest): Observable<ActividadGestionResponse> {
    return this.http.put<ActividadGestionResponse>(`${this.base(rId)}/gestion/${id}`, dto);
  }
  eliminarGestion(rId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base(rId)}/gestion/${id}`);
  }

  // ── Difusión ───────────────────────────────────────────────
  crearDifusion(rId: number, dto: ActividadDifusionRequest): Observable<ActividadDifusionResponse> {
    return this.http.post<ActividadDifusionResponse>(`${this.base(rId)}/difusion`, dto);
  }
  obtenerDifusion(rId: number): Observable<ActividadDifusionResponse[]> {
    return this.http.get<ActividadDifusionResponse[]>(`${this.base(rId)}/difusion`);
  }
  actualizarDifusion(rId: number, id: number, dto: ActividadDifusionRequest): Observable<ActividadDifusionResponse> {
    return this.http.put<ActividadDifusionResponse>(`${this.base(rId)}/difusion/${id}`, dto);
  }
  eliminarDifusion(rId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base(rId)}/difusion/${id}`);
  }
}