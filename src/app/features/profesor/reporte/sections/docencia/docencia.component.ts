// docencia.component.ts
/*import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocenciaService } from '../../../services/docencia.service';
import { CursoImpartidoResponse } from '../../../../../shared/models/reporte/s1/curso-impartido.model';
import { ProductoApoyoDocenteResponse } from '../../../../../shared/models/reporte/s1/producto-apoyo-docente.model';
import { AsignaturaAfinidadResponse } from '../../../../../shared/models/reporte/s1/asignatura-afinidad.model';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-docencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './docencia.component.html',
  styleUrls: ['./docencia.component.css']
})
export class DocenciaComponent implements OnInit {
  @Input() reporteId!: number;
  @Input() problemasDocencia = '';
  @Input() oportunidadesDocencia = '';
  @Output() problemasChange        = new EventEmitter<string>();
  @Output() oportunidadesChange    = new EventEmitter<string>();
  @Output() registroAgregado       = new EventEmitter<void>();
  @Output() solicitarGuardarTextos = new EventEmitter<void>();
  @Output() notificacion           = new EventEmitter<{msg: string, tipo: string}>();

  private readonly docenciaService = inject(DocenciaService);
  private readonly fb              = inject(FormBuilder);
  private readonly cdr             = inject(ChangeDetectorRef);

  cursos:      CursoImpartidoResponse[]       = [];
  productos:   ProductoApoyoDocenteResponse[] = [];
  asignaturas: AsignaturaAfinidadResponse[]   = [];

  // ── Estado modal ───────────────────────────────────────────
  modalVisible    = false;
  modalGuardando  = false;
  modoModal: 'agregar' | 'editar' = 'agregar';
  tipoModal: 'curso' | 'producto' | 'asignatura' | null = null;
  editandoItemId: number | null = null;

  // ── Formularios (uno por tabla, reutilizado para add y edit) ──
  formCurso!:      FormGroup;
  formProducto!:   FormGroup;
  formAsignatura!: FormGroup;

  ngOnInit(): void { this.initForms(); this.cargarTodo(); }

  private initForms(): void {
    this.formCurso = this.fb.group({
      numeroCurso:  [null, [Validators.required, Validators.min(1)]],
      carrera:      ['',   [Validators.required, Validators.maxLength(150)]],
      asignatura:   ['',   [Validators.required, Validators.maxLength(200)]],
      semestre:     [null, [Validators.required, Validators.min(1), Validators.max(12)]],
      cicloEscolar: ['',   [Validators.required, Validators.maxLength(20)]],
      horasSemana:  [null, [Validators.required, Validators.min(1)]],
      numAlumnos:   [null, [Validators.required, Validators.min(0)]]
    });
    this.formProducto = this.fb.group({
      numeroCurso: [null, [Validators.required, Validators.min(1)]],
      descripcion: ['',   Validators.required],
      enlace:      ['',   Validators.maxLength(500)]
    });
    this.formAsignatura = this.fb.group({
      numAsignatura: [null, [Validators.required, Validators.min(1)]],
      carrera:       ['',   [Validators.required, Validators.maxLength(150)]],
      asignatura:    ['',   [Validators.required, Validators.maxLength(200)]],
      semestre:      [null, [Validators.required, Validators.min(1), Validators.max(12)]]
    });
  }

  private cargarTodo(): void {
    this.docenciaService.obtenerCursos(this.reporteId).subscribe({
      next: (d) => { this.cursos = d; this.cdr.detectChanges(); }
    });
    this.docenciaService.obtenerProductos(this.reporteId).subscribe({
      next: (d) => { this.productos = d; this.cdr.detectChanges(); }
    });
    this.docenciaService.obtenerAsignaturas(this.reporteId).subscribe({
      next: (d) => { this.asignaturas = d; this.cdr.detectChanges(); }
    });
  }

  // ── Autonumeración ─────────────────────────────────────────
  get siguienteNumeroCurso(): number {
    return this.cursos.length === 0 ? 1 : Math.max(...this.cursos.map(c => c.numeroCurso)) + 1;
  }
  get siguienteNumeroAsignatura(): number {
    return this.asignaturas.length === 0 ? 1 : Math.max(...this.asignaturas.map(a => a.numAsignatura)) + 1;
  }
  private numeroCursoYaExiste(num: number): boolean {
    return this.cursos.some(c => c.numeroCurso === num && c.id !== this.editandoItemId);
  }
  private numAsignaturaYaExiste(num: number): boolean {
    return this.asignaturas.some(a => a.numAsignatura === num && a.id !== this.editandoItemId);
  }

  // ── Modal: título dinámico ─────────────────────────────────
  get modalTitulo(): string {
    const p = this.modoModal === 'agregar' ? 'Agregar' : 'Editar';
    const n: Record<string, string> = {
      curso: 'curso impartido', producto: 'producto de apoyo', asignatura: 'asignatura de afinidad'
    };
    return `${p} ${n[this.tipoModal ?? 'curso']}`;
  }

  cerrarModal(): void {
    this.modalVisible   = false;
    this.modalGuardando = false;
    this.tipoModal      = null;
    this.editandoItemId = null;
    this.cdr.detectChanges();
  }

  guardarModal(): void {
    if (this.tipoModal === 'curso')           this.guardarCurso();
    else if (this.tipoModal === 'producto')   this.guardarProducto();
    else if (this.tipoModal === 'asignatura') this.guardarAsignatura();
  }

  // ── CURSOS ──────────────────────────────────────────────────
  abrirAgregarCurso(): void {
    this.tipoModal = 'curso'; this.modoModal = 'agregar'; this.editandoItemId = null;
    this.formCurso.reset({ numeroCurso: this.siguienteNumeroCurso });
    this.modalVisible = true; this.cdr.detectChanges();
  }
  abrirEditarCurso(c: CursoImpartidoResponse): void {
    this.tipoModal = 'curso'; this.modoModal = 'editar'; this.editandoItemId = c.id;
    this.formCurso.patchValue(c);
    this.modalVisible = true; this.cdr.detectChanges();
  }
  private guardarCurso(): void {
    if (this.formCurso.invalid) { this.formCurso.markAllAsTouched(); return; }
    const num = this.formCurso.value.numeroCurso;
    if (this.numeroCursoYaExiste(num)) {
      this.notificacion.emit({ msg: `El número de curso ${num} ya existe.`, tipo: 'error' }); return;
    }
    this.modalGuardando = true;
    const obs = this.modoModal === 'agregar'
      ? this.docenciaService.crearCurso(this.reporteId, this.formCurso.value)
      : this.docenciaService.actualizarCurso(this.reporteId, this.editandoItemId!, this.formCurso.value);
    obs.subscribe({
      next: (result) => {
        this.cursos = this.modoModal === 'agregar'
          ? [...this.cursos, result]
          : this.cursos.map(c => c.id === this.editandoItemId ? result : c);
        this.modalGuardando = false; this.cerrarModal(); this.cdr.detectChanges();
        if (this.modoModal === 'agregar') this.registroAgregado.emit();
        this.notificacion.emit({ msg: this.modoModal === 'agregar' ? 'Curso agregado correctamente' : 'Curso actualizado', tipo: 'success' });
      },
      error: () => { this.modalGuardando = false; this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Error al guardar el curso', tipo: 'error' }); }
    });
  }
  eliminarCurso(id: number): void {
    this.docenciaService.eliminarCurso(this.reporteId, id).subscribe({
      next: () => { this.cursos = this.cursos.filter(c => c.id !== id); this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Curso eliminado', tipo: 'info' }); },
      error: () => this.notificacion.emit({ msg: 'Error al eliminar', tipo: 'error' })
    });
  }

  // ── PRODUCTOS ───────────────────────────────────────────────
  abrirAgregarProducto(): void {
    this.tipoModal = 'producto'; this.modoModal = 'agregar'; this.editandoItemId = null;
    this.formProducto.reset();
    this.modalVisible = true; this.cdr.detectChanges();
  }
  abrirEditarProducto(p: ProductoApoyoDocenteResponse): void {
    this.tipoModal = 'producto'; this.modoModal = 'editar'; this.editandoItemId = p.id;
    this.formProducto.patchValue(p);
    this.modalVisible = true; this.cdr.detectChanges();
  }
  private guardarProducto(): void {
    if (this.formProducto.invalid) { this.formProducto.markAllAsTouched(); return; }
    this.modalGuardando = true;
    const obs = this.modoModal === 'agregar'
      ? this.docenciaService.crearProducto(this.reporteId, this.formProducto.value)
      : this.docenciaService.actualizarProducto(this.reporteId, this.editandoItemId!, this.formProducto.value);
    obs.subscribe({
      next: (result) => {
        this.productos = this.modoModal === 'agregar'
          ? [...this.productos, result]
          : this.productos.map(p => p.id === this.editandoItemId ? result : p);
        this.modalGuardando = false; this.cerrarModal(); this.cdr.detectChanges();
        if (this.modoModal === 'agregar') this.registroAgregado.emit();
        this.notificacion.emit({ msg: this.modoModal === 'agregar' ? 'Producto agregado correctamente' : 'Producto actualizado', tipo: 'success' });
      },
      error: () => { this.modalGuardando = false; this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Error al guardar el producto', tipo: 'error' }); }
    });
  }
  eliminarProducto(id: number): void {
    this.docenciaService.eliminarProducto(this.reporteId, id).subscribe({
      next: () => { this.productos = this.productos.filter(p => p.id !== id); this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Producto eliminado', tipo: 'info' }); },
      error: () => this.notificacion.emit({ msg: 'Error al eliminar', tipo: 'error' })
    });
  }

  // ── ASIGNATURAS ─────────────────────────────────────────────
  abrirAgregarAsignatura(): void {
    this.tipoModal = 'asignatura'; this.modoModal = 'agregar'; this.editandoItemId = null;
    this.formAsignatura.reset({ numAsignatura: this.siguienteNumeroAsignatura });
    this.modalVisible = true; this.cdr.detectChanges();
  }
  abrirEditarAsignatura(a: AsignaturaAfinidadResponse): void {
    this.tipoModal = 'asignatura'; this.modoModal = 'editar'; this.editandoItemId = a.id;
    this.formAsignatura.patchValue(a);
    this.modalVisible = true; this.cdr.detectChanges();
  }
  private guardarAsignatura(): void {
    if (this.formAsignatura.invalid) { this.formAsignatura.markAllAsTouched(); return; }
    const num = this.formAsignatura.value.numAsignatura;
    if (this.numAsignaturaYaExiste(num)) {
      this.notificacion.emit({ msg: `El número de asignatura ${num} ya existe.`, tipo: 'error' }); return;
    }
    this.modalGuardando = true;
    const obs = this.modoModal === 'agregar'
      ? this.docenciaService.crearAsignatura(this.reporteId, this.formAsignatura.value)
      : this.docenciaService.actualizarAsignatura(this.reporteId, this.editandoItemId!, this.formAsignatura.value);
    obs.subscribe({
      next: (result) => {
        this.asignaturas = this.modoModal === 'agregar'
          ? [...this.asignaturas, result]
          : this.asignaturas.map(a => a.id === this.editandoItemId ? result : a);
        this.modalGuardando = false; this.cerrarModal(); this.cdr.detectChanges();
        if (this.modoModal === 'agregar') this.registroAgregado.emit();
        this.notificacion.emit({ msg: this.modoModal === 'agregar' ? 'Asignatura agregada correctamente' : 'Asignatura actualizada', tipo: 'success' });
      },
      error: () => { this.modalGuardando = false; this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Error al guardar la asignatura', tipo: 'error' }); }
    });
  }
  eliminarAsignatura(id: number): void {
    this.docenciaService.eliminarAsignatura(this.reporteId, id).subscribe({
      next: () => { this.asignaturas = this.asignaturas.filter(a => a.id !== id); this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Asignatura eliminada', tipo: 'info' }); },
      error: () => this.notificacion.emit({ msg: 'Error al eliminar', tipo: 'error' })
    });
  }
}*/

// docencia.component.ts
import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocenciaService } from '../../../services/docencia.service';
import { CatalogoService } from '../../../../../core/services/catalogo.service';
import { CursoImpartidoResponse } from '../../../../../shared/models/reporte/s1/curso-impartido.model';
import { ProductoApoyoDocenteResponse } from '../../../../../shared/models/reporte/s1/producto-apoyo-docente.model';
import { AsignaturaAfinidadResponse } from '../../../../../shared/models/reporte/s1/asignatura-afinidad.model';
import { CarreraResponse, AsignaturaResponse } from '../../../../../shared/models/catalogo.model';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-docencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './docencia.component.html',
  styleUrls: ['./docencia.component.css']
})
export class DocenciaComponent implements OnInit {
  @Input() reporteId!: number;
  @Input() problemasDocencia = '';
  @Input() oportunidadesDocencia = '';
  @Output() problemasChange        = new EventEmitter<string>();
  @Output() oportunidadesChange    = new EventEmitter<string>();
  @Output() registroAgregado       = new EventEmitter<void>();
  @Output() solicitarGuardarTextos = new EventEmitter<void>();
  @Output() notificacion           = new EventEmitter<{msg: string, tipo: string}>();

  @Input() anioReporte!: number; // ← nuevo

  private readonly docenciaService = inject(DocenciaService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly fb              = inject(FormBuilder);
  private readonly cdr             = inject(ChangeDetectorRef);

  cursos:      CursoImpartidoResponse[]       = [];
  productos:   ProductoApoyoDocenteResponse[] = [];
  asignaturas: AsignaturaAfinidadResponse[]   = [];

  // ── Catálogo ───────────────────────────────────────────────
  carrerasDisponibles:      CarreraResponse[]    = [];
  asignaturasCursoModal:    AsignaturaResponse[] = [];
  asignaturasAfinidadModal: AsignaturaResponse[] = [];

  // ── Estado modal ───────────────────────────────────────────
  modalVisible    = false;
  modalGuardando  = false;
  modoModal: 'agregar' | 'editar' = 'agregar';
  tipoModal: 'curso' | 'producto' | 'asignatura' | null = null;
  editandoItemId:       number | null = null;
  editandoCursoNumero:  number | null = null;
  editandoAsinNumero:   number | null = null;

  formCurso!:      FormGroup;
  formProducto!:   FormGroup;
  formAsignatura!: FormGroup;

  readonly anioActual = new Date().getFullYear();

  ngOnInit(): void {
    this.initForms();
    this.cargarTodo();
    this.cargarCatalogos();
  }

  private initForms(): void {
    this.formCurso = this.fb.group({
      carrera:      ['',   Validators.required],
      asignatura:   ['',   Validators.required],
      semestre:     [null, [Validators.required, Validators.min(1), Validators.max(12)]],
      cicloEscolar: ['',   Validators.required],
      horasSemana:  [null, [Validators.required, Validators.min(1)]],
      numAlumnos:   [null, [Validators.required, Validators.min(0)]]
    });
    this.formProducto = this.fb.group({
      numeroCurso: [null, Validators.required],
      descripcion: ['',   Validators.required],
      enlace:      ['',   Validators.maxLength(500)]
    });
    this.formAsignatura = this.fb.group({
      carrera:    ['',   Validators.required],
      asignatura: ['',   Validators.required],
      semestre:   [null, [Validators.required, Validators.min(1), Validators.max(12)]]
    });
  }

  private cargarTodo(): void {
    this.docenciaService.obtenerCursos(this.reporteId).subscribe({
      next: (d) => { this.cursos = d; this.cdr.detectChanges(); }
    });
    this.docenciaService.obtenerProductos(this.reporteId).subscribe({
      next: (d) => { this.productos = d; this.cdr.detectChanges(); }
    });
    this.docenciaService.obtenerAsignaturas(this.reporteId).subscribe({
      next: (d) => { this.asignaturas = d; this.cdr.detectChanges(); }
    });
  }

  private cargarCatalogos(): void {
    this.catalogoService.obtenerCarreras().subscribe({
      next: (d) => { this.carrerasDisponibles = d; this.cdr.detectChanges(); }
    });
  }

  // ── Catálogo: cambio de carrera ────────────────────────────
  onCarreraCursoChange(nombre: string): void {
    this.formCurso.patchValue({ asignatura: '', semestre: null, cicloEscolar: '' });
    this.asignaturasCursoModal = [];
    if (!nombre) return;
    const carrera = this.carrerasDisponibles.find(c => c.nombre === nombre);
    if (!carrera) return;
    this.catalogoService.obtenerAsignaturasPorCarrera(carrera.id).subscribe({
      next: (d) => { this.asignaturasCursoModal = d; this.cdr.detectChanges(); }
    });
  }

  onAsignaturaCursoChange(nombre: string): void {
    const asig = this.asignaturasCursoModal.find(a => a.nombre === nombre);
    if (!asig) return;
    const ciclo = this.calcularCiclo(asig.semestre);
    this.formCurso.patchValue({ semestre: asig.semestre, cicloEscolar: ciclo });
    this.cdr.detectChanges();
  }

  onCarreraAfinidadChange(nombre: string): void {
    this.formAsignatura.patchValue({ asignatura: '', semestre: null });
    this.asignaturasAfinidadModal = [];
    if (!nombre) return;
    const carrera = this.carrerasDisponibles.find(c => c.nombre === nombre);
    if (!carrera) return;
    this.catalogoService.obtenerAsignaturasPorCarrera(carrera.id).subscribe({
      next: (d) => { this.asignaturasAfinidadModal = d; this.cdr.detectChanges(); }
    });
  }

  onAsignaturaAfinidadChange(nombre: string): void {
    const asig = this.asignaturasAfinidadModal.find(a => a.nombre === nombre);
    if (!asig) return;
    this.formAsignatura.patchValue({ semestre: asig.semestre });
    this.cdr.detectChanges();
  }

  // private calcularCiclo(semestre: number): string {
  //   const a = this.anioActual;
  //   return semestre % 2 !== 0 ? `${a}-${a + 1}` : `${a + 1}-${a + 1}`;
  // }

  private calcularCiclo(semestre: number): string {
    const inicio = this.anioReporte - 1;
    return semestre % 2 !== 0
      ? `${inicio}-${this.anioReporte}`    // impar: oct–feb
      : `${this.anioReporte}-${this.anioReporte}`; // par: mar–jul
  }

  // ── Autonumeración ─────────────────────────────────────────
  get siguienteNumeroCurso(): number {
    return this.cursos.length === 0 ? 1 : Math.max(...this.cursos.map(c => c.numeroCurso)) + 1;
  }
  get siguienteNumeroAsignatura(): number {
    return this.asignaturas.length === 0 ? 1 : Math.max(...this.asignaturas.map(a => a.numAsignatura)) + 1;
  }

  // ── Modal helpers ──────────────────────────────────────────
  get modalTitulo(): string {
    const p = this.modoModal === 'agregar' ? 'Agregar' : 'Editar';
    const n: Record<string, string> = {
      curso: 'curso impartido', producto: 'producto de apoyo', asignatura: 'asignatura de afinidad'
    };
    return `${p} ${n[this.tipoModal ?? 'curso']}`;
  }

  cerrarModal(): void {
    this.modalVisible = false; this.modalGuardando = false;
    this.tipoModal = null; this.editandoItemId = null;
    this.editandoCursoNumero = null; this.editandoAsinNumero = null;
    this.cdr.detectChanges();
  }

  guardarModal(): void {
    if (this.tipoModal === 'curso')           this.guardarCurso();
    else if (this.tipoModal === 'producto')   this.guardarProducto();
    else if (this.tipoModal === 'asignatura') this.guardarAsignatura();
  }

  // ── CURSOS ──────────────────────────────────────────────────
  abrirAgregarCurso(): void {
    this.tipoModal = 'curso'; this.modoModal = 'agregar';
    this.editandoItemId = null; this.editandoCursoNumero = null;
    this.asignaturasCursoModal = [];
    this.formCurso.reset();
    this.modalVisible = true; this.cdr.detectChanges();
  }

  abrirEditarCurso(c: CursoImpartidoResponse): void {
    this.tipoModal = 'curso'; this.modoModal = 'editar';
    this.editandoItemId = c.id; this.editandoCursoNumero = c.numeroCurso;
    this.asignaturasCursoModal = [];
    this.formCurso.patchValue({
      carrera: c.carrera, asignatura: '',
      semestre: c.semestre, cicloEscolar: c.cicloEscolar,
      horasSemana: c.horasSemana, numAlumnos: c.numAlumnos
    });
    const carreraObj = this.carrerasDisponibles.find(cr => cr.nombre === c.carrera);
    if (carreraObj) {
      this.catalogoService.obtenerAsignaturasPorCarrera(carreraObj.id).subscribe({
        next: (d) => {
          this.asignaturasCursoModal = d;
          this.formCurso.patchValue({ asignatura: c.asignatura });
          this.cdr.detectChanges();
        }
      });
    }
    this.modalVisible = true; this.cdr.detectChanges();
  }

  private guardarCurso(): void {
    if (this.formCurso.invalid) { this.formCurso.markAllAsTouched(); return; }
    this.modalGuardando = true;
    const numeroCurso = this.modoModal === 'agregar'
      ? this.siguienteNumeroCurso
      : this.editandoCursoNumero!;
    const payload = { numeroCurso, ...this.formCurso.value };
    const obs = this.modoModal === 'agregar'
      ? this.docenciaService.crearCurso(this.reporteId, payload)
      : this.docenciaService.actualizarCurso(this.reporteId, this.editandoItemId!, payload);
    obs.subscribe({
      next: (r) => {
        this.cursos = this.modoModal === 'agregar'
          ? [...this.cursos, r]
          : this.cursos.map(c => c.id === this.editandoItemId ? r : c);
        this.modalGuardando = false; this.cerrarModal(); this.cdr.detectChanges();
        if (this.modoModal === 'agregar') this.registroAgregado.emit();
        this.notificacion.emit({ msg: this.modoModal === 'agregar' ? 'Curso agregado correctamente' : 'Curso actualizado', tipo: 'success' });
      },
      error: () => { this.modalGuardando = false; this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Error al guardar el curso', tipo: 'error' }); }
    });
  }

  // eliminarCurso(id: number): void {
  //   this.docenciaService.eliminarCurso(this.reporteId, id).subscribe({
  //     next: () => { this.cursos = this.cursos.filter(c => c.id !== id); this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Curso eliminado', tipo: 'info' }); },
  //     error: () => this.notificacion.emit({ msg: 'Error al eliminar', tipo: 'error' })
  //   });
  // }

  eliminarCurso(id: number): void {
    const curso = this.cursos.find(c => c.id === id)!;
    const numEliminado = curso.numeroCurso;

    // Pre-calculamos los afectados antes de cualquier operación
    const productosHuerfanos  = this.productos.filter(p => p.numeroCurso === numEliminado);
    const cursosAfectados     = this.cursos.filter(c => c.numeroCurso > numEliminado);
    const productosAfectados  = this.productos.filter(p => p.numeroCurso > numEliminado);

    this.docenciaService.eliminarCurso(this.reporteId, id).pipe(

      // Paso 2: eliminar productos huérfanos
      switchMap(() => {
        if (productosHuerfanos.length === 0) return of(null);
        return forkJoin(
          productosHuerfanos.map(p => this.docenciaService.eliminarProducto(this.reporteId, p.id))
        );
      }),

      // Paso 3: reordenar cursos
      switchMap(() => {
        if (cursosAfectados.length === 0) return of(null);
        return forkJoin(
          cursosAfectados.map(c =>
            this.docenciaService.actualizarCurso(this.reporteId, c.id, {
              numeroCurso:  c.numeroCurso - 1,
              carrera:      c.carrera,
              asignatura:   c.asignatura,
              semestre:     c.semestre,
              cicloEscolar: c.cicloEscolar,
              horasSemana:  c.horasSemana,
              numAlumnos:   c.numAlumnos
            })
          )
        );
      }),

      // Paso 4: reordenar referencias de productos
      switchMap(() => {
        if (productosAfectados.length === 0) return of(null);
        return forkJoin(
          productosAfectados.map(p =>
            this.docenciaService.actualizarProducto(this.reporteId, p.id, {
              numeroCurso: p.numeroCurso - 1,
              descripcion: p.descripcion,
              enlace:      p.enlace ?? ''
            })
          )
        );
      })

    ).subscribe({
      next: () => {
        this.cargarTodo();
        this.cdr.detectChanges();
        this.notificacion.emit({ msg: 'Curso eliminado correctamente', tipo: 'info' });
      },
      error: () => this.notificacion.emit({ msg: 'Error al eliminar el curso', tipo: 'error' })
    });
  }

  // ── PRODUCTOS ───────────────────────────────────────────────
  abrirAgregarProducto(): void {
    this.tipoModal = 'producto'; this.modoModal = 'agregar'; this.editandoItemId = null;
    this.formProducto.reset();
    this.modalVisible = true; this.cdr.detectChanges();
  }

  abrirEditarProducto(p: ProductoApoyoDocenteResponse): void {
    this.tipoModal = 'producto'; this.modoModal = 'editar'; this.editandoItemId = p.id;
    this.formProducto.patchValue(p);
    this.modalVisible = true; this.cdr.detectChanges();
  }

  private guardarProducto(): void {
    if (this.formProducto.invalid) { this.formProducto.markAllAsTouched(); return; }
    this.modalGuardando = true;
    const obs = this.modoModal === 'agregar'
      ? this.docenciaService.crearProducto(this.reporteId, this.formProducto.value)
      : this.docenciaService.actualizarProducto(this.reporteId, this.editandoItemId!, this.formProducto.value);
    obs.subscribe({
      next: (r) => {
        this.productos = this.modoModal === 'agregar' ? [...this.productos, r] : this.productos.map(p => p.id === this.editandoItemId ? r : p);
        this.modalGuardando = false; this.cerrarModal(); this.cdr.detectChanges();
        if (this.modoModal === 'agregar') this.registroAgregado.emit();
        this.notificacion.emit({ msg: this.modoModal === 'agregar' ? 'Producto agregado correctamente' : 'Producto actualizado', tipo: 'success' });
      },
      error: () => { this.modalGuardando = false; this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Error al guardar el producto', tipo: 'error' }); }
    });
  }

  // eliminarProducto(id: number): void {
  //   this.docenciaService.eliminarProducto(this.reporteId, id).subscribe({
  //     next: () => { this.productos = this.productos.filter(p => p.id !== id); this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Producto eliminado', tipo: 'info' }); },
  //     error: () => this.notificacion.emit({ msg: 'Error al eliminar', tipo: 'error' })
  //   });
  // }

  eliminarProducto(id: number): void {
    // Productos no tienen campo numérico propio, solo se eliminan
    this.docenciaService.eliminarProducto(this.reporteId, id).subscribe({
      next: () => {
        this.productos = this.productos.filter(p => p.id !== id);
        this.cdr.detectChanges();
        this.notificacion.emit({ msg: 'Producto eliminado', tipo: 'info' });
      },
      error: () => this.notificacion.emit({ msg: 'Error al eliminar', tipo: 'error' })
    });
  }

  // ── ASIGNATURAS ─────────────────────────────────────────────
  abrirAgregarAsignatura(): void {
    this.tipoModal = 'asignatura'; this.modoModal = 'agregar';
    this.editandoItemId = null; this.editandoAsinNumero = null;
    this.asignaturasAfinidadModal = [];
    this.formAsignatura.reset();
    this.modalVisible = true; this.cdr.detectChanges();
  }

  abrirEditarAsignatura(a: AsignaturaAfinidadResponse): void {
    this.tipoModal = 'asignatura'; this.modoModal = 'editar';
    this.editandoItemId = a.id; this.editandoAsinNumero = a.numAsignatura;
    this.asignaturasAfinidadModal = [];
    this.formAsignatura.patchValue({ carrera: a.carrera, asignatura: '', semestre: a.semestre });
    const carreraObj = this.carrerasDisponibles.find(c => c.nombre === a.carrera);
    if (carreraObj) {
      this.catalogoService.obtenerAsignaturasPorCarrera(carreraObj.id).subscribe({
        next: (d) => {
          this.asignaturasAfinidadModal = d;
          this.formAsignatura.patchValue({ asignatura: a.asignatura });
          this.cdr.detectChanges();
        }
      });
    }
    this.modalVisible = true; this.cdr.detectChanges();
  }

  private guardarAsignatura(): void {
    if (this.formAsignatura.invalid) { this.formAsignatura.markAllAsTouched(); return; }
    this.modalGuardando = true;
    const numAsignatura = this.modoModal === 'agregar'
      ? this.siguienteNumeroAsignatura
      : this.editandoAsinNumero!;
    const payload = { numAsignatura, ...this.formAsignatura.value };
    const obs = this.modoModal === 'agregar'
      ? this.docenciaService.crearAsignatura(this.reporteId, payload)
      : this.docenciaService.actualizarAsignatura(this.reporteId, this.editandoItemId!, payload);
    obs.subscribe({
      next: (r) => {
        this.asignaturas = this.modoModal === 'agregar' ? [...this.asignaturas, r] : this.asignaturas.map(a => a.id === this.editandoItemId ? r : a);
        this.modalGuardando = false; this.cerrarModal(); this.cdr.detectChanges();
        if (this.modoModal === 'agregar') this.registroAgregado.emit();
        this.notificacion.emit({ msg: this.modoModal === 'agregar' ? 'Asignatura agregada correctamente' : 'Asignatura actualizada', tipo: 'success' });
      },
      error: () => { this.modalGuardando = false; this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Error al guardar la asignatura', tipo: 'error' }); }
    });
  }

  // eliminarAsignatura(id: number): void {
  //   this.docenciaService.eliminarAsignatura(this.reporteId, id).subscribe({
  //     next: () => { this.asignaturas = this.asignaturas.filter(a => a.id !== id); this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Asignatura eliminada', tipo: 'info' }); },
  //     error: () => this.notificacion.emit({ msg: 'Error al eliminar', tipo: 'error' })
  //   });
  // }

  eliminarAsignatura(id: number): void {
    const asignatura = this.asignaturas.find(a => a.id === id)!;
    const numEliminado = asignatura.numAsignatura;
    const afectadas = this.asignaturas.filter(a => a.numAsignatura > numEliminado);

    this.docenciaService.eliminarAsignatura(this.reporteId, id).pipe(
      switchMap(() => {
        if (afectadas.length === 0) return of(null);
        return forkJoin(
          afectadas.map(a =>
            this.docenciaService.actualizarAsignatura(this.reporteId, a.id, {
              numAsignatura: a.numAsignatura - 1,
              carrera:       a.carrera,
              asignatura:    a.asignatura,
              semestre:      a.semestre
            })
          )
        );
      })
    ).subscribe({
      next: () => {
        this.cargarTodo();
        this.cdr.detectChanges();
        this.notificacion.emit({ msg: 'Asignatura eliminada', tipo: 'info' });
      },
      error: () => this.notificacion.emit({ msg: 'Error al eliminar', tipo: 'error' })
    });
  }

  // ── Helpers de template ────────────────────────────────────
  get hayCarreraCurso(): boolean { return !!this.formCurso.get('carrera')?.value; }
  get hayCarreraAfinidad(): boolean { return !!this.formAsignatura.get('carrera')?.value; }
}