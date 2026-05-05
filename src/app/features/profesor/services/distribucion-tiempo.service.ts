// src/app/features/profesor/services/distribucion-tiempo.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DistribucionTiempoRequest, DistribucionTiempoResponse } from '../../../shared/models/reporte/s7/distribucion-tiempo.model';

@Injectable({ providedIn: 'root' })
export class DistribucionTiempoService {
  private readonly http = inject(HttpClient);
  private readonly base = (rId: number) => `${environment.apiUrl}/reportes/${rId}/distribucion`;

  crear(rId: number, dto: DistribucionTiempoRequest): Observable<DistribucionTiempoResponse> {
    return this.http.post<DistribucionTiempoResponse>(this.base(rId), dto);
  }
  obtener(rId: number): Observable<DistribucionTiempoResponse[]> {
    return this.http.get<DistribucionTiempoResponse[]>(this.base(rId));
  }
  actualizar(rId: number, id: number, dto: DistribucionTiempoRequest): Observable<DistribucionTiempoResponse> {
    return this.http.put<DistribucionTiempoResponse>(`${this.base(rId)}/${id}`, dto);
  }
}