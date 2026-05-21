// investigacion.component.ts
import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InvestigacionService } from '../../../services/investigacion.service';
import { ProyectoInvestigacionResponse } from '../../../../../shared/models/reporte/s3/proyecto-investigacion.model';
import { IndicadorProyectoResponse } from '../../../../../shared/models/reporte/s3/indicador-proyecto.model';
import { PublicacionResponse } from '../../../../../shared/models/reporte/s3/publicacion.model';
import { ActividadDesarrolloResponse } from '../../../../../shared/models/reporte/s3/actividad-desarrollo.model';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-investigacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './investigacion.component.html',
  styleUrls: ['./investigacion.component.css']
})
export class InvestigacionComponent implements OnInit {
  @Input() reporteId!: number;
  @Input() problemasInvestigacion    = '';
  @Input() oportunidadesInvestigacion = '';
  @Output() problemasChange          = new EventEmitter<string>();
  @Output() oportunidadesChange      = new EventEmitter<string>();
  @Output() registroAgregado         = new EventEmitter<void>();
  @Output() solicitarGuardarTextos   = new EventEmitter<void>();
  @Output() notificacion             = new EventEmitter<{msg: string, tipo: string}>();

  private readonly service = inject(InvestigacionService);
  private readonly fb      = inject(FormBuilder);
  private readonly cdr     = inject(ChangeDetectorRef);

  proyectos:    ProyectoInvestigacionResponse[] = [];
  indicadores:  IndicadorProyectoResponse[]     = [];
  publicaciones: PublicacionResponse[]          = [];
  desarrollo:   ActividadDesarrolloResponse[]   = [];

  // mostrarFormProyecto    = false;
  // mostrarFormIndicador   = false;
  // mostrarFormPublicacion = false;
  // mostrarFormDesarrollo  = false;

  // editandoProyectoId:    number | null = null;
  // editandoIndicadorId:   number | null = null;
  // editandoPublicacionId: number | null = null;
  // editandoDesarrolloId:  number | null = null;

  // formNuevoProyecto!:    FormGroup;
  // formNuevoIndicador!:   FormGroup;
  // formNuevaPublicacion!: FormGroup;
  // formNuevoDesarrollo!:  FormGroup;
  // formEditProyecto!:     FormGroup;
  // formEditIndicador!:    FormGroup;
  // formEditPublicacion!:  FormGroup;
  // formEditDesarrollo!:   FormGroup;

  readonly responsabilidadOpciones = [{ val: 'D', label: 'Director' },{ val: 'C', label: 'Colaborador' },{ val: 'O', label: 'Otro' }];
  readonly faseAprobacionOpciones  = [{ val: 'PEU', label: 'Enviado a UNPA' },{ val: 'PEE', label: 'Enviado externo' }];
  readonly instanciaOpciones       = [{ val: 'C', label: 'CONACYT' },{ val: 'P', label: 'PROMEP' },{ val: 'O', label: 'Otra' }];
  readonly fasePublicacionOpciones = [{ val: 'P', label: 'Publicado' },{ val: 'A', label: 'Aceptado' },{ val: 'R', label: 'Revisión' }];

  // ── Reemplaza todo el estado de formularios y métodos ─────────
  modalVisible   = false;
  modalGuardando = false;
  modoModal: 'agregar' | 'editar' = 'agregar';
  tipoModal: 'proyecto' | 'indicador' | 'publicacion' | 'desarrollo' | null = null;
  editandoItemId: number | null = null;

  // Variables para conservar números en modo edición
  editandoProyectoNumero:    number | null = null;
  editandoIndicadorNumero:   number | null = null;
  editandoPublicacionNumero: number | null = null;
  editandoDesarrolloNumero:  number | null = null;

  formProyecto!:    FormGroup;
  formIndicador!:   FormGroup;
  formPublicacion!: FormGroup;
  formDesarrollo!:  FormGroup;

  ngOnInit(): void { this.initForms(); this.cargarTodo(); }

  // private initForms(): void {
  //   this.formNuevoProyecto = this.fb.group({
  //     numProyecto:      [null, [Validators.required, Validators.min(1)]],
  //     titulo:           ['',  Validators.required],
  //     responsabilidad:  ['D', Validators.required],
  //     faseAprobacion:   ['PEU', Validators.required],
  //     instancia:        ['O', Validators.required],
  //     fechaInicio:      [''],
  //     fechaTerminacion: [''],
  //     fechaReprog:      [''],
  //     avancePorcentaje: [null, [Validators.required, Validators.min(0), Validators.max(100)]]
  //   });
  //   this.formNuevoIndicador = this.fb.group({
  //     numProyecto:  [null, [Validators.required, Validators.min(1)]],
  //     numIndicador: [null, [Validators.required, Validators.min(1)]],
  //     descripcion:  ['',  Validators.required]
  //   });
  //   this.formNuevaPublicacion = this.fb.group({
  //     numPublicacion: [null, [Validators.required, Validators.min(1)]],
  //     titulo:         ['',  Validators.required],
  //     revista:        ['',  [Validators.required, Validators.maxLength(300)]],
  //     fase:           ['P', Validators.required],
  //     anio:           [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]]
  //   });
  //   this.formNuevoDesarrollo = this.fb.group({
  //     numActividad:          [null, [Validators.required, Validators.min(1)]],
  //     actividad:             ['',  Validators.required],
  //     institucionSolicitante:['',  Validators.required],
  //     horasRequeridas:       [null, [Validators.required, Validators.min(0)]],
  //     producto:              ['']
  //   });
  // }

  private cargarTodo(): void {
    this.service.obtenerProyectos(this.reporteId).subscribe({
      next: (data) => {
        this.proyectos = data;
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

  // ── Helpers ────────────────────────────────────────────────
  get siguienteNumProyecto():    number { return this.proyectos.length     === 0 ? 1 : Math.max(...this.proyectos.map(p => p.numProyecto))       + 1; }
  get siguienteNumPublicacion(): number { return this.publicaciones.length === 0 ? 1 : Math.max(...this.publicaciones.map(p => p.numPublicacion)) + 1; }
  get siguienteNumDesarrollo():  number { return this.desarrollo.length    === 0 ? 1 : Math.max(...this.desarrollo.map(d => d.numActividad))      + 1; }
  siguienteNumIndicador(proyectoId: number): number {
    const del = this.indicadores.filter(i => i.proyectoId === proyectoId);
    return del.length === 0 ? 1 : Math.max(...del.map(i => i.numIndicador)) + 1;
  }
  private limpiarFechasProyecto(val: any): any {
    return { ...val, fechaInicio: val.fechaInicio || null, fechaTerminacion: val.fechaTerminacion || null, fechaReprog: val.fechaReprog || null };
  }

  // private initForms(): void {
  //   this.formProyecto = this.fb.group({
  //     numProyecto:      [null, [Validators.required, Validators.min(1)]],
  //     titulo:           ['',  Validators.required],
  //     responsabilidad:  ['D', Validators.required],
  //     faseAprobacion:   ['PEU', Validators.required],
  //     instancia:        ['O', Validators.required],
  //     fechaInicio:      [''],
  //     fechaTerminacion: [''],
  //     fechaReprog:      [''],
  //     avancePorcentaje: [null, [Validators.required, Validators.min(0), Validators.max(100)]]
  //   });
  //   this.formIndicador = this.fb.group({
  //     numProyecto:  [null, [Validators.required, Validators.min(1)]],
  //     numIndicador: [null, [Validators.required, Validators.min(1)]],
  //     descripcion:  ['',  Validators.required]
  //   });
  //   this.formPublicacion = this.fb.group({
  //     numPublicacion: [null, [Validators.required, Validators.min(1)]],
  //     titulo:         ['',  Validators.required],
  //     revista:        ['',  Validators.required],
  //     fase:           ['P', Validators.required],
  //     anio:           [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]]
  //   });
  //   this.formDesarrollo = this.fb.group({
  //     numActividad:          [null, [Validators.required, Validators.min(1)]],
  //     actividad:             ['',  Validators.required],
  //     institucionSolicitante:['',  Validators.required],
  //     horasRequeridas:       [null, [Validators.required, Validators.min(0)]],
  //     producto:              ['']
  //   });
  // }

  private initForms(): void {
    this.formProyecto = this.fb.group({
      titulo:           ['',  Validators.required],
      responsabilidad:  ['D', Validators.required],
      faseAprobacion:   ['PEU', Validators.required],
      instancia:        ['O', Validators.required],
      fechaInicio:      ['',  Validators.required],
      fechaTerminacion: [''],  // opcional
      fechaReprog:      ['']   // opcional
    });
    this.formIndicador = this.fb.group({
      numProyecto:  [null, [Validators.required, Validators.min(1)]],
      descripcion:  ['',   Validators.required]
    });
    this.formPublicacion = this.fb.group({
      titulo:  ['',  Validators.required],
      revista: ['',  Validators.required],
      fase:    ['P', Validators.required],
      anio:    [new Date().getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]]
    });
    this.formDesarrollo = this.fb.group({
      actividad:             ['',  Validators.required],
      institucionSolicitante:['',  Validators.required],
      horasRequeridas:       [null, [Validators.required, Validators.min(0)]],
      producto:              ['']  // opcional
    });
  }

  get modalTitulo(): string {
    const p = this.modoModal === 'agregar' ? 'Agregar' : 'Editar';
    const n: Record<string, string> = {
      proyecto: 'proyecto de investigación', indicador: 'indicador cuantitativo',
      publicacion: 'publicación', desarrollo: 'actividad de desarrollo'
    };
    return `${p} ${n[this.tipoModal ?? 'proyecto']}`;
  }

  // cerrarModal(): void {
  //   this.modalVisible = false; this.modalGuardando = false;
  //   this.tipoModal = null; this.editandoItemId = null;
  //   this.cdr.detectChanges();
  // }

  cerrarModal(): void {
    this.modalVisible = false; this.modalGuardando = false;
    this.tipoModal = null; this.editandoItemId = null;
    this.editandoProyectoNumero    = null;
    this.editandoIndicadorNumero   = null;
    this.editandoPublicacionNumero = null;
    this.editandoDesarrolloNumero  = null;
    this.cdr.detectChanges();
  }

  guardarModal(): void {
    if (this.tipoModal === 'proyecto')    this.guardarProyecto();
    else if (this.tipoModal === 'indicador')   this.guardarIndicador();
    else if (this.tipoModal === 'publicacion') this.guardarPublicacion();
    else if (this.tipoModal === 'desarrollo')  this.guardarDesarrollo();
  }

  // ── PROYECTOS ──────────────────────────────────────────────
  abrirAgregarProyecto(): void {
    this.tipoModal = 'proyecto'; this.modoModal = 'agregar';
    this.editandoItemId = null; this.editandoProyectoNumero = null;
    this.formProyecto.reset({ responsabilidad: 'D', faseAprobacion: 'PEU', instancia: 'O' });
    this.modalVisible = true; this.cdr.detectChanges();
  }

  abrirEditarProyecto(p: ProyectoInvestigacionResponse): void {
    this.tipoModal = 'proyecto'; this.modoModal = 'editar';
    this.editandoItemId = p.id; this.editandoProyectoNumero = p.numProyecto;
    this.formProyecto.patchValue({
      titulo: p.titulo, responsabilidad: p.responsabilidad,
      faseAprobacion: p.faseAprobacion, instancia: p.instancia,
      fechaInicio:      p.fechaInicio      ?? '',
      fechaTerminacion: p.fechaTerminacion ?? '',
      fechaReprog:      p.fechaReprog      ?? ''
    });
    this.modalVisible = true; this.cdr.detectChanges();
  }

  private guardarProyecto(): void {
    if (this.formProyecto.invalid) { this.formProyecto.markAllAsTouched(); return; }
    this.modalGuardando = true;
    const numProyecto = this.modoModal === 'agregar'
      ? this.siguienteNumProyecto
      : this.editandoProyectoNumero!;
    const val = {
      numProyecto,
      ...this.formProyecto.value,
      fechaTerminacion: this.formProyecto.value.fechaTerminacion || null,
      fechaReprog:      this.formProyecto.value.fechaReprog      || null
    };
    const obs = this.modoModal === 'agregar'
      ? this.service.crearProyecto(this.reporteId, val)
      : this.service.actualizarProyecto(this.reporteId, this.editandoItemId!, val);
    obs.subscribe({
      next: (r) => {
        this.proyectos = this.modoModal === 'agregar' ? [...this.proyectos, r] : this.proyectos.map(p => p.id === this.editandoItemId ? r : p);
        this.modalGuardando = false; this.cerrarModal(); this.cdr.detectChanges();
        if (this.modoModal === 'agregar') this.registroAgregado.emit();
        this.notificacion.emit({ msg: this.modoModal === 'agregar' ? 'Proyecto agregado correctamente' : 'Proyecto actualizado', tipo: 'success' });
      },
      error: () => { this.modalGuardando = false; this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Error al guardar el proyecto', tipo: 'error' }); }
    });
  }

  eliminarProyecto(id: number): void {
    this.service.eliminarProyecto(this.reporteId, id).subscribe({
      next: () => { this.proyectos = this.proyectos.filter(p => p.id !== id); this.indicadores = this.indicadores.filter(i => i.proyectoId !== id); this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Proyecto eliminado', tipo: 'info' }); },
      error: () => this.notificacion.emit({ msg: 'Error al eliminar', tipo: 'error' })
    });
  }


  // ── INDICADORES ────────────────────────────────────────────
  abrirAgregarIndicador(): void {
    this.tipoModal = 'indicador'; this.modoModal = 'agregar';
    this.editandoItemId = null; this.editandoIndicadorNumero = null;
    const primer = this.proyectos[0];
    this.formIndicador.reset(primer ? { numProyecto: primer.numProyecto } : {});
    this.modalVisible = true; this.cdr.detectChanges();
  }

  abrirEditarIndicador(i: IndicadorProyectoResponse): void {
    this.tipoModal = 'indicador'; this.modoModal = 'editar';
    this.editandoItemId = i.id; this.editandoIndicadorNumero = i.numIndicador;
    this.formIndicador.patchValue({ numProyecto: i.numProyecto, descripcion: i.descripcion });
    this.modalVisible = true; this.cdr.detectChanges();
  }

  private guardarIndicador(): void {
    if (this.formIndicador.invalid) { this.formIndicador.markAllAsTouched(); return; }
    const proyecto = this.proyectos.find(p => p.numProyecto === this.formIndicador.value.numProyecto);
    if (!proyecto) { this.notificacion.emit({ msg: 'El proyecto seleccionado no existe', tipo: 'error' }); return; }
    this.modalGuardando = true;
    const numIndicador = this.modoModal === 'agregar'
      ? this.siguienteNumIndicador(proyecto.id)
      : this.editandoIndicadorNumero!;
    const payload = { ...this.formIndicador.value, numIndicador };
    const obs = this.modoModal === 'agregar'
      ? this.service.crearIndicador(proyecto.id, payload)
      : this.service.actualizarIndicador(proyecto.id, this.editandoItemId!, payload);
    obs.subscribe({
      next: (r) => {
        this.indicadores = this.modoModal === 'agregar' ? [...this.indicadores, r] : this.indicadores.map(i => i.id === this.editandoItemId ? r : i);
        this.modalGuardando = false; this.cerrarModal(); this.cdr.detectChanges();
        if (this.modoModal === 'agregar') this.registroAgregado.emit();
        this.notificacion.emit({ msg: this.modoModal === 'agregar' ? 'Indicador agregado correctamente' : 'Indicador actualizado', tipo: 'success' });
      },
      error: () => { this.modalGuardando = false; this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Error al guardar el indicador', tipo: 'error' }); }
    });
  }

  eliminarIndicador(proyectoId: number, id: number): void {
    this.service.eliminarIndicador(proyectoId, id).subscribe({
      next: () => { this.indicadores = this.indicadores.filter(i => i.id !== id); this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Indicador eliminado', tipo: 'info' }); },
      error: () => this.notificacion.emit({ msg: 'Error al eliminar', tipo: 'error' })
    });
  }

  // ── PUBLICACIONES ──────────────────────────────────────────
  abrirAgregarPublicacion(): void {
    this.tipoModal = 'publicacion'; this.modoModal = 'agregar';
    this.editandoItemId = null; this.editandoPublicacionNumero = null;
    this.formPublicacion.reset({ fase: 'P', anio: new Date().getFullYear() });
    this.modalVisible = true; this.cdr.detectChanges();
  }

  abrirEditarPublicacion(p: PublicacionResponse): void {
    this.tipoModal = 'publicacion'; this.modoModal = 'editar';
    this.editandoItemId = p.id; this.editandoPublicacionNumero = p.numPublicacion;
    this.formPublicacion.patchValue({
      titulo: p.titulo, revista: p.revista, fase: p.fase, anio: p.anio
    });
    this.modalVisible = true; this.cdr.detectChanges();
  }

  private guardarPublicacion(): void {
    if (this.formPublicacion.invalid) { this.formPublicacion.markAllAsTouched(); return; }
    this.modalGuardando = true;
    const numPublicacion = this.modoModal === 'agregar'
      ? this.siguienteNumPublicacion
      : this.editandoPublicacionNumero!;
    const payload = { numPublicacion, ...this.formPublicacion.value };
    const obs = this.modoModal === 'agregar'
      ? this.service.crearPublicacion(this.reporteId, payload)
      : this.service.actualizarPublicacion(this.reporteId, this.editandoItemId!, payload);
    obs.subscribe({
      next: (r) => {
        this.publicaciones = this.modoModal === 'agregar' ? [...this.publicaciones, r] : this.publicaciones.map(p => p.id === this.editandoItemId ? r : p);
        this.modalGuardando = false; this.cerrarModal(); this.cdr.detectChanges();
        if (this.modoModal === 'agregar') this.registroAgregado.emit();
        this.notificacion.emit({ msg: this.modoModal === 'agregar' ? 'Publicación agregada correctamente' : 'Publicación actualizada', tipo: 'success' });
      },
      error: () => { this.modalGuardando = false; this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Error al guardar la publicación', tipo: 'error' }); }
    });
  }

  eliminarPublicacion(id: number): void {
    this.service.eliminarPublicacion(this.reporteId, id).subscribe({
      next: () => { this.publicaciones = this.publicaciones.filter(p => p.id !== id); this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Publicación eliminada', tipo: 'info' }); },
      error: () => this.notificacion.emit({ msg: 'Error al eliminar', tipo: 'error' })
    });
  }

  // ── DESARROLLO ─────────────────────────────────────────────
  abrirAgregarDesarrollo(): void {
    this.tipoModal = 'desarrollo'; this.modoModal = 'agregar';
    this.editandoItemId = null; this.editandoDesarrolloNumero = null;
    this.formDesarrollo.reset();
    this.modalVisible = true; this.cdr.detectChanges();
  }

  abrirEditarDesarrollo(d: ActividadDesarrolloResponse): void {
    this.tipoModal = 'desarrollo'; this.modoModal = 'editar';
    this.editandoItemId = d.id; this.editandoDesarrolloNumero = d.numActividad;
    this.formDesarrollo.patchValue({
      actividad: d.actividad, institucionSolicitante: d.institucionSolicitante,
      horasRequeridas: d.horasRequeridas, producto: d.producto ?? ''
    });
    this.modalVisible = true; this.cdr.detectChanges();
  }

  private guardarDesarrollo(): void {
    if (this.formDesarrollo.invalid) { this.formDesarrollo.markAllAsTouched(); return; }
    this.modalGuardando = true;
    const numActividad = this.modoModal === 'agregar'
      ? this.siguienteNumDesarrollo
      : this.editandoDesarrolloNumero!;
    const payload = { numActividad, ...this.formDesarrollo.value, producto: this.formDesarrollo.value.producto || null };
    const obs = this.modoModal === 'agregar'
      ? this.service.crearDesarrollo(this.reporteId, payload)
      : this.service.actualizarDesarrollo(this.reporteId, this.editandoItemId!, payload);
    obs.subscribe({
      next: (r) => {
        this.desarrollo = this.modoModal === 'agregar' ? [...this.desarrollo, r] : this.desarrollo.map(d => d.id === this.editandoItemId ? r : d);
        this.modalGuardando = false; this.cerrarModal(); this.cdr.detectChanges();
        if (this.modoModal === 'agregar') this.registroAgregado.emit();
        this.notificacion.emit({ msg: this.modoModal === 'agregar' ? 'Actividad agregada correctamente' : 'Actividad actualizada', tipo: 'success' });
      },
      error: () => { this.modalGuardando = false; this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Error al guardar la actividad', tipo: 'error' }); }
    });
  }

  eliminarDesarrollo(id: number): void {
    this.service.eliminarDesarrollo(this.reporteId, id).subscribe({
      next: () => { this.desarrollo = this.desarrollo.filter(d => d.id !== id); this.cdr.detectChanges(); this.notificacion.emit({ msg: 'Actividad eliminada', tipo: 'info' }); },
      error: () => this.notificacion.emit({ msg: 'Error al eliminar', tipo: 'error' })
    });
  }

}