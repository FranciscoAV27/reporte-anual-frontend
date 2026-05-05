// src/app/features/profesor/reporte/sections/investigacion/investigacion.component.ts
import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InvestigacionService } from '../../../services/investigacion.service';
import { ProyectoInvestigacionResponse } from '../../../../../shared/models/reporte/s3/proyecto-investigacion.model';
import { IndicadorProyectoResponse } from '../../../../../shared/models/reporte/s3/indicador-proyecto.model';
import { PublicacionResponse } from '../../../../../shared/models/reporte/s3/publicacion.model';
import { ActividadDesarrolloResponse } from '../../../../../shared/models/reporte/s3/actividad-desarrollo.model';

@Component({
  selector: 'app-investigacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './investigacion.component.html',
  styleUrls: ['./investigacion.component.css']
})
export class InvestigacionComponent implements OnInit {
  @Input() reporteId!: number;
  @Input() problemasInvestigacion   = '';
  @Input() oportunidadesInvestigacion = '';
  @Output() problemasChange     = new EventEmitter<string>();
  @Output() oportunidadesChange = new EventEmitter<string>();

  private readonly service = inject(InvestigacionService);
  private readonly fb      = inject(FormBuilder);
  private readonly cdr     = inject(ChangeDetectorRef);

  proyectos:   ProyectoInvestigacionResponse[] = [];
  indicadores: IndicadorProyectoResponse[]     = [];
  publicaciones: PublicacionResponse[]         = [];
  desarrollo:  ActividadDesarrolloResponse[]   = [];
  colapsado    = false;

  mostrarFormProyecto:    boolean = false;
  mostrarFormIndicador:   boolean = false;
  mostrarFormPublicacion: boolean = false;
  mostrarFormDesarrollo:  boolean = false;

  editandoProyectoId:    number | null = null;
  editandoIndicadorId:   number | null = null;
  editandoPublicacionId: number | null = null;
  editandoDesarrolloId:  number | null = null;

  formNuevoProyecto!:    FormGroup;
  formNuevoIndicador!:   FormGroup;
  formNuevaPublicacion!: FormGroup;
  formNuevoDesarrollo!:  FormGroup;
  formEditProyecto!:     FormGroup;
  formEditIndicador!:    FormGroup;
  formEditPublicacion!:  FormGroup;
  formEditDesarrollo!:   FormGroup;

  readonly responsabilidadOpciones = [
    { val: 'D', label: 'Director' },
    { val: 'C', label: 'Colaborador' },
    { val: 'O', label: 'Otro' }
  ];
  readonly faseAprobacionOpciones = [
    { val: 'PEU', label: 'Enviado a UNPA' },
    { val: 'PEE', label: 'Enviado externo' }
  ];
  readonly instanciaOpciones = [
    { val: 'C', label: 'CONACYT' },
    { val: 'P', label: 'PROMEP' },
    { val: 'O', label: 'Otra' }
  ];
  readonly fasePublicacionOpciones = [
    { val: 'P', label: 'Publicado' },
    { val: 'A', label: 'Aceptado' },
    { val: 'R', label: 'Revisión' }
  ];

  ngOnInit(): void {
    this.initForms();
    this.cargarTodo();
  }

  private initForms(): void {
    this.formNuevoProyecto = this.fb.group({
      numProyecto:      [null, [Validators.required, Validators.min(1)]],
      titulo:           ['',   Validators.required],
      responsabilidad:  ['D',  Validators.required],
      faseAprobacion:   ['PEU', Validators.required],
      instancia:        ['O',  Validators.required],
      fechaInicio:      [''],
      fechaTerminacion: [''],
      fechaReprog:      [''],
      avancePorcentaje: [null, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
    this.formNuevoIndicador = this.fb.group({
      numProyecto:  [null, [Validators.required, Validators.min(1)]],
      numIndicador: [null, [Validators.required, Validators.min(1)]],
      descripcion:  ['',   Validators.required]
    });
    this.formNuevaPublicacion = this.fb.group({
      numPublicacion: [null, [Validators.required, Validators.min(1)]],
      titulo:         ['',  Validators.required],
      revista:        ['',  [Validators.required, Validators.maxLength(300)]],
      fase:           ['P', Validators.required],
      anio:           [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]]
    });
    this.formNuevoDesarrollo = this.fb.group({
      numActividad:          [null, [Validators.required, Validators.min(1)]],
      actividad:             ['',  [Validators.required, Validators.maxLength(300)]],
      institucionSolicitante:['',  [Validators.required, Validators.maxLength(300)]],
      horasRequeridas:       [null, [Validators.required, Validators.min(0)]],
      producto:              ['']
    });
  }

  private cargarTodo(): void {
    this.service.obtenerProyectos(this.reporteId).subscribe({
      next: (data) => {
        this.proyectos = data;
        // Cargar indicadores de todos los proyectos
        data.forEach(p => {
          this.service.obtenerIndicadores(p.id).subscribe({
            next: (ind) => {
              this.indicadores = [...this.indicadores.filter(i => i.proyectoId !== p.id), ...ind];
              this.cdr.detectChanges();
            }
          });
        });
        this.cdr.detectChanges();
      }
    });
    this.service.obtenerPublicaciones(this.reporteId).subscribe({
      next: (data) => { this.publicaciones = data; this.cdr.detectChanges(); }
    });
    this.service.obtenerDesarrollo(this.reporteId).subscribe({
      next: (data) => { this.desarrollo = data; this.cdr.detectChanges(); }
    });
  }

  toggleSeccion(): void { this.colapsado = !this.colapsado; }

  // ── Helpers autonumeración ────────────────────────────────
  get siguienteNumProyecto():    number { return this.proyectos.length     === 0 ? 1 : Math.max(...this.proyectos.map(p => p.numProyecto))    + 1; }
  get siguienteNumPublicacion(): number { return this.publicaciones.length === 0 ? 1 : Math.max(...this.publicaciones.map(p => p.numPublicacion)) + 1; }
  get siguienteNumDesarrollo():  number { return this.desarrollo.length    === 0 ? 1 : Math.max(...this.desarrollo.map(d => d.numActividad))   + 1; }
  siguienteNumIndicador(proyectoId: number): number {
    const del = this.indicadores.filter(i => i.proyectoId === proyectoId);
    return del.length === 0 ? 1 : Math.max(...del.map(i => i.numIndicador)) + 1;
  }
  getNombreProyecto(proyectoId: number): string {
    return this.proyectos.find(p => p.id === proyectoId)?.titulo ?? `Proyecto ${proyectoId}`;
  }

  // ── PROYECTOS ──────────────────────────────────────────────
  abrirFormProyecto(): void {
    this.mostrarFormProyecto = true;
    this.formNuevoProyecto.reset({ responsabilidad: 'D', faseAprobacion: 'PEU', instancia: 'O' });
    this.formNuevoProyecto.patchValue({ numProyecto: this.siguienteNumProyecto });
    this.cdr.detectChanges();
  }
  cancelarFormProyecto(): void { this.mostrarFormProyecto = false; this.formNuevoProyecto.reset(); this.cdr.detectChanges(); }

  agregarProyecto(): void {
    if (this.formNuevoProyecto.invalid) { this.formNuevoProyecto.markAllAsTouched(); return; }
    const val = this.limpiarFechasProyecto(this.formNuevoProyecto.value);
    this.service.crearProyecto(this.reporteId, val).subscribe({
      next: (p) => {
        this.proyectos = [...this.proyectos, p];
        this.mostrarFormProyecto = false;
        this.formNuevoProyecto.reset();
        this.cdr.detectChanges();
      }
    });
  }
  activarEditProyecto(p: ProyectoInvestigacionResponse): void {
    this.editandoProyectoId = p.id;
    this.formEditProyecto = this.fb.group({
      numProyecto:      [p.numProyecto,      [Validators.required]],
      titulo:           [p.titulo,           Validators.required],
      responsabilidad:  [p.responsabilidad,  Validators.required],
      faseAprobacion:   [p.faseAprobacion,   Validators.required],
      instancia:        [p.instancia,        Validators.required],
      fechaInicio:      [p.fechaInicio      ?? ''],
      fechaTerminacion: [p.fechaTerminacion ?? ''],
      fechaReprog:      [p.fechaReprog      ?? ''],
      avancePorcentaje: [p.avancePorcentaje, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
    this.cdr.detectChanges();
  }
  guardarProyecto(id: number): void {
    if (this.formEditProyecto.invalid) { this.formEditProyecto.markAllAsTouched(); return; }
    const val = this.limpiarFechasProyecto(this.formEditProyecto.value);
    this.service.actualizarProyecto(this.reporteId, id, val).subscribe({
      next: (u) => { this.proyectos = this.proyectos.map(p => p.id === id ? u : p); this.editandoProyectoId = null; this.cdr.detectChanges(); }
    });
  }
  eliminarProyecto(id: number): void {
    this.service.eliminarProyecto(this.reporteId, id).subscribe({
      next: () => {
        this.proyectos   = this.proyectos.filter(p => p.id !== id);
        this.indicadores = this.indicadores.filter(i => i.proyectoId !== id);
        this.cdr.detectChanges();
      }
    });
  }
  private limpiarFechasProyecto(val: any): any {
    return { ...val, fechaInicio: val.fechaInicio || null, fechaTerminacion: val.fechaTerminacion || null, fechaReprog: val.fechaReprog || null };
  }

  // ── INDICADORES ────────────────────────────────────────────
  abrirFormIndicador(): void {
    this.mostrarFormIndicador = true;
    this.formNuevoIndicador.reset();
    if (this.proyectos.length > 0) {
      const primerProyecto = this.proyectos[0].id;
      this.formNuevoIndicador.patchValue({
        numProyecto:  this.proyectos[0].numProyecto,
        numIndicador: this.siguienteNumIndicador(primerProyecto)
      });
    }
    this.cdr.detectChanges();
  }
  cancelarFormIndicador(): void { this.mostrarFormIndicador = false; this.formNuevoIndicador.reset(); this.cdr.detectChanges(); }

  agregarIndicador(): void {
    if (this.formNuevoIndicador.invalid) { this.formNuevoIndicador.markAllAsTouched(); return; }
    const numProyecto = this.formNuevoIndicador.value.numProyecto;
    const proyecto = this.proyectos.find(p => p.numProyecto === numProyecto);
    if (!proyecto) { alert('El número de proyecto no existe.'); return; }
    this.service.crearIndicador(proyecto.id, this.formNuevoIndicador.value).subscribe({
      next: (i) => {
        this.indicadores = [...this.indicadores, i];
        this.mostrarFormIndicador = false;
        this.formNuevoIndicador.reset();
        this.cdr.detectChanges();
      }
    });
  }
  activarEditIndicador(i: IndicadorProyectoResponse): void {
    this.editandoIndicadorId = i.id;
    this.formEditIndicador = this.fb.group({
      numProyecto:  [i.numProyecto,  [Validators.required]],
      numIndicador: [i.numIndicador, [Validators.required]],
      descripcion:  [i.descripcion,  Validators.required]
    });
    this.cdr.detectChanges();
  }
  guardarIndicador(i: IndicadorProyectoResponse): void {
    if (this.formEditIndicador.invalid) { this.formEditIndicador.markAllAsTouched(); return; }
    const proyecto = this.proyectos.find(p => p.numProyecto === this.formEditIndicador.value.numProyecto);
    if (!proyecto) { alert('El número de proyecto no existe.'); return; }
    this.service.actualizarIndicador(proyecto.id, i.id, this.formEditIndicador.value).subscribe({
      next: (u) => { this.indicadores = this.indicadores.map(x => x.id === i.id ? u : x); this.editandoIndicadorId = null; this.cdr.detectChanges(); }
    });
  }
  eliminarIndicador(proyectoId: number, id: number): void {
    this.service.eliminarIndicador(proyectoId, id).subscribe({
      next: () => { this.indicadores = this.indicadores.filter(i => i.id !== id); this.cdr.detectChanges(); }
    });
  }

  // ── PUBLICACIONES ──────────────────────────────────────────
  abrirFormPublicacion(): void {
    this.mostrarFormPublicacion = true;
    this.formNuevaPublicacion.reset({ fase: 'P', anio: new Date().getFullYear() });
    this.formNuevaPublicacion.patchValue({ numPublicacion: this.siguienteNumPublicacion });
    this.cdr.detectChanges();
  }
  cancelarFormPublicacion(): void { this.mostrarFormPublicacion = false; this.formNuevaPublicacion.reset(); this.cdr.detectChanges(); }

  agregarPublicacion(): void {
    if (this.formNuevaPublicacion.invalid) { this.formNuevaPublicacion.markAllAsTouched(); return; }
    this.service.crearPublicacion(this.reporteId, this.formNuevaPublicacion.value).subscribe({
      next: (p) => { this.publicaciones = [...this.publicaciones, p]; this.mostrarFormPublicacion = false; this.formNuevaPublicacion.reset(); this.cdr.detectChanges(); }
    });
  }
  activarEditPublicacion(p: PublicacionResponse): void {
    this.editandoPublicacionId = p.id;
    this.formEditPublicacion = this.fb.group({
      numPublicacion: [p.numPublicacion, Validators.required],
      titulo:         [p.titulo,         Validators.required],
      revista:        [p.revista,        Validators.required],
      fase:           [p.fase,           Validators.required],
      anio:           [p.anio,           [Validators.required, Validators.min(2000), Validators.max(2100)]]
    });
    this.cdr.detectChanges();
  }
  guardarPublicacion(id: number): void {
    if (this.formEditPublicacion.invalid) { this.formEditPublicacion.markAllAsTouched(); return; }
    this.service.actualizarPublicacion(this.reporteId, id, this.formEditPublicacion.value).subscribe({
      next: (u) => { this.publicaciones = this.publicaciones.map(p => p.id === id ? u : p); this.editandoPublicacionId = null; this.cdr.detectChanges(); }
    });
  }
  eliminarPublicacion(id: number): void {
    this.service.eliminarPublicacion(this.reporteId, id).subscribe({
      next: () => { this.publicaciones = this.publicaciones.filter(p => p.id !== id); this.cdr.detectChanges(); }
    });
  }

  // ── DESARROLLO ─────────────────────────────────────────────
  abrirFormDesarrollo(): void {
    this.mostrarFormDesarrollo = true;
    this.formNuevoDesarrollo.reset();
    this.formNuevoDesarrollo.patchValue({ numActividad: this.siguienteNumDesarrollo });
    this.cdr.detectChanges();
  }
  cancelarFormDesarrollo(): void { this.mostrarFormDesarrollo = false; this.formNuevoDesarrollo.reset(); this.cdr.detectChanges(); }

  agregarDesarrollo(): void {
    if (this.formNuevoDesarrollo.invalid) { this.formNuevoDesarrollo.markAllAsTouched(); return; }
    this.service.crearDesarrollo(this.reporteId, this.formNuevoDesarrollo.value).subscribe({
      next: (d) => { this.desarrollo = [...this.desarrollo, d]; this.mostrarFormDesarrollo = false; this.formNuevoDesarrollo.reset(); this.cdr.detectChanges(); }
    });
  }
  activarEditDesarrollo(d: ActividadDesarrolloResponse): void {
    this.editandoDesarrolloId = d.id;
    this.formEditDesarrollo = this.fb.group({
      numActividad:          [d.numActividad,           Validators.required],
      actividad:             [d.actividad,              Validators.required],
      institucionSolicitante:[d.institucionSolicitante, Validators.required],
      horasRequeridas:       [d.horasRequeridas,        [Validators.required, Validators.min(0)]],
      producto:              [d.producto ?? '']
    });
    this.cdr.detectChanges();
  }
  guardarDesarrollo(id: number): void {
    if (this.formEditDesarrollo.invalid) { this.formEditDesarrollo.markAllAsTouched(); return; }
    this.service.actualizarDesarrollo(this.reporteId, id, this.formEditDesarrollo.value).subscribe({
      next: (u) => { this.desarrollo = this.desarrollo.map(d => d.id === id ? u : d); this.editandoDesarrolloId = null; this.cdr.detectChanges(); }
    });
  }
  eliminarDesarrollo(id: number): void {
    this.service.eliminarDesarrollo(this.reporteId, id).subscribe({
      next: () => { this.desarrollo = this.desarrollo.filter(d => d.id !== id); this.cdr.detectChanges(); }
    });
  }
}