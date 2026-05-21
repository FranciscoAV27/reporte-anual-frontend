// formacion-rh.component.ts
import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormacionRhService } from '../../../services/formacion-rh.service';
import { CatalogoService } from '../../../../../core/services/catalogo.service';
import { TutoriaResponse } from '../../../../../shared/models/reporte/s2/tutoria.model';
import { DireccionTesisResponse } from '../../../../../shared/models/reporte/s2/direccion-tesis.model';
import { CarreraResponse } from '../../../../../shared/models/catalogo.model';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-formacion-rh',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './formacion-rh.component.html',
  styleUrls: ['./formacion-rh.component.css']
})
export class FormacionRhComponent implements OnInit {
  @Input() reporteId!: number;
  @Output() registroAgregado = new EventEmitter<void>();
  @Output() notificacion     = new EventEmitter<{msg: string, tipo: string}>();

  private readonly service         = inject(FormacionRhService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly fb              = inject(FormBuilder);
  private readonly cdr             = inject(ChangeDetectorRef);

  tutorias: TutoriaResponse[]       = [];
  tesis:    DireccionTesisResponse[] = [];
  carrerasDisponibles: CarreraResponse[] = [];

  modalVisible   = false;
  modalGuardando = false;
  modoModal: 'agregar' | 'editar' = 'agregar';
  tipoModal: 'tutoria' | 'tesis' | null = null;
  editandoItemId: number | null = null;

  formTutoria!: FormGroup;
  formTesis!:   FormGroup;

  readonly gradoOpciones = [{ val: 'L', label: 'Licenciatura' }, { val: 'M', label: 'Maestría' }];

  ngOnInit(): void {
    this.initForms();
    this.cargarTodo();
    this.catalogoService.obtenerCarreras().subscribe({
      next: (d) => { this.carrerasDisponibles = d; this.cdr.detectChanges(); }
    });
  }

  private initForms(): void {
    this.formTutoria = this.fb.group({
      nombreAlumno:  ['', [Validators.required, Validators.maxLength(200)]],
      carrera:       ['', Validators.required],
      semestre:      [null, [Validators.required, Validators.min(1), Validators.max(12)]],
      fechaRegistro: ['', Validators.required]
    });
    this.formTesis = this.fb.group({
      titulo:          ['', Validators.required],
      nombreAlumno:    ['', [Validators.required, Validators.maxLength(200)]],
      grado:           ['L', Validators.required],
      avancePorcentaje:[null, [Validators.required, Validators.min(0), Validators.max(100)]],
      fechaRegistro:   ['', Validators.required],  // obligatorio
      fechaProgTerm:   [''],                        // opcional
      fechaReprogTerm: ['']                         // opcional
    });
  }

  private cargarTodo(): void {
    this.service.obtenerTutorias(this.reporteId).subscribe({ next: (d) => { this.tutorias = d; this.cdr.detectChanges(); } });
    this.service.obtenerTesis(this.reporteId).subscribe({ next: (d) => { this.tesis = d; this.cdr.detectChanges(); } });
  }

  get modalTitulo(): string {
    const p = this.modoModal === 'agregar' ? 'Agregar' : 'Editar';
    return `${p} ${this.tipoModal === 'tutoria' ? 'tutoría' : 'tesis'}`;
  }

  cerrarModal(): void {
    this.modalVisible = false; this.modalGuardando = false;
    this.tipoModal = null; this.editandoItemId = null;
    this.cdr.detectChanges();
  }

  guardarModal(): void {
    if (this.tipoModal === 'tutoria') this.guardarTutoria();
    else if (this.tipoModal === 'tesis') this.guardarTesis();
  }

  // ── TUTORÍAS ───────────────────────────────────────────────
  abrirAgregarTutoria(): void {
    this.tipoModal = 'tutoria'; this.modoModal = 'agregar'; this.editandoItemId = null;
    this.formTutoria.reset();
    this.modalVisible = true; this.cdr.detectChanges();
  }

  abrirEditarTutoria(t: TutoriaResponse): void {
    this.tipoModal = 'tutoria'; this.modoModal = 'editar'; this.editandoItemId = t.id;
    this.formTutoria.patchValue(t);
    this.modalVisible = true; this.cdr.detectChanges();
  }

  private guardarTutoria(): void {
    if (this.formTutoria.invalid) { this.formTutoria.markAllAsTouched(); return; }
    this.modalGuardando = true;
    const obs = this.modoModal === 'agregar'
      ? this.service.crearTutoria(this.reporteId, this.formTutoria.value)
      : this.service.actualizarTutoria(this.reporteId, this.editandoItemId!, this.formTutoria.value);
    obs.subscribe({
      next: (r) => {
        this.tutorias = this.modoModal === 'agregar' ? [...this.tutorias, r] : this.tutorias.map(t => t.id === this.editandoItemId ? r : t);
        this.modalGuardando = false; this.cerrarModal(); this.cdr.detectChanges();
        if (this.modoModal === 'agregar') this.registroAgregado.emit();
        this.notificacion.emit({ msg: this.modoModal === 'agregar' ? 'Tutoría agregada correctamente' : 'Tutoría actualizada', tipo: 'success' });
      },
      error: () => { this.modalGuardando = false; this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Error al guardar la tutoría', tipo: 'error' }); }
    });
  }

  eliminarTutoria(id: number): void {
    this.service.eliminarTutoria(this.reporteId, id).subscribe({
      next: () => { this.tutorias = this.tutorias.filter(t => t.id !== id); this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Tutoría eliminada', tipo: 'info' }); },
      error: () => this.notificacion.emit({ msg: 'Error al eliminar', tipo: 'error' })
    });
  }

  // ── TESIS ──────────────────────────────────────────────────
  abrirAgregarTesis(): void {
    this.tipoModal = 'tesis'; this.modoModal = 'agregar'; this.editandoItemId = null;
    this.formTesis.reset({ grado: 'L' });
    this.modalVisible = true; this.cdr.detectChanges();
  }

  abrirEditarTesis(t: DireccionTesisResponse): void {
    this.tipoModal = 'tesis'; this.modoModal = 'editar'; this.editandoItemId = t.id;
    this.formTesis.patchValue({
      ...t,
      fechaRegistro:   t.fechaRegistro   ?? '',
      fechaProgTerm:   t.fechaProgTerm   ?? '',
      fechaReprogTerm: t.fechaReprogTerm ?? ''
    });
    this.modalVisible = true; this.cdr.detectChanges();
  }

  private guardarTesis(): void {
    if (this.formTesis.invalid) { this.formTesis.markAllAsTouched(); return; }
    this.modalGuardando = true;
    const val = {
      ...this.formTesis.value,
      fechaProgTerm:   this.formTesis.value.fechaProgTerm   || null,
      fechaReprogTerm: this.formTesis.value.fechaReprogTerm || null
    };
    const obs = this.modoModal === 'agregar'
      ? this.service.crearTesis(this.reporteId, val)
      : this.service.actualizarTesis(this.reporteId, this.editandoItemId!, val);
    obs.subscribe({
      next: (r) => {
        this.tesis = this.modoModal === 'agregar' ? [...this.tesis, r] : this.tesis.map(t => t.id === this.editandoItemId ? r : t);
        this.modalGuardando = false; this.cerrarModal(); this.cdr.detectChanges();
        if (this.modoModal === 'agregar') this.registroAgregado.emit();
        this.notificacion.emit({ msg: this.modoModal === 'agregar' ? 'Tesis agregada correctamente' : 'Tesis actualizada', tipo: 'success' });
      },
      error: () => { this.modalGuardando = false; this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Error al guardar la tesis', tipo: 'error' }); }
    });
  }

  eliminarTesis(id: number): void {
    this.service.eliminarTesis(this.reporteId, id).subscribe({
      next: () => { this.tesis = this.tesis.filter(t => t.id !== id); this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Tesis eliminada', tipo: 'info' }); },
      error: () => this.notificacion.emit({ msg: 'Error al eliminar', tipo: 'error' })
    });
  }
}