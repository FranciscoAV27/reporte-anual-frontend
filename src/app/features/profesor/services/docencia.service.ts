// src/app/features/profesor/services/docencia.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CursoImpartidoRequest, CursoImpartidoResponse } from '../../../shared/models/reporte/s1/curso-impartido.model';
import { ProductoApoyoDocenteRequest, ProductoApoyoDocenteResponse } from '../../../shared/models/reporte/s1/producto-apoyo-docente.model';
import { AsignaturaAfinidadRequest, AsignaturaAfinidadResponse } from '../../../shared/models/reporte/s1/asignatura-afinidad.model';

@Injectable({ providedIn: 'root' })
export class DocenciaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = (reporteId: number) =>
    `${environment.apiUrl}/reportes/${reporteId}`;

  // ── Cursos impartidos ──────────────────────────────────────
  crearCurso(rId: number, dto: CursoImpartidoRequest): Observable<CursoImpartidoResponse> {
    return this.http.post<CursoImpartidoResponse>(`${this.baseUrl(rId)}/cursos`, dto);
  }
  obtenerCursos(rId: number): Observable<CursoImpartidoResponse[]> {
    return this.http.get<CursoImpartidoResponse[]>(`${this.baseUrl(rId)}/cursos`);
  }
  actualizarCurso(rId: number, id: number, dto: CursoImpartidoRequest): Observable<CursoImpartidoResponse> {
    return this.http.put<CursoImpartidoResponse>(`${this.baseUrl(rId)}/cursos/${id}`, dto);
  }
  eliminarCurso(rId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(rId)}/cursos/${id}`);
  }

  // ── Productos de apoyo docente ─────────────────────────────
  crearProducto(rId: number, dto: ProductoApoyoDocenteRequest): Observable<ProductoApoyoDocenteResponse> {
    return this.http.post<ProductoApoyoDocenteResponse>(`${this.baseUrl(rId)}/productos`, dto);
  }
  obtenerProductos(rId: number): Observable<ProductoApoyoDocenteResponse[]> {
    return this.http.get<ProductoApoyoDocenteResponse[]>(`${this.baseUrl(rId)}/productos`);
  }
  actualizarProducto(rId: number, id: number, dto: ProductoApoyoDocenteRequest): Observable<ProductoApoyoDocenteResponse> {
    return this.http.put<ProductoApoyoDocenteResponse>(`${this.baseUrl(rId)}/productos/${id}`, dto);
  }
  eliminarProducto(rId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(rId)}/productos/${id}`);
  }

  // ── Asignaturas de afinidad ────────────────────────────────
  crearAsignatura(rId: number, dto: AsignaturaAfinidadRequest): Observable<AsignaturaAfinidadResponse> {
    return this.http.post<AsignaturaAfinidadResponse>(`${this.baseUrl(rId)}/asignaturas`, dto);
  }
  obtenerAsignaturas(rId: number): Observable<AsignaturaAfinidadResponse[]> {
    return this.http.get<AsignaturaAfinidadResponse[]>(`${this.baseUrl(rId)}/asignaturas`);
  }
  actualizarAsignatura(rId: number, id: number, dto: AsignaturaAfinidadRequest): Observable<AsignaturaAfinidadResponse> {
    return this.http.put<AsignaturaAfinidadResponse>(`${this.baseUrl(rId)}/asignaturas/${id}`, dto);
  }
  eliminarAsignatura(rId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(rId)}/asignaturas/${id}`);
  }
}