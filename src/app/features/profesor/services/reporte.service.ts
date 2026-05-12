// src/app/features/profesor/services/reporte.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReporteRequest, ReporteResponse } from '../../../shared/models/reporte/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reportes`;

  crear(dto: ReporteRequest): Observable<ReporteResponse> {
    return this.http.post<ReporteResponse>(this.base, dto);
  }

  guardarBorrador(id: number, dto: ReporteRequest): Observable<ReporteResponse> {
    return this.http.put<ReporteResponse>(`${this.base}/${id}/borrador`, dto);
  }

  enviarARevision(id: number): Observable<ReporteResponse> {
    return this.http.patch<ReporteResponse>(`${this.base}/${id}/enviar`, {});
  }

  obtenerMisReportes(): Observable<ReporteResponse[]> {
    return this.http.get<ReporteResponse[]>(`${this.base}/mis-reportes`);
  }

  obtenerPorId(id: number): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.base}/${id}`);
  }

  toggleSeccion(id: number, numSeccion: number): Observable<ReporteResponse> {
    return this.http.patch<ReporteResponse>(
      `${this.base}/${id}/seccion/${numSeccion}/concluir`, {}
    );
  }
}