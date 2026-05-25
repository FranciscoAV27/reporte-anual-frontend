// src/app/features/profesor/reporte-form/reporte-form.component.ts
import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ReporteService } from '../../services/reporte.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ReporteResponse } from '../../../../shared/models/reporte/reporte.model';
import { SECCIONES } from '../../../../shared/models/reporte/seccion.model';
import { DocenciaComponent } from '../sections/docencia/docencia.component';
import { FormacionRhComponent } from '../sections/formacion-rh/formacion-rh.component';
import { InvestigacionComponent } from '../sections/investigacion/investigacion.component';
import { GestionAcademicaComponent } from '../sections/gestion-academica/gestion-academica.component';
import { DifusionComponent } from '../sections/difusion/difusion.component';
import { ComentariosComponent } from '../sections/comentarios/comentarios.component';
import { DistribucionTiempoComponent } from '../sections/distribucion-tiempo/distribucion-tiempo.component';

// import { PdfService } from '../../../../core/services/pdf.service';
// import { ReportePdfComponent } from '../../pdf/reporte-pdf.component';
// import { DocenciaService } from '../../services/docencia.service';
// import { FormacionRhService } from '../../services/formacion-rh.service';
// import { InvestigacionService } from '../../services/investigacion.service';
// import { GestionDifusionService } from '../../services/gestion-difusion.service';
// import { DistribucionTiempoService } from '../../services/distribucion-tiempo.service';
// import { forkJoin } from 'rxjs';

// Agrega estos imports:
import { PdfService, DatosPdf } from '../../../../core/services/pdf.service';
import { DocenciaService } from '../../services/docencia.service';
import { FormacionRhService } from '../../services/formacion-rh.service';
import { InvestigacionService } from '../../services/investigacion.service';
import { GestionDifusionService } from '../../services/gestion-difusion.service';
import { DistribucionTiempoService } from '../../services/distribucion-tiempo.service';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
//import { ReportePdfComponent } from '../../pdf/reporte-pdf.component';


type Vista = 'home' | 'form' | 'historial';

@Component({
  selector: 'app-reporte-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DocenciaComponent, FormacionRhComponent, InvestigacionComponent,
    GestionAcademicaComponent, DifusionComponent,
    ComentariosComponent, DistribucionTiempoComponent
  ],
  templateUrl: './reporte-form.component.html',
  styleUrls: ['./reporte-form.component.css']
})
export class ReporteFormComponent implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly authService    = inject(AuthService);
  private readonly fb             = inject(FormBuilder);
  private readonly cdr            = inject(ChangeDetectorRef);
  private readonly ngZone         = inject(NgZone);

  // Inyecta los servicios:
  private readonly pdfService          = inject(PdfService);
  private readonly docenciaService     = inject(DocenciaService);
  private readonly formacionRhService  = inject(FormacionRhService);
  private readonly investigacionService= inject(InvestigacionService);
  private readonly gestionDifService   = inject(GestionDifusionService);
  private readonly distribucionService = inject(DistribucionTiempoService);

  reporte: ReporteResponse | null = null;
  cargando  = true;
  enviando  = false;
  errorMsg  = '';
  toastMsg  = '';
  toastTipo = '';
  mostrarModalEnvio = false;

  vistaActiva: Vista = 'home';
  seccionActiva = 0; // 0–6

  // Estado del PDF
  // datosPdf: any = null;
  generandoPdf = false;

  readonly secciones   = SECCIONES;
  readonly anioActual  = new Date().getFullYear();

  textosForm: FormGroup = this.fb.group({
    problemasDocencia:          [''],
    oportunidadesDocencia:      [''],
    problemasInvestigacion:     [''],
    oportunidadesInvestigacion: [''],
    comentariosGenerales:       [''],
  });

  // ── Init ──────────────────────────────────────────────────
  ngOnInit(): void {
    this.reporteService.obtenerMisReportes().subscribe({
      next: (reportes) => {
        const existente = reportes.find(r => r.anio === this.anioActual);
        if (existente) {
          this.reporte = existente;
          this.poblarTextos(existente);
        } else {
          this.reporteService.crear({ anio: this.anioActual }).subscribe({
            next: (nuevo) => {
              this.ngZone.run(() => { this.reporte = nuevo; this.cargando = false; this.cdr.detectChanges(); });
            },
            error: (err) => {
              this.ngZone.run(() => { this.errorMsg = `No se pudo crear el reporte. (${err.status})`; this.cargando = false; this.cdr.detectChanges(); });
            }
          });
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.ngZone.run(() => { this.errorMsg = `Error al cargar reportes. (${err.status})`; this.cargando = false; this.cdr.detectChanges(); });
      }
    });
  }

  private poblarTextos(r: ReporteResponse): void {
    this.textosForm.patchValue({
      problemasDocencia:          r.problemasDocencia          ?? '',
      oportunidadesDocencia:      r.oportunidadesDocencia      ?? '',
      problemasInvestigacion:     r.problemasInvestigacion     ?? '',
      oportunidadesInvestigacion: r.oportunidadesInvestigacion ?? '',
      comentariosGenerales:       r.comentariosGenerales       ?? '',
    });
  }

  mostrarNotificacion(event: {msg: string, tipo: string}): void {
    this.mostrarToast(event.msg, event.tipo);
  }

  // ── Navegación ─────────────────────────────────────────────
  setVista(v: Vista): void {
    this.vistaActiva = v;
    if (v === 'form') this.seccionActiva = 0;
    this.cdr.detectChanges();
  }

  irASeccion(i: number): void {
    this.seccionActiva = i;
    this.cdr.detectChanges();
    setTimeout(() => {
      const el = document.querySelector('.reporte-content');
      if (el) el.scrollTop = 0;
    }, 50);
  }

  anterior(): void { if (this.seccionActiva > 0) this.irASeccion(this.seccionActiva - 1); }
  siguiente(): void { if (this.seccionActiva < 6) this.irASeccion(this.seccionActiva + 1); }

  // ── Progreso ───────────────────────────────────────────────
  get seccionesConcluidas(): number {
    if (!this.reporte) return 0;
    return [
      this.reporte.seccion1Concluida, this.reporte.seccion2Concluida,
      this.reporte.seccion3Concluida, this.reporte.seccion4Concluida,
      this.reporte.seccion5Concluida, this.reporte.seccion6Concluida,
      this.reporte.seccion7Concluida,
    ].filter(v => v === true).length;
  }

  get progresoPorcentaje(): number {
    return Math.round((this.seccionesConcluidas / 7) * 100);
  }

  get todasConcluidas(): boolean { return this.seccionesConcluidas === 7; }

  esConcluida(num: number): boolean {
    if (!this.reporte) return false;
    const key = `seccion${num}Concluida` as keyof ReporteResponse;
    return this.reporte[key] === true;
  }

  // ── Toggle sección ─────────────────────────────────────────
  toggleSeccion(num: number, automatico = false): void {
    if (!this.reporte) return;
    const eraConcluida = this.esConcluida(num);
    this.reporteService.toggleSeccion(this.reporte.id, num).subscribe({
      next: (updated) => {
        this.ngZone.run(() => {
          this.reporte = { ...updated };
          this.cdr.detectChanges();
          if (eraConcluida) {
            this.mostrarToast(
              automatico ? 'Sección desmarcada automáticamente al agregar un registro' : 'Sección desmarcada',
              'info'
            );
          } else {
            this.mostrarToast('¡Sección marcada como concluida! ✓', 'success');
          }
        });
      },
      error: () => this.mostrarToast('Error al actualizar la sección', 'error')
    });
  }

  onRegistroAgregado(numSeccion: number): void {
    if (!this.reporte) return;
    if (this.esConcluida(numSeccion)) {
      this.toggleSeccion(numSeccion, true);
    }
  }

  // ── Guardar textos (secciones 1, 3, 6) ────────────────────
  guardarTextoSeccion(): void {
    if (!this.reporte) return;
    const dto = { anio: this.anioActual, ...this.textosForm.value };
    this.reporteService.guardarBorrador(this.reporte.id, dto).subscribe({
      next: (updated) => {
        this.ngZone.run(() => {
          this.reporte = { ...updated };
          this.cdr.detectChanges();
          this.mostrarToast('Guardado correctamente', 'success');
        });
      },
      error: () => this.mostrarToast('Error al guardar', 'error')
    });
  }

  // ── Enviar a revisión ──────────────────────────────────────
  confirmarEnvio(): void  { this.mostrarModalEnvio = true;  this.cdr.detectChanges(); }
  cancelarEnvio(): void   { this.mostrarModalEnvio = false; this.cdr.detectChanges(); }

  enviarARevision(): void {
    if (!this.reporte) return;
    this.enviando = true;
    this.mostrarModalEnvio = false;
    this.reporteService.enviarARevision(this.reporte.id).subscribe({
      next: (updated) => {
        this.ngZone.run(() => {
          this.reporte = { ...updated };
          this.enviando = false;
          this.cdr.detectChanges();
          this.mostrarToast('Reporte enviado a revisión exitosamente', 'success');
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.enviando = false;
          this.cdr.detectChanges();
          this.mostrarToast('Error al enviar el reporte', 'error');
        });
      }
    });
  }

  // ── Helpers ────────────────────────────────────────────────
  private mostrarToast(msg: string, tipo: string): void {
    this.toastMsg  = msg;
    this.toastTipo = tipo;
    this.cdr.detectChanges();
    setTimeout(() => { this.toastMsg = ''; this.cdr.detectChanges(); }, 3400);
  }

  logout(): void { this.authService.logout(); }

  get inicialesProfesor(): string {
    return this.reporte?.profesorNombre
      ?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? 'P';
  }

  get estadoBadgeClass(): string {
    const map: Record<string, string> = {
      BORRADOR: 'badge-borrador', PENDIENTE_VALIDACION: 'badge-pendiente',
      ACEPTADO: 'badge-aceptado', RECHAZADO: 'badge-rechazado',
    };
    return map[this.reporte?.estado ?? ''] ?? 'badge-borrador';
  }

  get estadoLabel(): string {
    const map: Record<string, string> = {
      BORRADOR: 'Borrador', PENDIENTE_VALIDACION: 'Pendiente de validación',
      ACEPTADO: 'Aceptado', RECHAZADO: 'Rechazado',
    };
    return map[this.reporte?.estado ?? ''] ?? 'Borrador';
  }

  get ultimaEdicion(): string {
    if (!this.reporte?.actualizadoEn) return '—';
    return new Date(this.reporte.actualizadoEn).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  get formularioEditable(): boolean {
    return this.reporte?.estado === 'BORRADOR' || this.reporte?.estado === 'RECHAZADO';
  }

  // previsualizarPdf(): void {
  //   if (!this.reporte || this.generandoPdf) return;
  //   this.generandoPdf = true;
  //   const id = this.reporte.id;

  //   forkJoin({
  //     cursos:       this.docenciaService.obtenerCursos(id),
  //     productos:    this.docenciaService.obtenerProductos(id),
  //     asignaturas:  this.docenciaService.obtenerAsignaturas(id),
  //     tutorias:     this.formacionRhService.obtenerTutorias(id),
  //     tesis:        this.formacionRhService.obtenerTesis(id),
  //     proyectos:    this.investigacionService.obtenerProyectos(id),
  //     publicaciones:this.investigacionService.obtenerPublicaciones(id),
  //     desarrollo:   this.investigacionService.obtenerDesarrollo(id),
  //     gestion:      this.gestionDifService.obtenerGestion(id),
  //     difusion:     this.gestionDifService.obtenerDifusion(id),
  //     distribucion: this.distribucionService.obtener(id),
  //   }).subscribe({
  //     next: async (datos) => {
  //       // Cargar indicadores de todos los proyectos
  //       if (datos.proyectos.length > 0) {
  //         const indicadoresArrays = await Promise.all(
  //           datos.proyectos.map(p =>
  //             this.investigacionService.obtenerIndicadores(p.id).toPromise()
  //           )
  //         );
  //         (datos as any).indicadores = indicadoresArrays.flat();
  //       } else {
  //         (datos as any).indicadores = [];
  //       }
  //       this.datosPdf = datos;
  //       this.cdr.detectChanges();
  //       setTimeout(async () => {
  //         await this.pdfService.generarPDF('reporte-pdf-content', `Reporte_${this.reporte!.anio}_${this.reporte!.profesorNombre}`);
  //         this.generandoPdf = false;
  //         this.cdr.detectChanges();
  //       }, 500);
  //     },
  //     error: () => {
  //       this.generandoPdf = false;
  //       this.cdr.detectChanges();
  //       this.mostrarToast('Error al generar el PDF', 'error');
  //     }
  //   });
  // }

  // Método:
  previsualizarPdf(): void {
    if (!this.reporte || this.generandoPdf) return;
    this.generandoPdf = true;
    const id = this.reporte.id;

    forkJoin({
      cursos:        this.docenciaService.obtenerCursos(id),
      productos:     this.docenciaService.obtenerProductos(id),
      asignaturas:   this.docenciaService.obtenerAsignaturas(id),
      tutorias:      this.formacionRhService.obtenerTutorias(id),
      tesis:         this.formacionRhService.obtenerTesis(id),
      proyectos:     this.investigacionService.obtenerProyectos(id),
      publicaciones: this.investigacionService.obtenerPublicaciones(id),
      desarrollo:    this.investigacionService.obtenerDesarrollo(id),
      gestion:       this.gestionDifService.obtenerGestion(id),
      difusion:      this.gestionDifService.obtenerDifusion(id),
      distribucion:  this.distribucionService.obtener(id),
    }).pipe(
      switchMap(datos =>
        forkJoin(
          datos.proyectos.length > 0
            ? datos.proyectos.map(p => this.investigacionService.obtenerIndicadores(p.id))
            : [Promise.resolve([])]
        ).pipe(
          switchMap(indicadoresArrays => {
            const indicadores = indicadoresArrays.flat();
            const datosPdf: DatosPdf = { reporte: this.reporte!, ...datos, indicadores };
            return [datosPdf];
          })
        )
      )
    ).subscribe({
      next: (datosPdf) => {
        this.pdfService.generarReporte(datosPdf);
        this.generandoPdf = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.generandoPdf = false;
        this.cdr.detectChanges();
        this.mostrarToast('Error al generar el PDF', 'error');
      }
    });
  }
}