// src/app/features/profesor/sections/formacion-rh/formacion-rh.component.ts
import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormacionRhService } from '../../../services/formacion-rh.service';
import { TutoriaResponse } from '../../../../../shared/models/reporte/s2/tutoria.model';
import { DireccionTesisResponse } from '../../../../../shared/models/reporte/s2/direccion-tesis.model';

@Component({
  selector: 'app-formacion-rh',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formacion-rh.component.html',
  styleUrls: ['./formacion-rh.component.css']
})
export class FormacionRhComponent implements OnInit {
  @Input() reporteId!: number;

  private readonly service = inject(FormacionRhService);
  private readonly fb      = inject(FormBuilder);
  private readonly cdr     = inject(ChangeDetectorRef);

  tutorias:  TutoriaResponse[]       = [];
  tesis:     DireccionTesisResponse[] = [];
  colapsado  = false;

  mostrarFormTutoria = false;
  mostrarFormTesis   = false;
  editandoTutoriaId: number | null = null;
  editandoTesisId:   number | null = null;

  formNuevaTutoria!: FormGroup;
  formNuevaTesis!:   FormGroup;
  formEditTutoria!:  FormGroup;
  formEditTesis!:    FormGroup;

  readonly gradoOpciones   = [{ val: 'L', label: 'Licenciatura' }, { val: 'M', label: 'Maestría' }];

  ngOnInit(): void {
    this.initForms();
    this.cargarTodo();
  }

  private initForms(): void {
    this.formNuevaTutoria = this.fb.group({
      nombreAlumno:  ['', [Validators.required, Validators.maxLength(200)]],
      carrera:       ['', [Validators.required, Validators.maxLength(150)]],
      semestre:      [null, [Validators.required, Validators.min(1), Validators.max(12)]],
      fechaRegistro: ['', Validators.required]
    });
    this.formNuevaTesis = this.fb.group({
      titulo:          ['', Validators.required],
      nombreAlumno:    ['', [Validators.required, Validators.maxLength(200)]],
      grado:           ['L', Validators.required],
      avancePorcentaje:[null, [Validators.required, Validators.min(0), Validators.max(100)]],
      fechaRegistro:   [''],
      fechaProgTerm:   [''],
      fechaReprogTerm: ['']
    });
  }

  private cargarTodo(): void {
    this.service.obtenerTutorias(this.reporteId).subscribe({
      next: (data) => { this.tutorias = data; this.cdr.detectChanges(); }
    });
    this.service.obtenerTesis(this.reporteId).subscribe({
      next: (data) => { this.tesis = data; this.cdr.detectChanges(); }
    });
  }

  toggleSeccion(): void { this.colapsado = !this.colapsado; }

  // ── TUTORÍAS ───────────────────────────────────────────────
  abrirFormTutoria(): void {
    this.mostrarFormTutoria = true;
    this.formNuevaTutoria.reset();
    this.cdr.detectChanges();
  }
  cancelarFormTutoria(): void {
    this.mostrarFormTutoria = false;
    this.formNuevaTutoria.reset();
    this.cdr.detectChanges();
  }
  agregarTutoria(): void {
    if (this.formNuevaTutoria.invalid) { this.formNuevaTutoria.markAllAsTouched(); return; }
    this.service.crearTutoria(this.reporteId, this.formNuevaTutoria.value).subscribe({
      next: (t) => {
        this.tutorias = [...this.tutorias, t];
        this.mostrarFormTutoria = false;
        this.formNuevaTutoria.reset();
        this.cdr.detectChanges();
      }
    });
  }
  activarEditTutoria(t: TutoriaResponse): void {
    this.editandoTutoriaId = t.id;
    this.formEditTutoria = this.fb.group({
      nombreAlumno:  [t.nombreAlumno,  [Validators.required]],
      carrera:       [t.carrera,       [Validators.required]],
      semestre:      [t.semestre,      [Validators.required, Validators.min(1), Validators.max(12)]],
      fechaRegistro: [t.fechaRegistro, Validators.required]
    });
    this.cdr.detectChanges();
  }
  guardarTutoria(id: number): void {
    if (this.formEditTutoria.invalid) { this.formEditTutoria.markAllAsTouched(); return; }
    this.service.actualizarTutoria(this.reporteId, id, this.formEditTutoria.value).subscribe({
      next: (u) => {
        this.tutorias = this.tutorias.map(t => t.id === id ? u : t);
        this.editandoTutoriaId = null;
        this.cdr.detectChanges();
      }
    });
  }
  eliminarTutoria(id: number): void {
    this.service.eliminarTutoria(this.reporteId, id).subscribe({
      next: () => { this.tutorias = this.tutorias.filter(t => t.id !== id); this.cdr.detectChanges(); }
    });
  }

  // ── TESIS ──────────────────────────────────────────────────
  abrirFormTesis(): void {
    this.mostrarFormTesis = true;
    this.formNuevaTesis.reset({ grado: 'L' });
    this.cdr.detectChanges();
  }
  cancelarFormTesis(): void {
    this.mostrarFormTesis = false;
    this.formNuevaTesis.reset();
    this.cdr.detectChanges();
  }
  agregarTesis(): void {
    if (this.formNuevaTesis.invalid) { this.formNuevaTesis.markAllAsTouched(); return; }
    const val = this.limpiarFechas(this.formNuevaTesis.value);
    this.service.crearTesis(this.reporteId, val).subscribe({
      next: (t) => {
        this.tesis = [...this.tesis, t];
        this.mostrarFormTesis = false;
        this.formNuevaTesis.reset();
        this.cdr.detectChanges();
      }
    });
  }
  activarEditTesis(t: DireccionTesisResponse): void {
    this.editandoTesisId = t.id;
    this.formEditTesis = this.fb.group({
      titulo:          [t.titulo,           Validators.required],
      nombreAlumno:    [t.nombreAlumno,     Validators.required],
      grado:           [t.grado,            Validators.required],
      avancePorcentaje:[t.avancePorcentaje, [Validators.required, Validators.min(0), Validators.max(100)]],
      fechaRegistro:   [t.fechaRegistro   ?? ''],
      fechaProgTerm:   [t.fechaProgTerm   ?? ''],
      fechaReprogTerm: [t.fechaReprogTerm ?? '']
    });
    this.cdr.detectChanges();
  }
  guardarTesis(id: number): void {
    if (this.formEditTesis.invalid) { this.formEditTesis.markAllAsTouched(); return; }
    const val = this.limpiarFechas(this.formEditTesis.value);
    this.service.actualizarTesis(this.reporteId, id, val).subscribe({
      next: (u) => {
        this.tesis = this.tesis.map(t => t.id === id ? u : t);
        this.editandoTesisId = null;
        this.cdr.detectChanges();
      }
    });
  }
  eliminarTesis(id: number): void {
    this.service.eliminarTesis(this.reporteId, id).subscribe({
      next: () => { this.tesis = this.tesis.filter(t => t.id !== id); this.cdr.detectChanges(); }
    });
  }

  // Convierte strings vacíos en null para campos de fecha opcionales
  private limpiarFechas(val: any): any {
    return {
      ...val,
      fechaRegistro:   val.fechaRegistro   || null,
      fechaProgTerm:   val.fechaProgTerm   || null,
      fechaReprogTerm: val.fechaReprogTerm || null
    };
  }
}