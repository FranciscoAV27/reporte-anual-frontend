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
  private readonly ngZone = inject(NgZone); // ← nuevo
  private readonly reporteService = inject(ReporteService);
  private readonly authService    = inject(AuthService);
  private readonly fb             = inject(FormBuilder);
  private readonly cdr            = inject(ChangeDetectorRef);

  reporte: ReporteResponse | null = null;
  cargando   = true;
  guardando  = false;
  enviando   = false;
  errorMsg   = '';
  toastMsg   = '';
  toastTipo  = '';
  mostrarModalEnvio = false;

  vistaActiva: Vista = 'home';
  readonly secciones = SECCIONES;
  readonly anioActual = new Date().getFullYear();

  textosForm: FormGroup = this.fb.group({
    problemasDocencia:          [''],
    oportunidadesDocencia:      [''],
    problemasInvestigacion:     [''],
    oportunidadesInvestigacion: [''],
    comentariosGenerales:       [''],
  });

  ngOnInit(): void {
    this.reporteService.obtenerMisReportes().subscribe({
      next: (reportes) => {
        const existente = reportes.find(r => r.anio === this.anioActual);
        if (existente) {
          this.reporte = existente;
          this.poblarTextos(existente);
        } else {
          this.reporteService.crear({ anio: this.anioActual }).subscribe({
            next: (nuevo) => { this.reporte = nuevo; this.cargando = false; this.cdr.detectChanges(); },
            error: (err)  => { this.errorMsg = `No se pudo crear el reporte. (${err.status})`; this.cargando = false; this.cdr.detectChanges(); }
          });
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => { this.errorMsg = `Error al cargar reportes. (${err.status})`; this.cargando = false; this.cdr.detectChanges(); }
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

  // ── Navegación ─────────────────────────────────────────────
  setVista(v: Vista): void { this.vistaActiva = v; this.cdr.detectChanges(); }

  irAForm(): void {
    this.vistaActiva = 'form';
    this.cdr.detectChanges();
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }

  // ── Progreso ───────────────────────────────────────────────
  // get seccionesConcluidas(): number {
  //   if (!this.reporte) return 0;
  //   return [
  //     this.reporte.seccion1Concluida,
  //     this.reporte.seccion2Concluida,
  //     this.reporte.seccion3Concluida,
  //     this.reporte.seccion4Concluida,
  //     this.reporte.seccion5Concluida,
  //     this.reporte.seccion6Concluida,
  //     this.reporte.seccion7Concluida,
  //   ].filter(Boolean).length;
  // }

  get seccionesConcluidas(): number {
    if (!this.reporte) return 0;
    return [
      this.reporte.seccion1Concluida,
      this.reporte.seccion2Concluida,
      this.reporte.seccion3Concluida,
      this.reporte.seccion4Concluida,
      this.reporte.seccion5Concluida,
      this.reporte.seccion6Concluida,
      this.reporte.seccion7Concluida,
    ].filter(v => v === true).length;
  }

  get progresoPorcentaje(): number {
    return Math.round((this.seccionesConcluidas / 7) * 100);
  }

  get todasConcluidas(): boolean {
    return this.seccionesConcluidas === 7;
  }

  // esConcluida(num: number): boolean {
  //   if (!this.reporte) return false;
  //   const key = `seccion${num}Concluida` as keyof ReporteResponse;
  //   return !!this.reporte[key];
  // }

  // esConcluida(num: number): boolean {
  //   if (!this.reporte) return false;
  //   const key = `seccion${num}Concluida` as keyof ReporteResponse;
  //   const val = !!this.reporte[key];
  //   console.log(`esConcluida(${num}):`, val, '| reporte.seccion1Concluida:', this.reporte.seccion1Concluida);
  //   return val;
  // }

  esConcluida(num: number): boolean {
    if (!this.reporte) return false;
    const key = `seccion${num}Concluida` as keyof ReporteResponse;
    return this.reporte[key] === true; // null y false ambos dan false
  }

  // ── Toggle sección ─────────────────────────────────────────
  /*toggleSeccion(num: number): void {
    if (!this.reporte) return;
    this.reporteService.toggleSeccion(this.reporte.id, num).subscribe({
      next: (updated) => { this.reporte = updated; this.cdr.detectChanges(); },
      error: () => this.mostrarToast('Error al actualizar la sección', 'error')
    });
  }*/

  // toggleSeccion(num: number): void {
  //   if (!this.reporte) return;
  //   console.log('toggleSeccion llamado, num:', num);
  //   this.reporteService.toggleSeccion(this.reporte.id, num).subscribe({
  //     next: (updated) => {
  //       console.log('Respuesta del backend:', updated);
  //       this.reporte = updated;
  //       this.cdr.detectChanges();
  //     },
  //     error: (err) => {
  //       console.error('Error:', err);
  //       this.mostrarToast('Error al actualizar la sección', 'error');
  //       this.cdr.detectChanges();
  //     }
  //   });
  // }

  // toggleSeccion(num: number): void {
  //   if (!this.reporte) return;
  //   this.reporteService.toggleSeccion(this.reporte.id, num).subscribe({
  //     next: (updated) => {
  //       this.reporte = { ...updated }; // ← spread fuerza nueva referencia
  //       this.cdr.detectChanges();
  //     },
  //     error: (err) => {
  //       console.error('Error:', err);
  //       this.mostrarToast('Error al actualizar la sección', 'error');
  //       this.cdr.detectChanges();
  //     }
  //   });
  // }

  toggleSeccion(num: number): void {
    if (!this.reporte) return;
    this.reporteService.toggleSeccion(this.reporte.id, num).subscribe({
      next: (updated) => {
        this.ngZone.run(() => {        // ← envuelve en NgZone
          this.reporte = { ...updated };
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.mostrarToast('Error al actualizar la sección', 'error');
          this.cdr.detectChanges();
        });
      }
    });
  }

  scrollASeccion(num: number): void {
    if (this.vistaActiva !== 'form') {
      this.vistaActiva = 'form';
      this.cdr.detectChanges();
      setTimeout(() => this.hacerScroll(num), 200);
    } else {
      this.hacerScroll(num);
    }
  }

  private hacerScroll(num: number): void {
    const el = document.getElementById(`seccion-${num}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Borrador ───────────────────────────────────────────────
  // guardarBorrador(): void {
  //   if (!this.reporte) return;
  //   this.guardando = true;
  //   const dto = { anio: this.anioActual, ...this.textosForm.value };
  //   this.reporteService.guardarBorrador(this.reporte.id, dto).subscribe({
  //     // next: (updated) => {
  //     //   this.reporte  = updated;
  //     //   this.guardando = false;
  //     //   this.cdr.detectChanges();
  //     //   this.mostrarToast('Borrador guardado correctamente', 'success');
  //     // },
  //     // En guardarBorrador:
  //     next: (updated) => {
  //       this.reporte  = { ...updated }; // ← spread
  //       this.guardando = false;
  //       this.cdr.detectChanges();
  //       this.mostrarToast('Borrador guardado correctamente', 'success');
  //     },
  //     error: () => {
  //       this.guardando = false;
  //       this.cdr.detectChanges();
  //       this.mostrarToast('Error al guardar el borrador', 'error');
  //     }
  //   });
  // }

  guardarBorrador(): void {
    if (!this.reporte) return;
    this.guardando = true;
    const dto = { anio: this.anioActual, ...this.textosForm.value };
    this.reporteService.guardarBorrador(this.reporte.id, dto).subscribe({
      next: (updated) => {
        this.ngZone.run(() => {
          this.reporte  = { ...updated };
          this.guardando = false;
          this.cdr.detectChanges();
          this.mostrarToast('Borrador guardado correctamente', 'success');
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.guardando = false;
          this.cdr.detectChanges();
          this.mostrarToast('Error al guardar el borrador', 'error');
        });
      }
    });
  }

  // ── Enviar a revisión ──────────────────────────────────────
  // confirmarEnvio(): void { this.mostrarModalEnvio = true; this.cdr.detectChanges(); }
  // cancelarEnvio(): void  { this.mostrarModalEnvio = false; this.cdr.detectChanges(); }

  // enviarARevision(): void {
  //   if (!this.reporte) return;
  //   this.enviando = true;
  //   this.mostrarModalEnvio = false;
  //   this.reporteService.enviarARevision(this.reporte.id).subscribe({
  //     // next: (updated) => {
  //     //   this.reporte = updated;
  //     //   this.enviando = false;
  //     //   this.cdr.detectChanges();
  //     //   this.mostrarToast('Reporte enviado a revisión exitosamente', 'success');
  //     // },
  //     // En enviarARevision:
  //     next: (updated) => {
  //       this.reporte = { ...updated }; // ← spread
  //       this.enviando = false;
  //       this.cdr.detectChanges();
  //       this.mostrarToast('Reporte enviado a revisión exitosamente', 'success');
  //     },
  //     error: () => {
  //       this.enviando = false;
  //       this.cdr.detectChanges();
  //       this.mostrarToast('Error al enviar el reporte', 'error');
  //     }
  //   });
  // }

  confirmarEnvio(): void { 
    this.mostrarModalEnvio = true; 
    this.cdr.detectChanges(); 
  }

  cancelarEnvio(): void { 
    this.mostrarModalEnvio = false; 
    this.cdr.detectChanges(); 
  }

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
      BORRADOR:            'badge-borrador',
      PENDIENTE_VALIDACION:'badge-pendiente',
      ACEPTADO:            'badge-aceptado',
      RECHAZADO:           'badge-rechazado',
    };
    return map[this.reporte?.estado ?? ''] ?? 'badge-borrador';
  }

  get estadoLabel(): string {
    const map: Record<string, string> = {
      BORRADOR:            'Borrador',
      PENDIENTE_VALIDACION:'Pendiente de validación',
      ACEPTADO:            'Aceptado',
      RECHAZADO:           'Rechazado',
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

  // onRegistroAgregado(numSeccion: number): void {
  //   if (!this.reporte) return;
  //   if (this.esConcluida(numSeccion)) {
  //     this.toggleSeccion(numSeccion);
  //   }
  // }

  onRegistroAgregado(numSeccion: number): void {
    console.log('onRegistroAgregado llamado, seccion:', numSeccion);
    console.log('esConcluida:', this.esConcluida(numSeccion));
    if (!this.reporte) return;
    if (this.esConcluida(numSeccion)) {
      this.toggleSeccion(numSeccion);
    }
  }
}