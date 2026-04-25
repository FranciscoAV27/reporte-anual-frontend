// src/app/features/profesor/sections/docencia/docencia.component.ts

import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocenciaService } from '../../../services/docencia.service';
import { CursoImpartidoResponse } from '../../../../../shared/models/reporte/s1/curso-impartido.model';
import { ProductoApoyoDocenteResponse } from '../../../../../shared/models/reporte/s1/producto-apoyo-docente.model';
import { AsignaturaAfinidadResponse } from '../../../../../shared/models/reporte/s1/asignatura-afinidad.model';


@Component({
  selector: 'app-docencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './docencia.component.html',
  styleUrls: ['./docencia.component.css']
})
export class DocenciaComponent implements OnInit {
  @Input() reporteId!: number;
  @Input() problemasDocencia = '';
  @Input() oportunidadesDocencia = '';
  @Output() problemasChange = new EventEmitter<string>();
  @Output() oportunidadesChange = new EventEmitter<string>();

  private readonly docenciaService = inject(DocenciaService);
  private readonly fb = inject(FormBuilder);

  private readonly cdr = inject(ChangeDetectorRef);

  // ── Datos ──
  cursos:      CursoImpartidoResponse[]      = [];
  productos:   ProductoApoyoDocenteResponse[] = [];
  asignaturas: AsignaturaAfinidadResponse[]   = [];

  // ── UI toggles ──
  colapsado           = false;
  mostrarFormCurso    = false;
  mostrarFormProducto = false;
  mostrarFormAsignatura = false;

  // ── ID del item en modo edición ──
  editandoCursoId:      number | null = null;
  editandoProductoId:   number | null = null;
  editandoAsignaturaId: number | null = null;

  // ── Formularios de alta ──
  formNuevoCurso!:      FormGroup;
  formNuevoProducto!:   FormGroup;
  formNuevaAsignatura!: FormGroup;

  // ── Formularios de edición ──
  formEditCurso!:      FormGroup;
  formEditProducto!:   FormGroup;
  formEditAsignatura!: FormGroup;

  ngOnInit(): void {
    this.initForms();
    this.cargarTodo();
  }

  private initForms(): void {
    this.formNuevoCurso = this.fb.group({
      numeroCurso:  [null, [Validators.required, Validators.min(1)]],
      carrera:      ['',   [Validators.required, Validators.maxLength(150)]],
      asignatura:   ['',   [Validators.required, Validators.maxLength(200)]],
      semestre:     [null, [Validators.required, Validators.min(1), Validators.max(12)]],
      cicloEscolar: ['',   [Validators.required, Validators.maxLength(20)]],
      horasSemana:  [null, [Validators.required, Validators.min(1)]],
      numAlumnos:   [null, [Validators.required, Validators.min(0)]]
    });

    this.formNuevoProducto = this.fb.group({
      numeroCurso: [null, [Validators.required, Validators.min(1)]],
      descripcion: ['',   Validators.required],
      enlace:      ['',   Validators.maxLength(500)]
    });

    this.formNuevaAsignatura = this.fb.group({
      numAsignatura: [null, [Validators.required, Validators.min(1)]],
      carrera:       ['',   [Validators.required, Validators.maxLength(150)]],
      asignatura:    ['',   [Validators.required, Validators.maxLength(200)]],
      semestre:      [null, [Validators.required, Validators.min(1), Validators.max(12)]]
    });
  }

  private cargarTodo(): void {
    this.docenciaService.obtenerCursos(this.reporteId).subscribe({
      next: (data) => {this.cursos = data; this.cdr.detectChanges(); }
    });
    this.docenciaService.obtenerProductos(this.reporteId).subscribe({
      next: (data) => {this.productos = data; this.cdr.detectChanges(); }
    });
    this.docenciaService.obtenerAsignaturas(this.reporteId).subscribe({
      next: (data) => {this.asignaturas = data; this.cdr.detectChanges(); }
    });
  }

  toggleSeccion(): void { this.colapsado = !this.colapsado; }

  // ── CURSOS ──────────────────────────────────────────────────
//   agregarCurso(): void {
//     if (this.formNuevoCurso.invalid) { this.formNuevoCurso.markAllAsTouched(); return; }
//     this.docenciaService.crearCurso(this.reporteId, this.formNuevoCurso.value).subscribe({
//       next: (c) => {
//         this.cursos.push(c);
//         this.formNuevoCurso.reset();
//         this.mostrarFormCurso = false;
//       }
//     });
//   }

    abrirFormCurso(): void {
        this.mostrarFormCurso = true;
        this.formNuevoCurso.reset();
        this.formNuevoCurso.patchValue({ numeroCurso: this.siguienteNumeroCurso });
        this.cdr.detectChanges();
    }

    agregarCurso(): void {
        if (this.formNuevoCurso.invalid) { this.formNuevoCurso.markAllAsTouched(); return; }

        const num = this.formNuevoCurso.value.numeroCurso;
        if (this.numeroCursoYaExiste(num)) {
            alert(`El número de curso ${num} ya existe. Elige otro.`);
            return;
        }

        this.docenciaService.crearCurso(this.reporteId, this.formNuevoCurso.value).subscribe({
            next: (c) => {
            this.cursos.push(c);
            this.formNuevoCurso.reset();
            this.mostrarFormCurso = false;
            this.cdr.detectChanges();
            }
        });
    }

  activarEditCurso(c: CursoImpartidoResponse): void {
    this.editandoCursoId = c.id;
    this.formEditCurso = this.fb.group({
      numeroCurso:  [c.numeroCurso,  [Validators.required, Validators.min(1)]],
      carrera:      [c.carrera,      [Validators.required]],
      asignatura:   [c.asignatura,   [Validators.required]],
      semestre:     [c.semestre,     [Validators.required, Validators.min(1), Validators.max(12)]],
      cicloEscolar: [c.cicloEscolar, [Validators.required]],
      horasSemana:  [c.horasSemana,  [Validators.required, Validators.min(1)]],
      numAlumnos:   [c.numAlumnos,   [Validators.required, Validators.min(0)]]
    });
  }

  guardarCurso(id: number): void {
    if (this.formEditCurso.invalid) { this.formEditCurso.markAllAsTouched(); return; }
    this.docenciaService.actualizarCurso(this.reporteId, id, this.formEditCurso.value).subscribe({
      next: (updated) => {
        const idx = this.cursos.findIndex(c => c.id === id);
        if (idx >= 0) this.cursos[idx] = updated;
        this.editandoCursoId = null;
        this.cdr.detectChanges();
      }
    });
  }

  eliminarCurso(id: number): void {
    this.docenciaService.eliminarCurso(this.reporteId, id).subscribe({
      next: () => this.cursos = this.cursos.filter(c => c.id !== id)
    });
  }

  // ── PRODUCTOS ───────────────────────────────────────────────
  agregarProducto(): void {
    if (this.formNuevoProducto.invalid) { this.formNuevoProducto.markAllAsTouched(); return; }
    this.docenciaService.crearProducto(this.reporteId, this.formNuevoProducto.value).subscribe({
      next: (p) => {
        this.productos.push(p);
        this.formNuevoProducto.reset();
        this.mostrarFormProducto = false;
        this.cdr.detectChanges(); //nuevo
      }
    });
  }

  activarEditProducto(p: ProductoApoyoDocenteResponse): void {
    this.editandoProductoId = p.id;
    this.formEditProducto = this.fb.group({
      numeroCurso: [p.numeroCurso, [Validators.required, Validators.min(1)]],
      descripcion: [p.descripcion, Validators.required],
      enlace:      [p.enlace ?? '', Validators.maxLength(500)]
    });
  }

  guardarProducto(id: number): void {
    if (this.formEditProducto.invalid) { this.formEditProducto.markAllAsTouched(); return; }
    this.docenciaService.actualizarProducto(this.reporteId, id, this.formEditProducto.value).subscribe({
      next: (updated) => {
        const idx = this.productos.findIndex(p => p.id === id);
        if (idx >= 0) this.productos[idx] = updated;
        this.editandoProductoId = null;
        this.cdr.detectChanges();
      }
    });
  }

  eliminarProducto(id: number): void {
    this.docenciaService.eliminarProducto(this.reporteId, id).subscribe({
      next: () => {
        this.productos = this.productos.filter(p => p.id !== id);
        this.cdr.detectChanges();
      }
    });
  }

  // ── ASIGNATURAS ─────────────────────────────────────────────
//   agregarAsignatura(): void {
//     if (this.formNuevaAsignatura.invalid) { this.formNuevaAsignatura.markAllAsTouched(); return; }
//     this.docenciaService.crearAsignatura(this.reporteId, this.formNuevaAsignatura.value).subscribe({
//       next: (a) => {
//         this.asignaturas.push(a);
//         this.formNuevaAsignatura.reset();
//         this.mostrarFormAsignatura = false;
//       }
//     });
//   }

    abrirFormAsignatura(): void {
        this.mostrarFormAsignatura = true;
        this.formNuevaAsignatura.reset();
        this.formNuevaAsignatura.patchValue({ numAsignatura: this.siguienteNumeroAsignatura });
        this.cdr.detectChanges();
    }

    agregarAsignatura(): void {
        if (this.formNuevaAsignatura.invalid) { this.formNuevaAsignatura.markAllAsTouched(); return; }

        const num = this.formNuevaAsignatura.value.numAsignatura;
        if (this.numAsignaturaYaExiste(num)) {
            alert(`El número de asignatura ${num} ya existe. Elige otro.`);
            return;
        }

        this.docenciaService.crearAsignatura(this.reporteId, this.formNuevaAsignatura.value).subscribe({
            next: (a) => {
            this.asignaturas.push(a);
            this.formNuevaAsignatura.reset();
            this.mostrarFormAsignatura = false;
            this.cdr.detectChanges();
            }
        });
    }

  activarEditAsignatura(a: AsignaturaAfinidadResponse): void {
    this.editandoAsignaturaId = a.id;
    this.formEditAsignatura = this.fb.group({
      numAsignatura: [a.numAsignatura, [Validators.required, Validators.min(1)]],
      carrera:       [a.carrera,       [Validators.required]],
      asignatura:    [a.asignatura,    [Validators.required]],
      semestre:      [a.semestre,      [Validators.required, Validators.min(1), Validators.max(12)]]
    });
  }

  guardarAsignatura(id: number): void {
    if (this.formEditAsignatura.invalid) { this.formEditAsignatura.markAllAsTouched(); return; }
    this.docenciaService.actualizarAsignatura(this.reporteId, id, this.formEditAsignatura.value).subscribe({
      next: (updated) => {
        const idx = this.asignaturas.findIndex(a => a.id === id);
        if (idx >= 0) this.asignaturas[idx] = updated;
        this.editandoAsignaturaId = null;
        this.cdr.detectChanges();
      }
    });
  }

  eliminarAsignatura(id: number): void {
    this.docenciaService.eliminarAsignatura(this.reporteId, id).subscribe({
      next: () => {
        this.asignaturas = this.asignaturas.filter(a => a.id !== id);
        this.cdr.detectChanges();
      }
    });
  }

  // ── Computed: siguiente número disponible ──────────────────
    get siguienteNumeroCurso(): number {
    if (this.cursos.length === 0) return 1;
    return Math.max(...this.cursos.map(c => c.numeroCurso)) + 1;
    }

    get siguienteNumeroAsignatura(): number {
    if (this.asignaturas.length === 0) return 1;
    return Math.max(...this.asignaturas.map(a => a.numAsignatura)) + 1;
    }

    // ── Validación: número ya existe ───────────────────────────
    numeroCursoYaExiste(num: number, excludeId?: number): boolean {
    return this.cursos.some(c => c.numeroCurso === num && c.id !== excludeId);
    }

    numAsignaturaYaExiste(num: number, excludeId?: number): boolean {
    return this.asignaturas.some(a => a.numAsignatura === num && a.id !== excludeId);
    }

    // ── Abrir formularios con autonumeración ───────────────────


abrirFormProducto(): void {
  this.mostrarFormProducto = true;
  this.formNuevoProducto.reset();
  this.cdr.detectChanges();
}



// ── Cancelar formularios ───────────────────────────────────
cancelarFormCurso(): void {
  this.mostrarFormCurso = false;
  this.formNuevoCurso.reset();
  this.cdr.detectChanges();
}

cancelarFormProducto(): void {
  this.mostrarFormProducto = false;
  this.formNuevoProducto.reset();
  this.cdr.detectChanges();
}

cancelarFormAsignatura(): void {
  this.mostrarFormAsignatura = false;
  this.formNuevaAsignatura.reset();
  this.cdr.detectChanges();
}
}