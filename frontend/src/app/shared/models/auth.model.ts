export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  mensaje: string;
  token: string;
  usuario: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
