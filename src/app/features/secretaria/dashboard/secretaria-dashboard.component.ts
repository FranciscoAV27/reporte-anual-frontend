// src/app/features/secretaria/dashboard/secretaria-dashboard.component.ts
import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { PeriodoService } from '../../../core/services/periodo.service';
import { SecretariaService } from '../../../core/services/secretaria.service';
import { PeriodoResponse } from '../../../shared/models/periodo.model';
import { ReporteResponse } from '../../../shared/models/reporte/reporte.model';
import { calcularAnioCiclo, nombreCiclo } from '../../../core/utils/ciclo.util';
import { FormsModule } from '@angular/forms';

type Vista = 'inicio' | 'revision' | 'entregas' | 'historial';

@Component({
  selector: 'app-secretaria-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './secretaria-dashboard.component.html',
  styleUrls: ['./secretaria-dashboard.component.css']
})
export class SecretariaDashboardComponent implements OnInit {
  private readonly periodoService    = inject(PeriodoService);
  private readonly secretariaService = inject(SecretariaService);
  private readonly authService       = inject(AuthService);
  private readonly fb                = inject(FormBuilder);
  private readonly cdr               = inject(ChangeDetectorRef);
  private readonly ngZone            = inject(NgZone);

  // ── Estado general ─────────────────────────────────────────
  vistaActiva: Vista = 'inicio';
  cargando   = true;
  toastMsg   = '';
  toastTipo  = '';

  // ── Ciclo ──────────────────────────────────────────────────
  readonly anioCicloActual = calcularAnioCiclo();
  readonly nombreCicloActual = nombreCiclo(this.anioCicloActual);

  // ── Periodo ────────────────────────────────────────────────
  periodoActivo: PeriodoResponse | null = null;
  modalPeriodoVisible  = false;
  modalCerrarVisible   = false;
  modoModalPeriodo: 'iniciar' | 'editar' = 'iniciar';
  guardandoPeriodo = false;

  formPeriodo: FormGroup = this.fb.group({
    fechaApertura: ['', Validators.required],
    fechaLimite:   ['', Validators.required],
    instrucciones: ['']
  });

  // ── Reportes ───────────────────────────────────────────────
  pendientes: ReporteResponse[] = [];
  todos:      ReporteResponse[] = [];

  // Modal revisión
  modalRevisionVisible  = false;
  reporteSeleccionado:  ReporteResponse | null = null;
  modoRechazo           = false;
  procesando            = false;

  formRechazo: FormGroup = this.fb.group({
    motivo: ['', Validators.required]
  });

  // ── Filtros ────────────────────────────────────────────────
  filtroCarreraRevision = '';
  filtroCarreraEntregas = '';
  filtroEstadoEntregas  = '';
  filtroBusquedaEntregas = '';
  filtroAnioHistorial   = this.anioCicloActual;
  filtroCarreraHistorial = '';
  filtroBusquedaHistorial = '';

  stats = { totalProfesores: 0, aceptados: 0, enRevision: 0, enCorreccion: 0, sinEntregar: 0 };


  // ── Computed ───────────────────────────────────────────────
  // get pendientesFiltrados(): ReporteResponse[] {
  //   return this.pendientes.filter(r =>
  //     !this.filtroCarreraRevision || r.carreraNombre === this.filtroCarreraRevision
  //   );
  // }

  // get pendientesFiltrados(): ReporteResponse[] {
  //   return this.pendientes;  // sin filtro de carrera por ahora
  // }

  get pendientesFiltrados(): ReporteResponse[] {
    return this.pendientes.filter(r =>
      !this.filtroCarreraRevision || r.profesorCarrera === this.filtroCarreraRevision
    );
  }

  // get todosFiltrarados(): ReporteResponse[] {
  //   return this.todos.filter(r => {
  //     const matchCarrera  = !this.filtroCarreraEntregas || r.carreraNombre === this.filtroCarreraEntregas;
  //     const matchEstado   = !this.filtroEstadoEntregas  || r.estado === this.filtroEstadoEntregas;
  //     const matchBusqueda = !this.filtroBusquedaEntregas ||
  //       `${r.profesorNombre} ${r.profesorApellidos}`.toLowerCase()
  //         .includes(this.filtroBusquedaEntregas.toLowerCase());
  //     return matchCarrera && matchEstado && matchBusqueda;
  //   });
  // }

  // get todosFiltrarados(): ReporteResponse[] {
  //   return this.todos.filter(r => {
  //     const matchEstado   = !this.filtroEstadoEntregas || r.estado === this.filtroEstadoEntregas as any;
  //     const matchBusqueda = !this.filtroBusquedaEntregas ||
  //       `${r.profesorNombre} ${r.profesorApellidos ?? ''}`.toLowerCase()
  //         .includes(this.filtroBusquedaEntregas.toLowerCase());
  //     return matchEstado && matchBusqueda;
  //   });
  // }

  get todosFiltrarados(): ReporteResponse[] {
    return this.todos.filter(r => {
      const matchCarrera  = !this.filtroCarreraEntregas  || r.profesorCarrera === this.filtroCarreraEntregas;
      const matchEstado   = !this.filtroEstadoEntregas   || (r.estado as any) === this.filtroEstadoEntregas;
      const matchBusqueda = !this.filtroBusquedaEntregas ||
        `${r.profesorNombre} ${r.profesorApellidos ?? ''}`.toLowerCase()
          .includes(this.filtroBusquedaEntregas.toLowerCase());
      return matchCarrera && matchEstado && matchBusqueda;
    });
  }

  // get historialFiltrado(): ReporteResponse[] {
  //   return this.todos.filter(r => {
  //     const matchAnio     = r.anio === this.filtroAnioHistorial;
  //     const matchEstado   = r.estado === 'ACEPTADO';
  //     const matchCarrera  = !this.filtroCarreraHistorial || r.carreraNombre === this.filtroCarreraHistorial;
  //     const matchBusqueda = !this.filtroBusquedaHistorial ||
  //       `${r.profesorNombre} ${r.profesorApellidos}`.toLowerCase()
  //         .includes(this.filtroBusquedaHistorial.toLowerCase());
  //     return matchAnio && matchEstado && matchCarrera && matchBusqueda;
  //   });
  // }

  // get historialFiltrado(): ReporteResponse[] {
  //   return this.todos.filter(r => {
  //     const matchAnio     = r.anio === this.filtroAnioHistorial;
  //     const matchEstado   = r.estado === 'ACEPTADO' as any;
  //     const matchBusqueda = !this.filtroBusquedaHistorial ||
  //       `${r.profesorNombre} ${r.profesorApellidos ?? ''}`.toLowerCase()
  //         .includes(this.filtroBusquedaHistorial.toLowerCase());
  //     return matchAnio && matchEstado && matchBusqueda;
  //   });
  // }

  get historialFiltrado(): ReporteResponse[] {
    return this.todos.filter(r => {
      const matchAnio     = r.anio === this.filtroAnioHistorial;
      const matchEstado   = (r.estado as any) === 'ACEPTADO';
      const matchCarrera  = !this.filtroCarreraHistorial || r.profesorCarrera === this.filtroCarreraHistorial;
      const matchBusqueda = !this.filtroBusquedaHistorial ||
        `${r.profesorNombre} ${r.profesorApellidos ?? ''}`.toLowerCase()
          .includes(this.filtroBusquedaHistorial.toLowerCase());
      return matchAnio && matchEstado && matchCarrera && matchBusqueda;
    });
  }

  get totalProfesores(): number { return this.todos.length; }
  get totalAceptados():  number { return this.todos.filter(r => r.estado === 'ACEPTADO').length; }
  //get totalEnRevision(): number { return this.todos.filter(r => r.estado === 'PENDIENTE_VALIDACION').length; }
  get totalEnRevision(): number {
    return this.todos.filter(r => (r.estado as any) === 'PENDIENTE_VALIDACION').length;
  }
  
  get totalSinEntregar():number { return this.todos.filter(r => r.estado === 'BORRADOR').length; }
  get totalEnCorreccion():number{ return this.todos.filter(r => r.estado === 'RECHAZADO').length; }

  get aniosDisponibles(): number[] {
    const anios = [...new Set(this.todos.map(r => r.anio))].sort((a, b) => b - a);
    return anios.length > 0 ? anios : [this.anioCicloActual];
  }

  // get carrerasDisponibles(): string[] {
  //   return [...new Set(this.todos.map(r => r.carreraNombre).filter(Boolean))].sort() as string[];
  // }

  // get carrerasDisponibles(): string[] { return []; } // placeholder hasta agregar carrera al DTO

  get carrerasDisponibles(): string[] {
    return [...new Set(this.todos.map(r => r.profesorCarrera).filter(Boolean))].sort() as string[];
  }

  // ── Init ───────────────────────────────────────────────────
  ngOnInit(): void {
    this.cargarTodo();
  }

  private cargarTodo(): void {
    this.cargando = true;

    this.secretariaService.obtenerStats(this.anioCicloActual).subscribe({
      next: (s) => { this.ngZone.run(() => { this.stats = s; this.cdr.detectChanges(); }); }
    });

    this.periodoService.obtenerActivo().subscribe({
      next: (p) => {
        this.ngZone.run(() => { this.periodoActivo = p; this.cdr.detectChanges(); });
      },
      error: () => {
        this.ngZone.run(() => { this.periodoActivo = null; this.cdr.detectChanges(); });
      }
    });

    this.secretariaService.obtenerPendientes().subscribe({
      next: (data) => {
        this.ngZone.run(() => { this.pendientes = data; this.cdr.detectChanges(); });
      }
    });

    this.secretariaService.obtenerTodosPorAnio(this.anioCicloActual).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.todos    = data;
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => { this.cargando = false; this.cdr.detectChanges(); });
      }
    });
  }

  // ── Navegación ─────────────────────────────────────────────
  setVista(v: Vista): void {
    this.vistaActiva = v;
    this.cdr.detectChanges();
  }

  // ── Periodo ────────────────────────────────────────────────
  abrirModalIniciar(): void {
    this.modoModalPeriodo = 'iniciar';
    this.formPeriodo.reset();
    this.modalPeriodoVisible = true;
    this.cdr.detectChanges();
  }

  abrirModalEditar(): void {
    if (!this.periodoActivo) return;
    this.modoModalPeriodo = 'editar';
    this.formPeriodo.patchValue({
      fechaApertura: this.periodoActivo.fechaApertura,
      fechaLimite:   this.periodoActivo.fechaLimite,
      instrucciones: this.periodoActivo.instrucciones ?? ''
    });
    this.modalPeriodoVisible = true;
    this.cdr.detectChanges();
  }

  cerrarModalPeriodo(): void {
    this.modalPeriodoVisible = false;
    this.guardandoPeriodo    = false;
    this.cdr.detectChanges();
  }

  guardarPeriodo(): void {
    if (this.formPeriodo.invalid) { this.formPeriodo.markAllAsTouched(); return; }
    this.guardandoPeriodo = true;
    const dto = {
      fechaApertura: this.formPeriodo.value.fechaApertura,
      fechaLimite:   this.formPeriodo.value.fechaLimite,
      instrucciones: this.formPeriodo.value.instrucciones || null
    };

    const obs = this.modoModalPeriodo === 'iniciar'
      ? this.periodoService.iniciar(dto)
      : this.periodoService.editar(this.periodoActivo!.id, dto);

    obs.subscribe({
      next: (p) => {
        this.ngZone.run(() => {
          this.periodoActivo    = p;
          this.guardandoPeriodo = false;
          this.modalPeriodoVisible = false;
          this.cdr.detectChanges();
          this.mostrarToast(
            this.modoModalPeriodo === 'iniciar'
              ? 'Periodo iniciado. Los profesores ya pueden ver las fechas.'
              : 'Periodo actualizado correctamente.',
            'success'
          );
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.guardandoPeriodo = false;
          this.cdr.detectChanges();
          this.mostrarToast(err?.error?.message ?? 'Error al guardar el periodo', 'error');
        });
      }
    });
  }

  pedirCerrarPeriodo(): void {
    this.modalCerrarVisible = true;
    this.cdr.detectChanges();
  }

  confirmarCerrarPeriodo(): void {
    if (!this.periodoActivo) return;
    this.periodoService.cerrar(this.periodoActivo.id).subscribe({
      next: (p) => {
        this.ngZone.run(() => {
          this.periodoActivo      = p;
          this.modalCerrarVisible = false;
          this.cdr.detectChanges();
          this.mostrarToast('Periodo cerrado. Los profesores ya no pueden enviar reportes.', 'info');
        });
      },
      error: () => this.mostrarToast('Error al cerrar el periodo', 'error')
    });
  }

  // ── Revisión ───────────────────────────────────────────────
  abrirRevision(reporte: ReporteResponse): void {
    this.reporteSeleccionado  = reporte;
    this.modoRechazo          = false;
    this.formRechazo.reset();
    this.modalRevisionVisible = true;
    this.cdr.detectChanges();
  }

  cerrarRevision(): void {
    this.modalRevisionVisible = false;
    this.reporteSeleccionado  = null;
    this.modoRechazo          = false;
    this.cdr.detectChanges();
  }

  toggleRechazo(): void {
    this.modoRechazo = !this.modoRechazo;
    this.cdr.detectChanges();
  }

  aprobar(): void {
    if (!this.reporteSeleccionado) return;
    this.procesando = true;
    this.secretariaService.aprobar(this.reporteSeleccionado.id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.procesando = false;
          this.cerrarRevision();
          this.cargarTodo();
          this.mostrarToast('Reporte aprobado correctamente ✓', 'success');
        });
      },
      error: () => {
        this.ngZone.run(() => { this.procesando = false; this.mostrarToast('Error al aprobar el reporte', 'error'); });
      }
    });
  }

  rechazar(): void {
    if (!this.reporteSeleccionado || this.formRechazo.invalid) {
      this.formRechazo.markAllAsTouched(); return;
    }
    this.procesando = true;
    this.secretariaService.rechazar(
      this.reporteSeleccionado.id,
      this.formRechazo.value.motivo
    ).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.procesando = false;
          this.cerrarRevision();
          this.cargarTodo();
          this.mostrarToast('Reporte rechazado. El profesor fue notificado.', 'info');
        });
      },
      error: () => {
        this.ngZone.run(() => { this.procesando = false; this.mostrarToast('Error al rechazar el reporte', 'error'); });
      }
    });
  }

  // ── Helpers ────────────────────────────────────────────────
  formatFecha(f: string | null | undefined): string {
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  estadoLabel(estado: string): string {
    const m: Record<string,string> = {
      BORRADOR:              'Sin entregar',
      PENDIENTE_VALIDACION:  'En revisión',
      ACEPTADO:              'Aceptado',
      RECHAZADO:             'En corrección'
    };
    return m[estado] ?? estado;
  }

  estadoBadgeClass(estado: string): string {
    const m: Record<string,string> = {
      BORRADOR:             'b-borrador',
      PENDIENTE_VALIDACION: 'b-revision',
      ACEPTADO:             'b-aceptado',
      RECHAZADO:            'b-correccion'
    };
    return m[estado] ?? '';
  }

  logout(): void { this.authService.logout(); }

  private mostrarToast(msg: string, tipo: string): void {
    this.toastMsg  = msg;
    this.toastTipo = tipo;
    this.cdr.detectChanges();
    setTimeout(() => { this.toastMsg = ''; this.cdr.detectChanges(); }, 3500);
  }

  cerrarModalCerrar(): void {
    this.modalCerrarVisible = false;
    this.cdr.detectChanges();
  }
}