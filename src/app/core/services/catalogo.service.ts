// src/app/core/services/catalogo.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CarreraResponse, AsignaturaResponse } from '../../shared/models/catalogo.model';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  obtenerCarreras(): Observable<CarreraResponse[]> {
    return this.http.get<CarreraResponse[]>(`${this.base}/carreras`);
  }

    obtenerAsignaturasPorCarrera(carreraId: number): Observable<AsignaturaResponse[]> {
        return this.http.get<AsignaturaResponse[]>(
            `${this.base}/carreras/${carreraId}/asignaturas` // ← cambió
        );
    }
}