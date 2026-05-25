// src/app/features/profesor/pdf/reporte-pdf.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteResponse } from '../../../shared/models/reporte/reporte.model';
import { CursoImpartidoResponse } from '../../../shared/models/reporte/s1/curso-impartido.model';
import { ProductoApoyoDocenteResponse } from '../../../shared/models/reporte/s1/producto-apoyo-docente.model';
import { AsignaturaAfinidadResponse } from '../../../shared/models/reporte/s1/asignatura-afinidad.model';
import { TutoriaResponse } from '../../../shared/models/reporte/s2/tutoria.model';
import { DireccionTesisResponse } from '../../../shared/models/reporte/s2/direccion-tesis.model';
import { ProyectoInvestigacionResponse } from '../../../shared/models/reporte/s3/proyecto-investigacion.model';
import { IndicadorProyectoResponse } from '../../../shared/models/reporte/s3/indicador-proyecto.model';
import { PublicacionResponse } from '../../../shared/models/reporte/s3/publicacion.model';
import { ActividadDesarrolloResponse } from '../../../shared/models/reporte/s3/actividad-desarrollo.model';
import { ActividadGestionResponse } from '../../../shared/models/reporte/s4/actividad-gestion.model';
import { ActividadDifusionResponse } from '../../../shared/models/reporte/s5/actividad-difusion.model';
import { DistribucionTiempoResponse } from '../../../shared/models/reporte/s7/distribucion-tiempo.model';

@Component({
  selector: 'app-reporte-pdf',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporte-pdf.component.html',
  styleUrls: ['./reporte-pdf.component.css']
})
export class ReportePdfComponent {
  @Input() reporte!:       ReporteResponse;
  @Input() cursos:         CursoImpartidoResponse[]       = [];
  @Input() productos:      ProductoApoyoDocenteResponse[] = [];
  @Input() asignaturas:    AsignaturaAfinidadResponse[]   = [];
  @Input() tutorias:       TutoriaResponse[]              = [];
  @Input() tesis:          DireccionTesisResponse[]       = [];
  @Input() proyectos:      ProyectoInvestigacionResponse[] = [];
  @Input() indicadores:    IndicadorProyectoResponse[]    = [];
  @Input() publicaciones:  PublicacionResponse[]          = [];
  @Input() desarrollo:     ActividadDesarrolloResponse[]  = [];
  @Input() gestion:        ActividadGestionResponse[]     = [];
  @Input() difusion:       ActividadDifusionResponse[]    = [];
  @Input() distribucion:   DistribucionTiempoResponse[]   = [];

  getIndicadoresPorProyecto(numProyecto: number): IndicadorProyectoResponse[] {
    return this.indicadores.filter(i => i.numProyecto === numProyecto);
  }

  get totalOi(): number {
    return this.distribucion.reduce((s, f) => s + (f.horasCicloOi ?? 0), 0);
  }
  get totalPv(): number {
    return this.distribucion.reduce((s, f) => s + (f.horasCicloPv ?? 0), 0);
  }
  get totalVerano(): number {
    return this.distribucion.reduce((s, f) => s + (f.horasVerano ?? 0), 0);
  }
}