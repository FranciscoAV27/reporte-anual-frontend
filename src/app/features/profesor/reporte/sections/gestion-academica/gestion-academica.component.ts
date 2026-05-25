// gestion-academica.component.ts
import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GestionDifusionService } from '../../../services/gestion-difusion.service';
import { ActividadGestionResponse } from '../../../../../shared/models/reporte/s4/actividad-gestion.model';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-gestion-academica',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './gestion-academica.component.html',
  styleUrls: ['./gestion-academica.component.css']
})
export class GestionAcademicaComponent implements OnInit {
  @Input() reporteId!: number;
  @Output() registroAgregado = new EventEmitter<void>();
  @Output() notificacion     = new EventEmitter<{msg: string, tipo: string}>();

  private readonly service = inject(GestionDifusionService);
  private readonly fb      = inject(FormBuilder);
  private readonly cdr     = inject(ChangeDetectorRef);

  actividades: ActividadGestionResponse[] = [];
  //mostrarForm = false;
  //editandoId: number | null = null;
  //formNuevo!: FormGroup;
  //formEdit!:  FormGroup;

  modalVisible   = false;
  modalGuardando = false;
  modoModal: 'agregar' | 'editar' = 'agregar';
  editandoItemId: number | null = null;
  editandoNumero: number | null = null;
  formModal!: FormGroup;

  ngOnInit(): void { this.initForm(); this.cargar(); }

  get modalTitulo(): string {
    return this.modoModal === 'agregar' ? 'Agregar actividad de gestión' : 'Editar actividad de gestión';
  }

  // private initForm(): void {
  //   this.formNuevo = this.fb.group({
  //     numActividad:    [null, [Validators.required, Validators.min(1)]],
  //     nombre:          ['',   [Validators.required, Validators.maxLength(300)]],
  //     comisionOPuesto: ['',   [Validators.required, Validators.maxLength(300)]],
  //     periodoInicio:   [''],
  //     periodoFin:      ['']
  //   });
  // }

  private cargar(): void {
    this.service.obtenerGestion(this.reporteId).subscribe({
      next: (data) => { this.actividades = data; this.cdr.detectChanges(); }
    });
  }

  get siguienteNum(): number {
    return this.actividades.length === 0 ? 1 : Math.max(...this.actividades.map(a => a.numActividad)) + 1;
  }

  // private initForm(): void {
  //   this.formModal = this.fb.group({
  //     numActividad:    [null, [Validators.required, Validators.min(1)]],
  //     nombre:          ['',   [Validators.required, Validators.maxLength(300)]],
  //     comisionOPuesto: ['',   [Validators.required, Validators.maxLength(300)]],
  //     periodoInicio:   [''],
  //     periodoFin:      ['']
  //   });
  // }

  // cerrarModal(): void {
  //   this.modalVisible = false; this.modalGuardando = false; this.editandoItemId = null;
  //   this.cdr.detectChanges();
  // }
  // guardarModal(): void { this.guardar(); }

  // abrir(): void {
  //   this.modoModal = 'agregar'; this.editandoItemId = null;
  //   this.formModal.reset({ numActividad: this.siguienteNum });
  //   this.modalVisible = true; this.cdr.detectChanges();
  // }
  // abrirEditar(a: ActividadGestionResponse): void {
  //   this.modoModal = 'editar'; this.editandoItemId = a.id;
  //   this.formModal.patchValue({ ...a, periodoInicio: a.periodoInicio ?? '', periodoFin: a.periodoFin ?? '' });
  //   this.modalVisible = true; this.cdr.detectChanges();
  // }

  // private guardar(): void {
  //   if (this.formModal.invalid) { this.formModal.markAllAsTouched(); return; }
  //   this.modalGuardando = true;
  //   const val = { ...this.formModal.value, periodoInicio: this.formModal.value.periodoInicio || null, periodoFin: this.formModal.value.periodoFin || null };
  //   const obs = this.modoModal === 'agregar'
  //     ? this.service.crearGestion(this.reporteId, val)
  //     : this.service.actualizarGestion(this.reporteId, this.editandoItemId!, val);
  //   obs.subscribe({
  //     next: (r) => {
  //       this.actividades = this.modoModal === 'agregar' ? [...this.actividades, r] : this.actividades.map(a => a.id === this.editandoItemId ? r : a);
  //       this.modalGuardando = false; this.cerrarModal(); this.cdr.detectChanges();
  //       if (this.modoModal === 'agregar') this.registroAgregado.emit();
  //       this.notificacion.emit({ msg: this.modoModal === 'agregar' ? 'Actividad agregada correctamente' : 'Actividad actualizada', tipo: 'success' });
  //     },
  //     error: () => { this.modalGuardando = false; this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Error al guardar la actividad', tipo: 'error' }); }
  //   });
  // }

  private initForm(): void {
    this.formModal = this.fb.group({
      nombre:          ['', [Validators.required, Validators.maxLength(300)]],
      comisionOPuesto: ['', Validators.maxLength(300)], // opcional
      periodoInicio:   ['', Validators.required],
      periodoFin:      ['']  // opcional
    });
  }

  cerrarModal(): void {
    this.modalVisible = false; this.modalGuardando = false;
    this.editandoItemId = null; this.editandoNumero = null;
    this.cdr.detectChanges();
  }

  guardarModal(): void { this.guardar(); }

  abrir(): void {
    this.modoModal = 'agregar'; this.editandoItemId = null; this.editandoNumero = null;
    this.formModal.reset();
    this.modalVisible = true; this.cdr.detectChanges();
  }

  abrirEditar(a: ActividadGestionResponse): void {
    this.modoModal = 'editar'; this.editandoItemId = a.id; this.editandoNumero = a.numActividad;
    this.formModal.patchValue({
      nombre:          a.nombre,
      comisionOPuesto: a.comisionOPuesto ?? '',
      periodoInicio:   a.periodoInicio  ?? '',
      periodoFin:      a.periodoFin     ?? ''
    });
    this.modalVisible = true; this.cdr.detectChanges();
  }

  private guardar(): void {
    if (this.formModal.invalid) { this.formModal.markAllAsTouched(); return; }
    this.modalGuardando = true;
    const numActividad = this.modoModal === 'agregar' ? this.siguienteNum : this.editandoNumero!;
    const val = {
      numActividad,
      ...this.formModal.value,
      comisionOPuesto: this.formModal.value.comisionOPuesto || null,
      periodoInicio:   this.formModal.value.periodoInicio   || null,
      periodoFin:      this.formModal.value.periodoFin      || null
    };
    const obs = this.modoModal === 'agregar'
      ? this.service.crearGestion(this.reporteId, val)
      : this.service.actualizarGestion(this.reporteId, this.editandoItemId!, val);
    obs.subscribe({
      next: (r) => {
        this.actividades = this.modoModal === 'agregar' ? [...this.actividades, r] : this.actividades.map(a => a.id === this.editandoItemId ? r : a);
        this.modalGuardando = false; this.cerrarModal(); this.cdr.detectChanges();
        if (this.modoModal === 'agregar') this.registroAgregado.emit();
        this.notificacion.emit({ msg: this.modoModal === 'agregar' ? 'Actividad agregada correctamente' : 'Actividad actualizada', tipo: 'success' });
      },
      error: () => { this.modalGuardando = false; this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Error al guardar la actividad', tipo: 'error' }); }
    });
  }

  // eliminar(id: number): void {
  //   this.service.eliminarGestion(this.reporteId, id).subscribe({
  //     next: () => { this.actividades = this.actividades.filter(a => a.id !== id); this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Actividad eliminada', tipo: 'info' }); },
  //     error: () => this.notificacion.emit({ msg: 'Error al eliminar', tipo: 'error' })
  //   });
  // }

  eliminar(id: number): void {
    const item = this.actividades.find(a => a.id === id)!;
    const numEliminado = item.numActividad;
    const afectadas = this.actividades.filter(a => a.numActividad > numEliminado);

    this.service.eliminarGestion(this.reporteId, id).pipe(
      switchMap(() => {
        if (afectadas.length === 0) return of(null);
        return forkJoin(
          afectadas.map(a =>
            this.service.actualizarGestion(this.reporteId, a.id, {
              numActividad:    a.numActividad - 1,
              nombre:          a.nombre,
              comisionOPuesto: a.comisionOPuesto,
              periodoInicio:   a.periodoInicio,
              periodoFin:      a.periodoFin
            })
          )
        );
      })
    ).subscribe({
      next: () => {
        this.cargar();
        this.cdr.detectChanges();
        this.notificacion.emit({ msg: 'Actividad eliminada', tipo: 'info' });
      },
      error: () => this.notificacion.emit({ msg: 'Error al eliminar la actividad', tipo: 'error' })
    });
  }

  private limpiarFechas(val: any): any {
    return { ...val, periodoInicio: val.periodoInicio || null, periodoFin: val.periodoFin || null };
  }
}