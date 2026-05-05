// src/app/features/profesor/sections/gestion-academica/gestion-academica.component.ts
import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GestionDifusionService } from '../../../services/gestion-difusion.service';
import { ActividadGestionResponse } from '../../../../../shared/models/reporte/s4/actividad-gestion.model';

@Component({
  selector: 'app-gestion-academica',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestion-academica.component.html',
  styleUrls: ['./gestion-academica.component.css']
})
export class GestionAcademicaComponent implements OnInit {
  @Input() reporteId!: number;

  private readonly service = inject(GestionDifusionService);
  private readonly fb      = inject(FormBuilder);
  private readonly cdr     = inject(ChangeDetectorRef);

  actividades: ActividadGestionResponse[] = [];
  colapsado          = false;
  mostrarForm        = false;
  editandoId: number | null = null;

  formNuevo!: FormGroup;
  formEdit!:  FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.cargar();
  }

  private initForm(): void {
    this.formNuevo = this.fb.group({
      numActividad:    [null, [Validators.required, Validators.min(1)]],
      nombre:          ['',   [Validators.required, Validators.maxLength(300)]],
      comisionOPuesto: ['',   [Validators.maxLength(300)]],
      periodoInicio:   [''],
      periodoFin:      ['']
    });
  }

  private cargar(): void {
    this.service.obtenerGestion(this.reporteId).subscribe({
      next: (data) => { this.actividades = data; this.cdr.detectChanges(); }
    });
  }

  toggleSeccion(): void { this.colapsado = !this.colapsado; }

  get siguienteNum(): number {
    return this.actividades.length === 0
      ? 1
      : Math.max(...this.actividades.map(a => a.numActividad)) + 1;
  }

  abrir(): void {
    this.mostrarForm = true;
    this.formNuevo.reset();
    this.formNuevo.patchValue({ numActividad: this.siguienteNum });
    this.cdr.detectChanges();
  }
  cancelar(): void {
    this.mostrarForm = false;
    this.formNuevo.reset();
    this.cdr.detectChanges();
  }

  agregar(): void {
    if (this.formNuevo.invalid) { this.formNuevo.markAllAsTouched(); return; }
    const val = this.limpiarFechas(this.formNuevo.value);
    this.service.crearGestion(this.reporteId, val).subscribe({
      next: (a) => {
        this.actividades = [...this.actividades, a];
        this.mostrarForm = false;
        this.formNuevo.reset();
        this.cdr.detectChanges();
      }
    });
  }

  activarEdit(a: ActividadGestionResponse): void {
    this.editandoId = a.id;
    this.formEdit = this.fb.group({
      numActividad:    [a.numActividad,    [Validators.required, Validators.min(1)]],
      nombre:          [a.nombre,          [Validators.required]],
      comisionOPuesto: [a.comisionOPuesto, [Validators.maxLength(300)]],
      periodoInicio:   [a.periodoInicio ?? ''],
      periodoFin:      [a.periodoFin    ?? '']
    });
    this.cdr.detectChanges();
  }

  guardar(id: number): void {
    if (this.formEdit.invalid) { this.formEdit.markAllAsTouched(); return; }
    const val = this.limpiarFechas(this.formEdit.value);
    this.service.actualizarGestion(this.reporteId, id, val).subscribe({
      next: (u) => {
        this.actividades = this.actividades.map(a => a.id === id ? u : a);
        this.editandoId  = null;
        this.cdr.detectChanges();
      }
    });
  }

  eliminar(id: number): void {
    this.service.eliminarGestion(this.reporteId, id).subscribe({
      next: () => {
        this.actividades = this.actividades.filter(a => a.id !== id);
        this.cdr.detectChanges();
      }
    });
  }

  private limpiarFechas(val: any): any {
    return { ...val, periodoInicio: val.periodoInicio || null, periodoFin: val.periodoFin || null };
  }
}