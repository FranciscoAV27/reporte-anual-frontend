// src/app/features/auth/login/login.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  loginForm: FormGroup = this.fb.group({
    numeroTrabajo: ['', [Validators.required]],
    contrasena: ['', [Validators.required, Validators.minLength(6)]],
  });

  errorMensaje = '';
  cargando = false;
  mostrarContrasena = false;

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.errorMensaje = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.cargando = false;
        this.authService.redirigirSegunRol();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMensaje =
          err.status === 401
            ? 'Número de trabajo o contraseña incorrectos.'
            : 'Error de conexión. Intenta más tarde.';
      },
    });
  }

  // Helpers para el template
  get numeroTrabajo() { return this.loginForm.get('numeroTrabajo'); }
  get contrasena() { return this.loginForm.get('contrasena'); }
}