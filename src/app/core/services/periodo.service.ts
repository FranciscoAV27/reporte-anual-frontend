// src/app/core/services/periodo.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PeriodoResponse, PeriodoRequest } from '../../shared/models/periodo.model';

@Injectable({ providedIn: 'root' })
export class PeriodoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/periodos`;

  obtenerActivo(): Observable<PeriodoResponse> {
    return this.http.get<PeriodoResponse>(`${this.base}/activo`);
  }

  iniciar(dto: PeriodoRequest): Observable<PeriodoResponse> {
    return this.http.post<PeriodoResponse>(this.base, dto);
  }

  editar(id: number, dto: PeriodoRequest): Observable<PeriodoResponse> {
    return this.http.put<PeriodoResponse>(`${this.base}/${id}`, dto);
  }

  cerrar(id: number): Observable<PeriodoResponse> {
    return this.http.patch<PeriodoResponse>(`${this.base}/${id}/cerrar`, {});
  }
}