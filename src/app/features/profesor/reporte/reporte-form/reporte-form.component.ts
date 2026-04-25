// src/app/features/profesor/reporte/reporte-form/reporte-form.component.ts

import { Component, OnInit, inject, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ReporteService } from '../../services/reporte.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ReporteResponse } from '../../../../shared/models/reporte/reporte.model';
import { DocenciaComponent } from '../sections/docencia/docencia.component';


@Component({
  selector: 'app-reporte-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DocenciaComponent],
  templateUrl: './reporte-form.component.html',
  styleUrls: ['./reporte-form.component.css']
})
export class ReporteFormComponent implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef); // ← agrega esto

  reporte: ReporteResponse | null = null;
  cargando = true;
  guardando = false;
  errorMsg = '';
  toastMsg = '';
  toastTipo = '';

  readonly anioActual = new Date().getFullYear();

  // Campos de texto del reporte (problemasDocencia, oportunidadesDocencia, etc.)
  // Se poblará cuando cargue el reporte y se enviará con "Guardar borrador"
  textosForm: FormGroup = this.fb.group({
    problemasDocencia: [''],
    oportunidadesDocencia: [''],
  });

  // ngOnInit(): void {

  //   this.reporteService.obtenerMisReportes().subscribe({
  //     next: (reportes) => {
  //       const existente = reportes.find(r => r.anio === this.anioActual);
  //       if (existente) {
  //         this.reporte = existente;
  //         this.poblarTextos(existente);
  //         this.cargando = false;
  //       } else {
  //         this.reporteService.crear({ anio: this.anioActual }).subscribe({
  //           next: (nuevo) => { this.reporte = nuevo; this.cargando = false; },
  //           error: () => { this.errorMsg = 'No se pudo crear el reporte.'; this.cargando = false; }
  //         });
  //       }
  //     },
  //     error: () => { this.errorMsg = 'Error al cargar reportes.'; this.cargando = false; }
  //   });
  // }

  // reporte-form.component.ts
  // ngOnInit(): void {
  //   console.log('ngOnInit ejecutado');
    
  //   this.reporteService.obtenerMisReportes().subscribe({
  //     next: (reportes) => {
  //       console.log('Reportes recibidos:', reportes);
        
  //       const existente = reportes.find(r => r.anio === this.anioActual);
  //       console.log('Reporte existente encontrado:', existente);

  //       if (existente) {
  //         this.reporte = existente;
  //         this.poblarTextos(existente);
  //         this.cargando = false;
  //         console.log('cargando seteado a false');
  //       } else {
  //         console.log('No existe reporte, creando uno nuevo...');
  //         this.reporteService.crear({ anio: this.anioActual }).subscribe({
  //           next: (nuevo) => {
  //             console.log('Reporte creado:', nuevo);
  //             this.reporte = nuevo;
  //             this.cargando = false;
  //           },
  //           error: (err) => {
  //             console.error('Error al crear reporte:', err);
  //             this.errorMsg = `No se pudo crear el reporte. (${err.status})`;
  //             this.cargando = false;
  //           }
  //         });
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error al obtener reportes:', err);
  //       this.errorMsg = `Error al cargar reportes. (${err.status})`;
  //       this.cargando = false;
  //     }
  //   });
  // }

  // ngOnInit(): void {
  //   this.reporteService.obtenerMisReportes().subscribe({
  //     next: (reportes) => {
  //       const existente = reportes.find(r => r.anio === this.anioActual);
  //       if (existente) {
  //         this.reporte = existente;
  //         this.poblarTextos(existente);
  //       } else {
  //         this.reporteService.crear({ anio: this.anioActual }).subscribe({
  //           next: (nuevo) => {
  //             this.reporte = nuevo;
  //             this.cargando = false;
  //             this.cdr.detectChanges(); // ← aquí
  //           },
  //           error: (err) => {
  //             this.errorMsg = `No se pudo crear el reporte. (${err.status})`;
  //             this.cargando = false;
  //             this.cdr.detectChanges(); // ← aquí
  //           }
  //         });
  //       }
  //       this.cargando = false;
  //       this.cdr.detectChanges(); // ← y aquí
  //     },
  //     error: (err) => {
  //       this.errorMsg = `Error al cargar reportes. (${err.status})`;
  //       this.cargando = false;
  //       this.cdr.detectChanges(); // ← aquí
  //     }
  //   });
  // }

  ngOnInit(): void {
    this.reporteService.obtenerMisReportes().subscribe({
      next: (reportes) => {
        const existente = reportes.find(r => r.anio === this.anioActual);
        if (existente) {
          this.reporte = existente;
          this.poblarTextos(existente);
        } else {
          this.reporteService.crear({ anio: this.anioActual }).subscribe({
            next: (nuevo) => {
              this.reporte = nuevo;
              this.cargando = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              this.errorMsg = `No se pudo crear el reporte. (${err.status})`;
              this.cargando = false;
              this.cdr.detectChanges();
            }
          });
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = `Error al cargar reportes. (${err.status})`;
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private poblarTextos(r: ReporteResponse): void {
    this.textosForm.patchValue({
      problemasDocencia: r.problemasDocencia ?? '',
      oportunidadesDocencia: r.oportunidadesDocencia ?? ''
    });
  }

  // guardarBorrador(): void {
  //   if (!this.reporte) return;
  //   this.guardando = true;
  //   const dto = { anio: this.anioActual, ...this.textosForm.value };
  //   this.reporteService.guardarBorrador(this.reporte.id, dto).subscribe({
  //     next: (updated) => {
  //       this.reporte = updated;
  //       this.guardando = false;
  //       this.mostrarToast('Borrador guardado correctamente', 'success');
  //     },
  //     error: () => {
  //       this.guardando = false;
  //       this.mostrarToast('Error al guardar el borrador', 'error');
  //     }
  //   });
  // }

  guardarBorrador(): void {
    if (!this.reporte) return;
    this.guardando = true;
    const dto = { anio: this.anioActual, ...this.textosForm.value };
    this.reporteService.guardarBorrador(this.reporte.id, dto).subscribe({
      next: (updated) => {
        this.reporte = updated;
        this.guardando = false;
        this.cdr.detectChanges(); // ← faltaba esto
        this.mostrarToast('Borrador guardado correctamente', 'success');
      },
      error: () => {
        this.guardando = false;
        this.cdr.detectChanges(); // ← y esto
        this.mostrarToast('Error al guardar el borrador', 'error');
      }
    });
  }

  private mostrarToast(msg: string, tipo: string): void {
    this.toastMsg = msg;
    this.toastTipo = tipo;
    setTimeout(() => { this.toastMsg = ''; }, 3400);
  }

  logout(): void { this.authService.logout(); }

  get inicialesProfesor(): string {
    return this.reporte?.profesorNombre
      ?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? 'P';
  }
}