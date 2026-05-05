// src/app/features/profesor/services/investigacion.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProyectoInvestigacionRequest, ProyectoInvestigacionResponse } from '../../../shared/models/reporte/s3/proyecto-investigacion.model';
import { IndicadorProyectoRequest, IndicadorProyectoResponse } from '../../../shared/models/reporte/s3/indicador-proyecto.model';
import { PublicacionRequest, PublicacionResponse } from '../../../shared/models/reporte/s3/publicacion.model';
import { ActividadDesarrolloRequest, ActividadDesarrolloResponse } from '../../../shared/models/reporte/s3/actividad-desarrollo.model';

@Injectable({ providedIn: 'root' })
export class InvestigacionService {
  private readonly http = inject(HttpClient);
  private readonly base  = (rId: number) => `${environment.apiUrl}/reportes/${rId}`;
  private readonly baseP = (pId: number) => `${environment.apiUrl}/proyectos/${pId}`;

  // ── Proyectos ──────────────────────────────────────────────
  crearProyecto(rId: number, dto: ProyectoInvestigacionRequest): Observable<ProyectoInvestigacionResponse> {
    return this.http.post<ProyectoInvestigacionResponse>(`${this.base(rId)}/proyectos`, dto);
  }
  obtenerProyectos(rId: number): Observable<ProyectoInvestigacionResponse[]> {
    return this.http.get<ProyectoInvestigacionResponse[]>(`${this.base(rId)}/proyectos`);
  }
  actualizarProyecto(rId: number, id: number, dto: ProyectoInvestigacionRequest): Observable<ProyectoInvestigacionResponse> {
    return this.http.put<ProyectoInvestigacionResponse>(`${this.base(rId)}/proyectos/${id}`, dto);
  }
  eliminarProyecto(rId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base(rId)}/proyectos/${id}`);
  }

  // ── Indicadores (URL distinta: /api/proyectos/{proyectoId}/indicadores) ──
  crearIndicador(proyectoId: number, dto: IndicadorProyectoRequest): Observable<IndicadorProyectoResponse> {
    return this.http.post<IndicadorProyectoResponse>(`${this.baseP(proyectoId)}/indicadores`, dto);
  }
  obtenerIndicadores(proyectoId: number): Observable<IndicadorProyectoResponse[]> {
    return this.http.get<IndicadorProyectoResponse[]>(`${this.baseP(proyectoId)}/indicadores`);
  }
  actualizarIndicador(proyectoId: number, id: number, dto: IndicadorProyectoRequest): Observable<IndicadorProyectoResponse> {
    return this.http.put<IndicadorProyectoResponse>(`${this.baseP(proyectoId)}/indicadores/${id}`, dto);
  }
  eliminarIndicador(proyectoId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseP(proyectoId)}/indicadores/${id}`);
  }

  // ── Publicaciones ──────────────────────────────────────────
  crearPublicacion(rId: number, dto: PublicacionRequest): Observable<PublicacionResponse> {
    return this.http.post<PublicacionResponse>(`${this.base(rId)}/publicaciones`, dto);
  }
  obtenerPublicaciones(rId: number): Observable<PublicacionResponse[]> {
    return this.http.get<PublicacionResponse[]>(`${this.base(rId)}/publicaciones`);
  }
  actualizarPublicacion(rId: number, id: number, dto: PublicacionRequest): Observable<PublicacionResponse> {
    return this.http.put<PublicacionResponse>(`${this.base(rId)}/publicaciones/${id}`, dto);
  }
  eliminarPublicacion(rId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base(rId)}/publicaciones/${id}`);
  }

  // ── Actividades de desarrollo ──────────────────────────────
  crearDesarrollo(rId: number, dto: ActividadDesarrolloRequest): Observable<ActividadDesarrolloResponse> {
    return this.http.post<ActividadDesarrolloResponse>(`${this.base(rId)}/desarrollo`, dto);
  }
  obtenerDesarrollo(rId: number): Observable<ActividadDesarrolloResponse[]> {
    return this.http.get<ActividadDesarrolloResponse[]>(`${this.base(rId)}/desarrollo`);
  }
  actualizarDesarrollo(rId: number, id: number, dto: ActividadDesarrolloRequest): Observable<ActividadDesarrolloResponse> {
    return this.http.put<ActividadDesarrolloResponse>(`${this.base(rId)}/desarrollo/${id}`, dto);
  }
  eliminarDesarrollo(rId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base(rId)}/desarrollo/${id}`);
  }
}