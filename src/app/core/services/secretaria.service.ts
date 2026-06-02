// src/app/core/services/secretaria.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReporteResponse } from '../../shared/models/reporte/reporte.model';

@Injectable({ providedIn: 'root' })
export class SecretariaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reportes`;

  obtenerPendientes(): Observable<ReporteResponse[]> {
    return this.http.get<ReporteResponse[]>(`${this.base}/pendientes`);
  }

  obtenerTodosPorAnio(anio: number): Observable<ReporteResponse[]> {
    return this.http.get<ReporteResponse[]>(`${this.base}?anio=${anio}`);
  }

  aprobar(id: number): Observable<ReporteResponse> {
    return this.http.patch<ReporteResponse>(`${this.base}/${id}/validar`, { aprobado: true });
  }

  rechazar(id: number, motivo: string): Observable<ReporteResponse> {
    return this.http.patch<ReporteResponse>(`${this.base}/${id}/validar`, {
      aprobado: false,
      comentariosAdmin: motivo
    });
  }

  obtenerStats(anio: number): Observable<{
    totalProfesores: number;
    aceptados:       number;
    enRevision:      number;
    enCorreccion:    number;
    sinEntregar:     number;
  }> {
    return this.http.get<any>(`${this.base}/stats?anio=${anio}`);
  }
}