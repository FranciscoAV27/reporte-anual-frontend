// src/app/shared/models/auth.model.ts

export interface LoginRequest {
  numeroTrabajo: string;
  contrasena: string;
}

export interface AuthResponse {
  token: string;
  rol: string;
}