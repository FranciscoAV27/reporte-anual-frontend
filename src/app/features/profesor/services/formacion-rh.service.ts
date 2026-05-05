// src/app/features/profesor/services/formacion-rh.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TutoriaRequest, TutoriaResponse } from '../../../shared/models/reporte/s2/tutoria.model';
import { DireccionTesisRequest, DireccionTesisResponse } from '../../../shared/models/reporte/s2/direccion-tesis.model';

@Injectable({ providedIn: 'root' })
export class FormacionRhService {
  private readonly http = inject(HttpClient);
  private readonly base = (rId: number) => `${environment.apiUrl}/reportes/${rId}`;

  // ── Tutorías ───────────────────────────────────────────────
  crearTutoria(rId: number, dto: TutoriaRequest): Observable<TutoriaResponse> {
    return this.http.post<TutoriaResponse>(`${this.base(rId)}/tutorias`, dto);
  }
  obtenerTutorias(rId: number): Observable<TutoriaResponse[]> {
    return this.http.get<TutoriaResponse[]>(`${this.base(rId)}/tutorias`);
  }
  actualizarTutoria(rId: number, id: number, dto: TutoriaRequest): Observable<TutoriaResponse> {
    return this.http.put<TutoriaResponse>(`${this.base(rId)}/tutorias/${id}`, dto);
  }
  eliminarTutoria(rId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base(rId)}/tutorias/${id}`);
  }

  // ── Dirección de tesis ─────────────────────────────────────
  crearTesis(rId: number, dto: DireccionTesisRequest): Observable<DireccionTesisResponse> {
    return this.http.post<DireccionTesisResponse>(`${this.base(rId)}/tesis`, dto);
  }
  obtenerTesis(rId: number): Observable<DireccionTesisResponse[]> {
    return this.http.get<DireccionTesisResponse[]>(`${this.base(rId)}/tesis`);
  }
  actualizarTesis(rId: number, id: number, dto: DireccionTesisRequest): Observable<DireccionTesisResponse> {
    return this.http.put<DireccionTesisResponse>(`${this.base(rId)}/tesis/${id}`, dto);
  }
  eliminarTesis(rId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base(rId)}/tesis/${id}`);
  }
}