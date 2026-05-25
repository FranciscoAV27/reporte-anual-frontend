// src/app/features/profesor/sections/distribucion-tiempo/distribucion-tiempo.component.ts
import { Component, Input, OnInit, inject, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DistribucionTiempoService } from '../../../services/distribucion-tiempo.service';
import { DistribucionTiempoResponse, FILAS_DISTRIBUCION } from '../../../../../shared/models/reporte/s7/distribucion-tiempo.model';
import { ReporteResponse } from '../../../../../shared/models/reporte/reporte.model';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-distribucion-tiempo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './distribucion-tiempo.component.html',
  styleUrls: ['./distribucion-tiempo.component.css']
})
export class DistribucionTiempoComponent implements OnInit {
  @Input() reporteId!: number;
  @Input() reporte!: ReporteResponse;
  @Output() registroAgregado = new EventEmitter<void>();

  private readonly service = inject(DistribucionTiempoService);
  private readonly fb      = inject(FormBuilder);
  private readonly cdr     = inject(ChangeDetectorRef);

  filas: DistribucionTiempoResponse[] = [];
  colapsado  = false;
  cargando   = true;
  guardando  = false;

  // FormGroup con un control por cada fila y periodo
  tablaForm!: FormGroup;

  readonly filasDefinicion = FILAS_DISTRIBUCION;

  ngOnInit(): void {
    this.service.obtener(this.reporteId).subscribe({
      next: (data) => {
        if (data.length === 0) {
          this.crearFilasIniciales();
        } else {
          this.filas = this.ordenarFilas(data);
          this.buildForm();
          this.cargando = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  private ordenarFilas(data: DistribucionTiempoResponse[]): DistribucionTiempoResponse[] {
    return data.sort((a, b) => a.orden - b.orden);
  }

  private crearFilasIniciales(): void {
    const requests = FILAS_DISTRIBUCION.map(f =>
      this.service.crear(this.reporteId, {
        actividadAcademica: f.actividadAcademica,
        orden: f.orden,
        horasCicloOi: 0,
        horasCicloPv: 0,
        horasVerano: 0
      })
    );

    forkJoin(requests).subscribe({
      next: (creadas) => {
        this.filas = this.ordenarFilas(creadas);
        this.buildForm();
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildForm(): void {
    const controls: Record<string, FormGroup> = {};
    this.filas.forEach(f => {
      controls[`fila_${f.id}`] = this.fb.group({
        horasCicloOi: [f.horasCicloOi ?? 0, [Validators.required, Validators.min(0)]],
        horasCicloPv: [f.horasCicloPv ?? 0, [Validators.required, Validators.min(0)]],
        horasVerano:  [f.horasVerano  ?? 0, [Validators.required, Validators.min(0)]],
      });
    });
    this.tablaForm = this.fb.group(controls);
  }

  getControl(filaId: number, campo: string) {
    return this.tablaForm.get(`fila_${filaId}.${campo}`);
  }

  // ── Totales calculados ─────────────────────────────────────
  get totalOi(): number {
    return this.filas.reduce((sum, f) => sum + (Number(this.getControl(f.id, 'horasCicloOi')?.value) || 0), 0);
  }
  get totalPv(): number {
    return this.filas.reduce((sum, f) => sum + (Number(this.getControl(f.id, 'horasCicloPv')?.value) || 0), 0);
  }
  get totalVerano(): number {
    return this.filas.reduce((sum, f) => sum + (Number(this.getControl(f.id, 'horasVerano')?.value) || 0), 0);
  }

  toggleSeccion(): void { this.colapsado = !this.colapsado; }

  guardar(): void {
    if (this.tablaForm.invalid || this.guardando) return;
    this.guardando = true;

    const requests = this.filas.map(f => {
      const val = this.tablaForm.get(`fila_${f.id}`)?.value;
      return this.service.actualizar(this.reporteId, f.id, {
        actividadAcademica: f.actividadAcademica,
        orden:              f.orden,
        horasCicloOi:       Number(val.horasCicloOi),
        horasCicloPv:       Number(val.horasCicloPv),
        horasVerano:        Number(val.horasVerano),
      });
    });

    forkJoin(requests).subscribe({
      next: (actualizadas) => {
        this.filas    = this.ordenarFilas(actualizadas);
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // get fechaEnvio(): string {
  //   return this.reporte?.enviadoEn
  //     ? new Date(this.reporte.enviadoEn).toLocaleDateString('es-MX')
  //     : '—';
  // }
}