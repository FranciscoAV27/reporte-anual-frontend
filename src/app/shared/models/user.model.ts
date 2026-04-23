// shared/models/user.model.ts
export type Rol = 'PROFESOR' | 'SECRETARIA' | 'JEFE_CARRERA' | 'ADMIN';

export interface Usuario {
  id: number;
  numeroTrabajo: string;
  nombre: string;
  rol: Rol;
}

// shared/models/auth.model.ts
export interface LoginRequest {
  numeroTrabajo: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  rol: Rol;
}